import { Denops, ensureString, execute, lo } from "./deps.ts";
import { highlight } from "./highlight.ts";
import { Tokenizer } from "./token.ts";

export function main(denops: Denops): void {
  denops.dispatcher = {
    async highlight(_: unknown): Promise<void> {
      const filepath = await denops.call("expand", "%:p") as string;
      const filetype = await lo.get(denops, "filetype") as string;
      const tokenizer = new Tokenizer(denops);
      const tokens = await tokenizer.parse(ensureString(filepath), filetype);
      if (tokens !== null) {
        highlight(denops, tokens);
      }
    },
  };

  execute(
    denops,
    `command! -nargs=0 VsctmHl call denops#request('${denops.name}', 'highlight', [])`,
  );
}
