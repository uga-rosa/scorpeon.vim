import {
  Denops,
  expandGlobSync,
  fromFileUrl,
  IRawGrammar,
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

interface Grammar {
  language: string;
  scopeName: string;
  path: string;
}

interface PackageJson {
  contributes: {
    languages: Language[];
    grammars: Grammar[];
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
      loadGrammar: async (scopeName: string): Promise<IRawGrammar | null> => {
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
    const __dirname = fromFileUrl(new URL(".", import.meta.url));
    const wasmBin = Deno.readFileSync(
      join(__dirname, "..", "..", "bin", "onig.wasm"),
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
        const _languages: Language[] | undefined = jsonData
          ?.contributes
          ?.languages
          ?.filter((v) => v.id && v.extensions);
        if (_languages) {
          languages = [...languages, ..._languages];
        }
        const _grammars: Grammar[] | undefined = jsonData
          ?.contributes
          ?.grammars
          ?.filter((v) => v.language && v.scopeName && v.path)
          ?.map((v) => {
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

  async getScopeName(filepath: string): Promise<string> {
    const language = this.languages
      .filter((v) => v.extensions.some((ext) => filepath.endsWith(ext)))
      ?.[0]
      ?.id;
    if (language == null) {
      throw new Error(`Path with unknown extensions: ${filepath}`);
    }
    const scopeName = this.grammars
      .filter((v) => v.language === language)
      ?.[0]
      ?.scopeName;
    if (scopeName == null) {
      throw new Error(`Unknown language: ${language}`);
    }
    return await Promise.resolve(scopeName);
  }

  async parse(
    bufnr: number,
    scopeName: string,
    lines: string[],
  ): Promise<Token[]> {
    if (!this.prevDatas[bufnr]) {
      this.prevDatas[bufnr] = {
        lines: [],
        stacks: [],
        tokens: [],
      };
    }
    const prevData = this.prevDatas[bufnr];

    const firstModifiedLine = lines.findIndex((e, i) =>
      e !== prevData.lines[i]
    );
    if (firstModifiedLine === -1) {
      // No change
      return prevData.tokens;
    } else {
      prevData.tokens = prevData.tokens.filter((token) =>
        token.line < firstModifiedLine
      );
    }

    return await this.registry.loadGrammar(scopeName).then(
      (grammar: vsctm.IGrammar | null): Token[] => {
        if (grammar == null) {
          return [];
        }
        const tokens = [];
        let ruleStack = prevData.stacks[firstModifiedLine - 1] || vsctm.INITIAL;
        for (let i = firstModifiedLine; i < lines.length; i++) {
          const line = lines[i];
          const lineTokens = grammar.tokenizeLine(line, ruleStack);
          for (const token of lineTokens.tokens) {
            const startIndex = toByteIndex(line, token.startIndex);
            const endIndex = toByteIndex(line, token.endIndex);
            tokens.push({
              line: i + 1,
              column: startIndex + 1,
              length: endIndex - startIndex,
              scopes: token.scopes,
            });
          }
          ruleStack = lineTokens.ruleStack;
          prevData.stacks[i] = lineTokens.ruleStack;
        }
        prevData.lines = lines;
        prevData.tokens = [...prevData.tokens, ...tokens];
        return tokens;
      },
    );
  }
}

const toByteIndex = (str: string, idx: number): number => {
  return (new TextEncoder()).encode(str.slice(0, idx)).length;
};
