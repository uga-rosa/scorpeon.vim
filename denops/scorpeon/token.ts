import {
  cache_dir,
  Denops,
  expandGlobSync,
  join,
  oniguruma,
  vsctm,
} from "./deps.ts";

export interface Token {
  line: number;
  column: number;
  length: number;
  scopes: string[];
}

interface Language {
  id: string;
  extensions: string[];
}

const isLanguage = (obj: unknown): obj is Language => {
  return obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    "extensions" in obj;
};

interface Grammar {
  language: string;
  scopeName: string;
  path: string;
}

const isGrammar = (obj: unknown): obj is Grammar => {
  return obj !== null &&
    typeof obj === "object" &&
    "language" in obj &&
    "scopeName" in obj &&
    "path" in obj;
};

interface PackageJson {
  contributes?: {
    languages?: {
      id?: string;
      extensions?: string[];
    }[];
    grammars?: {
      language?: string;
      scopeName?: string;
      path?: string;
    }[];
  };
}

interface PrevData {
  lines: string[];
  stacks: vsctm.StateStack[];
  tokens: Token[];
}

export class Tokenizer {
  denops: Denops;
  languages: Language[];
  grammars: Grammar[];
  registry: vsctm.Registry;
  prevDatas: { [bufnr: number]: PrevData };

  constructor(denops: Denops, dirs: string[]) {
    this.denops = denops;
    [this.languages, this.grammars] = this.readPackageJsons(dirs);
    this.registry = new vsctm.Registry({
      onigLib: this.getOnigLib(),
      loadGrammar: async (scopeName: string) => {
        const grammarPath = this.grammars
          .filter((v) => v.scopeName === scopeName)
          ?.[0]
          ?.path;
        if (grammarPath == null) {
          return null;
        }
        return await Deno.readTextFile(grammarPath)
          .then((data: string) => vsctm.parseRawGrammar(data, grammarPath));
      },
    });
    this.prevDatas = {};
  }

  async getOnigLib(): Promise<vsctm.IOnigLib> {
    const cache = cache_dir();
    if (cache == null) {
      return Promise.reject("Can't get cache directory");
    }
    const wasmBin = Deno.readFileSync(
      join(
        cache,
        "deno",
        "npm",
        "registry.npmjs.org",
        "vscode-oniguruma",
        "1.6.2",
        "release",
        "onig.wasm",
      ),
    );
    return await oniguruma.loadWASM(wasmBin).then(() => {
      return {
        createOnigScanner(patterns: string[]) {
          return new oniguruma.OnigScanner(patterns);
        },
        createOnigString(s: string) {
          return new oniguruma.OnigString(s);
        },
      };
    });
  }

  readPackageJsons(dirs: string[]): [Language[], Grammar[]] {
    let languages: Language[] = [];
    let grammars: Grammar[] = [];
    for (const dir of dirs) {
      for (const entry of expandGlobSync(`${dir}/*/package.json`)) {
        const text = Deno.readTextFileSync(entry.path);
        const jsonData: PackageJson = JSON.parse(text);
        const _languages = jsonData
          ?.contributes
          ?.languages
          ?.filter(isLanguage);
        if (_languages) {
          languages = [...languages, ..._languages];
        }
        const _grammars = jsonData
          ?.contributes
          ?.grammars
          ?.filter(isGrammar)
          .map((v) => {
            v.path = join(entry.path, "..", v.path);
            return v;
          });
        if (_grammars) {
          grammars = [...grammars, ..._grammars];
        }
      }
    }
    grammars = grammars.sort((a, b) => a.scopeName.length - b.scopeName.length);
    return [languages, grammars];
  }

  getScopeName(filepath: string): Promise<string> {
    const language = this.languages
      .filter((v) => v.extensions.some((ext) => filepath.endsWith(ext)))
      ?.[0]
      ?.id;
    if (language == null) {
      return Promise.reject(`Path with unknown extensions: ${filepath}`);
    }
    const scopeName = this.grammars
      .filter((v) => v.language === language)
      ?.[0]
      ?.scopeName;
    if (scopeName == null) {
      return Promise.reject(`Unknown language: ${language}`);
    }
    return Promise.resolve(scopeName);
  }

  async parse(
    bufnr: number,
    scopeName: string,
    lines: string[],
  ): Promise<[Token[], number]> {
    if (!this.prevDatas[bufnr]) {
      this.prevDatas[bufnr] = {
        lines: [],
        stacks: [],
        tokens: [],
      };
    }
    const prevData = this.prevDatas[bufnr];

    // First changed line. Parsing is only needed after this line.
    const start = lines.findIndex((e, i) => e !== prevData.lines[i]);
    if (start === -1) {
      // No change
      return [prevData.tokens, start];
    } else {
      prevData.tokens = prevData.tokens.filter((token) => token.line < start);
    }

    return await this.registry.loadGrammar(scopeName)
      .then((grammar: vsctm.IGrammar | null): [Token[], number] => {
        if (grammar == null) {
          return [[], 0];
        }
        const tokens = [];
        let ruleStack = prevData.stacks[start - 1] ||
          vsctm.INITIAL;
        for (let i = start; i < lines.length; i++) {
          const line = lines[i];
          const lineTokens = grammar.tokenizeLine(line, ruleStack);
          for (const itoken of lineTokens.tokens) {
            const startIndex = toByteIndex(line, itoken.startIndex);
            const endIndex = toByteIndex(line, itoken.endIndex);
            const token = {
              line: i + 1,
              column: startIndex + 1,
              length: endIndex - startIndex,
              scopes: itoken.scopes,
            };
            tokens.push(token);
            prevData.tokens.push(token);
          }
          ruleStack = lineTokens.ruleStack;
          prevData.stacks[i] = lineTokens.ruleStack;
        }
        prevData.lines = lines;
        return [tokens, start];
      });
  }
}

const toByteIndex = (str: string, idx: number): number => {
  return (new TextEncoder()).encode(str.slice(0, idx)).length;
};
