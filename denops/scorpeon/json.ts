import { expandGlobSync, join } from "./deps.ts";

export interface Language {
  id: string;
  extensions: string[];
}

const isLanguage = (obj: unknown): obj is Language => {
  return obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    "extensions" in obj;
};

export interface Grammar {
  language: string;
  scopeName: string;
  path: string;
}

const isGrammar = (obj: unknown): obj is Grammar => {
  return obj !== null &&
    typeof obj === "object" &&
    "language" in obj &&
    "scopeName" in obj &&
    "path" in obj;
};

interface PackageJson {
  contributes?: {
    languages?: {
      id?: string;
      extensions?: string[];
    }[];
    grammars?: {
      language?: string;
      scopeName?: string;
      path?: string;
    }[];
  };
}

export const readPackageJsons = (dirs: string[]): [Language[], Grammar[]] => {
  let languages: Language[] = [];
  let grammars: Grammar[] = [];
  for (const dir of dirs) {
    for (const entry of expandGlobSync(`${dir}/*/package.json`)) {
      const text = Deno.readTextFileSync(entry.path);
      const jsonData: PackageJson = JSON.parse(text);
      const _languages = jsonData
        ?.contributes
        ?.languages
        ?.filter(isLanguage);
      if (_languages) {
        languages = [...languages, ..._languages];
      }
      const _grammars = jsonData
        ?.contributes
        ?.grammars
        ?.filter(isGrammar)
        ?.map((v) => {
          v.path = join(entry.path, "..", v.path);
          return v;
        });
      if (_grammars) {
        grammars = [...grammars, ..._grammars];
      }
    }
  }
  grammars = grammars.sort((a, b) => a.scopeName.length - b.scopeName.length);
  return [languages, grammars];
};
