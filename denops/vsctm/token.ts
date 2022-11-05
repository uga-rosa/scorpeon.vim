import {
  Denops,
  expandGlobSync,
  IRawGrammar,
  join,
  fromFileUrl,
  oniguruma,
  vsctm,
} from "./deps.ts";

export interface Token {
  row: number;
  start: number;
  end: number;
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

export class Tokenizer {
  denops: Denops;
  languages: Language[];
  grammars: Grammar[];
  registry: vsctm.Registry;

  constructor(denops: Denops, dir: string) {
    this.denops = denops;
    [this.languages, this.grammars] = this.readPackageJsons(dir);
    this.registry = new vsctm.Registry({
      onigLib: this.getOnigLib(),
      loadGrammar: async (scopeName: string): Promise<IRawGrammar | null> => {
        const grammarPath = this.grammars
          .filter((v) => v.scopeName == scopeName)
          ?.[0]
          ?.path;
        if (grammarPath == null) {
          return null;
        }
        return await Deno.readTextFile(grammarPath)
          .then((data: string) => vsctm.parseRawGrammar(data, grammarPath));
      },
    });
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

  readPackageJsons(dir: string): [Language[], Grammar[]] {
    let languages: Language[] = [];
    let grammars: Grammar[] = [];
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
        ?.sort((a, b) => a.scopeName.length - b.scopeName.length)
        ?.map((v) => {
          v.path = join(entry.path, "..", v.path);
          return v;
        });
      if (_grammars) {
        grammars = [...grammars, ..._grammars];
      }
    }
    return [languages, grammars];
  }

  async parse(filepath: string): Promise<Token[]> {
    if (this.registry === undefined) {
      throw new Error("Failed to initialize");
    }

    const language = this.languages
      .filter((v) => v.extensions.some((ext) => filepath.endsWith(ext)))
      ?.[0]
      ?.id;
    if (language == null) {
      throw new Error(`Path with unknown extension: ${filepath}`);
    }
    const scopeName = this.grammars
      .filter((v) => v.language === language)
      ?.[0]
      ?.scopeName;
    if (scopeName == null) {
      throw new Error(`Unknown language: ${language}`);
    }

    return await this.registry.loadGrammar(scopeName).then(
      (grammar: vsctm.IGrammar | null): Token[] => {
        if (grammar == null) {
          return [];
        }
        const lines = Deno.readTextFileSync(filepath).split("\n");
        const tokens = [];
        let ruleStack = vsctm.INITIAL;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineTokens = grammar.tokenizeLine(line, ruleStack);
          for (let j = 0; j < lineTokens.tokens.length; j++) {
            const token = lineTokens.tokens[j];
            tokens.push({
              row: i,
              start: toByteIndex(line, token.startIndex),
              end: toByteIndex(line, token.endIndex),
              scopes: token.scopes,
            });
          }
          ruleStack = lineTokens.ruleStack;
        }
        return tokens;
      },
    );
  }
}

const toByteIndex = (str: string, idx: number): number => {
  return (new TextEncoder()).encode(str.slice(0, idx)).length;
};
