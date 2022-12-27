import {
  assertNumber,
  copy,
  decompress,
  Denops,
  join,
  readAll,
  readerFromStreamReader,
} from "./deps.ts";
import { dirExists } from "./utils.ts";

type Extension = {
  url: string;
  files: {
    download: string;
    icon: string;
  };
  name: string;
  namespace: string;
  version: string;
  timestamp: string;
  averageRating: number;
  downloadCount: number;
  displayName: string;
  description: string;
};

export const install = async (denops: Denops, input: string, dir: string) => {
  const response = await fetch(
    "https://open-vsx.org/api/-/search?" + new URLSearchParams({
      query: input,
      category: "Programming Languages",
      targetPlatform: "universal",
      size: "100",
      sortBy: "relevance",
    }).toString(),
    {
      headers: {
        method: "GET",
        accept: "application/json",
      },
    },
  );

  if (response.body == null) {
    console.log("[scorpeon.vim] fetch failed.");
    return;
  }

  const bytes = await readAll(
    readerFromStreamReader(response.body.getReader()),
  );
  const result_json = JSON.parse((new TextDecoder()).decode(bytes));
  const extensions: Extension[] = result_json.extensions
    .filter((e: Extension) => e.description.match(/support/i));

  if (extensions.length === 0) {
    console.log("[scorpeon.vim] No results found.");
    return;
  }

  const candidates = [
    "Select one of:",
    ...extensions.map((e, i) => `${i + 1}. ${e.name}: ${e.description}`),
  ];
  const selected = await denops.call("inputlist", candidates);
  assertNumber(selected);
  const extension = extensions[selected - 1];
  if (extension == null) {
    console.log(`[scorpeon.vim] Invalid number: ${selected}`);
    return;
  }

  await downloadAndUnzip(denops, extension, dir);
};

const downloadAndUnzip = async (
  denops: Denops,
  extension: Extension,
  dir: string,
) => {
  const target = join(dir, extension.name);
  if (dirExists(target)) {
    const resp = await denops.call(
      "input",
      `${extension.name} is already installed. Overwrite? (y/n): `,
      "y",
    );
    if (resp !== "y") {
      console.log("[scorpeon.vim] Installation is cancelled.");
      return;
    }
    await Deno.remove(target, { recursive: true });
  }

  console.log("[scorpeon.vim] Downloading...");
  const path = await download(extension.files.download);
  console.log("[scorpeon.vim] Done");

  if (path) {
    console.log("[scorpeon.vim] Unpacking...");
    await decompress(path, `${path}.unzipped`);

    await Deno.mkdir(target);
    await Deno.rename(join(`${path}.unzipped`, "extension"), target);
    console.log("[scorpeon.vim] Done");

    await Deno.remove(path);
    await Deno.remove(`${path}.unzipped`, { recursive: true });
  } else {
    console.log("Fail to download.")
  }
};

const download = async (url: string): Promise<string | undefined> => {
  const response = await fetch(url);
  const rsr = response.body?.getReader();
  if (!rsr) {
    return;
  }
  const reader = readerFromStreamReader(rsr);
  const tempFilePath = await Deno.makeTempFile();
  const file = await Deno.open(tempFilePath, {
    create: true,
    write: true,
  });
  await copy(reader, file);
  file.close();
  return tempFilePath;
};
