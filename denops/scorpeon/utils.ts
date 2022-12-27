export const fileExists = (filepath: string): boolean => {
  try {
    const file_info = Deno.statSync(filepath);
    return file_info.isFile;
  } catch {
    return false;
  }
};

export const dirExists = (filepath: string): boolean => {
  try {
    const file_info = Deno.statSync(filepath);
    return file_info.isDirectory;
  } catch {
    return false;
  }
};
