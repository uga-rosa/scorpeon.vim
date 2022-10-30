import { Denops, g, IRawGrammar, join, oniguruma, vsctm } from "./deps.ts";

export interface Token {
  row: number;
  start: number;
  end: number;
  scopes: string[];
}

export class Tokenizer {
  denops: Denops;
  registry: vsctm.Registry;

  constructor(denops: Denops) {
    this.denops = denops;
    this.registry = new vsctm.Registry({
      onigLib: this.getOnigLib(),
      loadGrammar: async (scopeName: string): Promise<IRawGrammar | null> => {
        const matched = scopeName.match(/source\.(.+)/);
        if (matched === null) {
          return null;
        }
        const filetype = matched[1];
        const grammarPath = await this.getGrammarPath(filetype);
        if (grammarPath === null) {
          return null;
        }
        return await Deno.readTextFile(grammarPath).then((
          data: string,
        ) => vsctm.parseRawGrammar(data, grammarPath));
      },
    });
  }

  async getOnigLib(): Promise<vsctm.IOnigLib> {
    const __dirname = new URL(".", import.meta.url).pathname;
    const pluginRoot = join(__dirname, "../..");
    const wasmBin = Deno.readFileSync(join(pluginRoot, "bin/onig.wasm"));
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

  async getGrammarPath(filetype: string): Promise<string | null> {
    if (!this.denops) {
      return null;
    }
    const vsctmSyntaxesDir = await g.get(
      this.denops,
      "vsctmSyntaxesDir",
    ) as string;
    for await (const entry of Deno.readDir(vsctmSyntaxesDir)) {
      if (
        entry.name.endsWith(filetype + ".json") ||
        entry.name.endsWith(filetype + ".plist")
      ) {
        return join(vsctmSyntaxesDir, entry.name);
      }
    }
    return null;
  }

  async parse(filepath: string, filetype: string): Promise<Token[] | null> {
    if (this.registry === undefined) {
      return null;
    }
    const lines = Deno.readTextFileSync(filepath).split("\n");
    return await this.registry.loadGrammar("source." + filetype).then(
      (grammar: vsctm.IGrammar | null): Token[] => {
        if (grammar === null) {
          return [];
        }
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
