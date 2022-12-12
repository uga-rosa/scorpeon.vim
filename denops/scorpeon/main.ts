import {
  assertArray,
  assertNumber,
  assertObject,
  assertString,
  batch,
  Denops,
  g,
  gather,
} from "./deps.ts";
import { Highlight, Rule } from "./highlight.ts";
import { Tokenizer } from "./token.ts";

export async function main(denops: Denops): Promise<void> {
  const [extensionPath, userRule] = await gather(denops, async (denops) => {
    await g.get(denops, "scorpeon_extensions_path");
    await g.get(denops, "scorpeon_rule");
  }) as [unknown, unknown];

  assertArray<string>(extensionPath);
  assertObject<Rule>(userRule);

  const tokenizer = new Tokenizer(extensionPath);

  denops.dispatcher = {
    async highlight(
      bufnr: unknown,
      path: unknown,
      lines: unknown,
      end: unknown,
    ): Promise<void> {
      assertNumber(bufnr);
      assertString(path);
      assertArray<string>(lines);
      assertNumber(end);
      if (!fileExists(path)) {
        return;
      }
      try {
        const scopeName = await tokenizer.getScopeName(path);
        const [tokens, start] = await tokenizer.parse(
          bufnr,
          scopeName,
          lines,
        );
        const spcRule = userRule[scopeName] || {};
        const highlight = new Highlight(bufnr, spcRule);
        if (start >= 0) {
          await denops.call("scorpeon#clear", start, end);
          await highlight.set(
            denops,
            tokens.filter((t) => start <= t.line && t.line <= end),
          );
        } else {
          // No change
          // Re-highlight entire buffer
          await denops.call("scorpeon#clear", 0, -1);
          await highlight.set(denops, tokens);
        }
      } catch (e) {
        console.log(`[scorpeon.vim] ${e}`);
        denops.call("scorpeon#disable");
      }
    },

    async showScope(
      bufnr: unknown,
      path: unknown,
      lines: unknown,
    ): Promise<void> {
      assertNumber(bufnr);
      assertString(path);
      assertArray<string>(lines);

      if (!fileExists(path)) {
        return;
      }
      try {
        const scopeName = await tokenizer.getScopeName(path);
        const [tokens] = await tokenizer.parse(bufnr, scopeName, lines);
        await batch(denops, async (denops) => {
          await denops.cmd("vnew");
          await denops.cmd("set buftype=nofile");
          await denops.cmd("setf scorpeon");
          await denops.call("setline", 1, `scopeName: ${scopeName}`);
          await denops.call(
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
        });
      } catch (e) {
        console.log(`[scorpeon.vim] ${e}`);
      }
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
