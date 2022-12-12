import {
  Denops,
  ensureArray,
  ensureNumber,
  ensureObject,
  ensureString,
  g,
} from "./deps.ts";
import { Highlight, Rule } from "./highlight.ts";
import { Tokenizer } from "./token.ts";

export async function main(denops: Denops): Promise<void> {
  const extensions_path = ensureArray<string>(
    await g.get(
      denops,
      "scorpeon_extensions_path",
    ),
  );
  const tokenizer = new Tokenizer(extensions_path);
  const user_rule = ensureObject<Rule>(
    await g.get(
      denops,
      "scorpeon_rule",
    ),
  );

  denops.dispatcher = {
    async highlight(
      bufnr_u: unknown,
      path_u: unknown,
      lines_u: unknown,
      end_u: unknown,
    ): Promise<void> {
      const bufnr = ensureNumber(bufnr_u);
      const path = ensureString(path_u);
      const end = ensureNumber(end_u);
      const lines = ensureArray<string>(lines_u);
      if (!fileExists(path)) {
        return;
      }

      await tokenizer.getScopeName(path)
        .then(async (scopeName) => {
          const [tokens, start] = await tokenizer.parse(
            bufnr,
            scopeName,
            lines,
          );
          const spc_rule = user_rule[scopeName] || {};
          const highlight = new Highlight(denops, bufnr, spc_rule);
          if (start >= 0) {
            await denops.call("scorpeon#clear", start, end);
            await highlight.set(
              tokens.filter((t) => start <= t.line && t.line <= end),
            );
          } else {
            // No change
            // Re-highlight entire buffer
            await denops.call("scorpeon#clear", 0, -1);
            await highlight.set(tokens);
          }
        })
        .catch((e) => {
          console.log(`[scorpeon.vim] ${e}`);
          denops.cmd("set syntax=ON");
        });
    },
    async showScope(
      bufnr_u: unknown,
      path_u: unknown,
      lines_u: unknown,
    ): Promise<void> {
      const bufnr = ensureNumber(bufnr_u);
      const path = ensureString(path_u);
      const lines = ensureArray<string>(lines_u);
      if (!fileExists(path)) {
        return;
      }

      await tokenizer.getScopeName(path)
        .then(async (scopeName) => {
          const [tokens] = await tokenizer.parse(bufnr, scopeName, lines);
          denops.cmd("vnew");
          denops.cmd("set buftype=nofile");
          denops.cmd("setf scorpeon");
          denops.call("setline", 1, `scopeName: ${scopeName}`);
          denops.call(
            "setline",
            2,
            tokens.flatMap((token) => {
              const scopes = token.scopes.join(", ");
              const range =
                `\t[${token.line}, ${token.column}] - [${token.line}, ${
                  token.column + token.length
                }]`;
              return [scopes, range];
            }),
          );
        })
        .catch((e) => {
          console.log(`[scorpeon.vim] ${e}`);
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
