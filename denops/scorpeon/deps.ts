export { default as vsctm } from "npm:vscode-textmate@7.0.3";
export { default as oniguruma } from "npm:vscode-oniguruma@1.6.2";

export { fromFileUrl, join } from "https://deno.land/std@0.170.0/path/mod.ts";
export { expandGlobSync } from "https://deno.land/std@0.170.0/fs/mod.ts";
export { readAll } from "https://deno.land/std@0.170.0/streams/read_all.ts";
export { readerFromStreamReader } from "https://deno.land/std@0.170.0/streams/reader_from_stream_reader.ts";
export { copy } from "https://deno.land/std@0.170.0/streams/copy.ts";

export type { Denops } from "https://deno.land/x/denops_std@v3.12.0/mod.ts";
export { g } from "https://deno.land/x/denops_std@v3.12.0/variable/variable.ts";
export {
  batch,
  gather,
} from "https://deno.land/x/denops_std@v3.12.0/batch/mod.ts";
export {
  decorate,
  undecorate,
} from "https://deno.land/x/denops_std@v3.12.0/buffer/mod.ts";

export {
  assertArray,
  assertBoolean,
  assertNumber,
  assertObject,
  assertString,
} from "https://deno.land/x/unknownutil@v2.1.0/mod.ts";

export { default as cache_dir } from "https://deno.land/x/dir@1.5.1/cache_dir/mod.ts";

export { decompress } from "https://deno.land/x/zip@v1.2.4/mod.ts";
