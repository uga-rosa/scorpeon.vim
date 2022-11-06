import { Denops, ensureArray, ensureString, g } from "./deps.ts";
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
    async highlight(path: unknown, lines: unknown): Promise<void> {
      const filepath = ensureString(path);
      if (!fileExists(filepath)) {
        return;
      }
      await tokenizer.parse(filepath, ensureArray<string>(lines))
        .then(([tokens, scopeName]) => {
          highlight(denops, tokens, user_rule[scopeName] || {});
        })
        .catch(() => {
          denops.cmd("set syntax=ON");
        });
    },
    async showScope(path: unknown, lines: unknown): Promise<void> {
      const filepath = ensureString(path);
      if (!fileExists(filepath)) {
        return;
      }
      await tokenizer.parse(filepath, ensureArray<string>(lines))
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
                `\t[${token.row}, ${token.start}] - [${token.row}, ${token.end}]`;
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
