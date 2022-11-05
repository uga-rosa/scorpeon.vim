import { getHighlightGroup } from "./common.ts";
import { Denops } from "./deps.ts";
import { Token } from "./token.ts";

export const highlight = (denops: Denops, tokens: Token[]) => {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const group = getHighlightGroup(token.scopes);
    if (group === null) {
      continue;
    }
    denops.call("vsctm#add_hl", group, token.row, token.start, token.end);
  }
};
