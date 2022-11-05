import { Denops, ensureString, g } from "./deps.ts";
import { highlight } from "./highlight.ts";
import { Tokenizer } from "./token.ts";

export async function main(denops: Denops): Promise<void> {
  const extensions_path = await g.get(
    denops,
    "vsctm_extensions_path",
  ) as string;
  const tokenizer = new Tokenizer(denops, extensions_path);

  denops.dispatcher = {
    async highlight(path: unknown): Promise<void> {
      const filepath = ensureString(path);
      if (!fileExists(filepath)) {
        return;
      }
      tokenizer.parse(filepath).then((tokens) =>
        highlight(denops, tokens)
      ).catch(_ => {});
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
