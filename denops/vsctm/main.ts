import { Denops, ensureArray, ensureNumber, ensureString, g } from "./deps.ts";
import { highlight, Rule } from "./highlight.ts";
import { Tokenizer } from "./token.ts";

export async function main(denops: Denops): Promise<void> {
  const extensions_path = await g.get(
    denops,
    "vsctm_extensions_path",
  ) as string;
  const tokenizer = new Tokenizer(denops, extensions_path);
  const user_rule = await g.get(
    denops,
    "vsctm_rule",
  ) as { [scopeName: string]: Rule };

  denops.dispatcher = {
    async highlight(
      path_u: unknown,
      lines_u: unknown,
      bufnr_u: unknown,
    ): Promise<void> {
      const path = ensureString(path_u);
      const lines = ensureArray<string>(lines_u);
      const bufnr = ensureNumber(bufnr_u);
      if (!fileExists(path)) {
        return;
      }
      await tokenizer.parse(path, lines)
        .then(([tokens, scopeName]) => {
          highlight(denops, bufnr, tokens, user_rule[scopeName] || {});
        })
        .catch(() => {
          denops.cmd("set syntax=ON");
        });
    },
    async showScope(path_u: unknown, lines_u: unknown): Promise<void> {
      const path = ensureString(path_u);
      const lines = ensureArray<string>(lines_u);
      if (!fileExists(path)) {
        return;
      }
      await tokenizer.parse(path, lines)
        .then(([tokens, scopeName]) => {
          denops.cmd("vnew");
          denops.cmd("set buftype=nofile");
          denops.call("setline", 1, `scopeName: ${scopeName}`);
          denops.call(
            "setline",
            2,
            tokens.map((token) => {
              const scopes = token.scopes.join(", ");
              const range =
                `\t[${token.line}, ${token.column}] - [${token.line}, ${
                  token.column + token.length
                }]`;
              return [scopes, range];
            }).flat(),
          );
        })
        .catch((e) => {
          denops.cmd("echom '[dps-vsctm.vim] Fail to parse'");
          denops.cmd(`echom '[dps-vsctm.vim] ${e}'`);
        });
    },
  };
}

const fileExists = (filepath: string): boolean => {
  try {
    const file = Deno.statSync(filepath);
    return file.isFile;
  } catch {
    return false;
  }
};
