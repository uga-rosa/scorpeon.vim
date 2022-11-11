import { decorate, Denops } from "./deps.ts";
import { Token } from "./token.ts";

export const highlight = async (
  denops: Denops,
  bufnr: number,
  tokens: Token[],
  spc_rule: Rule,
) => {
  const startRow = await denops.call("line", "w0") as number;
  const endRow = await denops.call("line", "w$") as number;
  const decorations = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.line < startRow || endRow < token.line) {
      continue;
    }
    const group = getHighlightGroup(token.scopes, spc_rule);
    if (group == null) {
      continue;
    }
    decorations.push({
      line: token.line,
      column: token.column,
      length: token.length,
      highlight: group,
    });
  }
  decorate(denops, bufnr, decorations);
};

export type Rule = { [scopeName: string]: string };

const getHighlightGroup = (
  scopes: string[],
  spc_rule: Rule,
): string | null => {
  const mergedRule = { ...defaultRule, ...spc_rule };
  const ruleArray = Object.keys(mergedRule).map((key) => {
    return {
      scope: key,
      hlGroup: mergedRule[key],
    };
  }).sort((a, b) => b.scope.length - a.scope.length);

  for (let i = scopes.length - 1; i > 0; i--) {
    const scope = scopes[i];
    for (const rule of ruleArray) {
      if (scope.startsWith(rule.scope)) {
        return rule.hlGroup;
      }
    }
  }
  return null;
};

// https://macromates.com/manual/en/language_grammars
const defaultRule: Rule = {};
defaultRule["comment"] = "ScorpeonComment";
defaultRule["comment.line"] = "ScorpeonCommentLine";
defaultRule["comment.block"] = "ScorpeonCommentBlock";

defaultRule["constant"] = "ScorpeonConstant";
defaultRule["constant.numeric"] = "ScorpeonConstantNumeric";
defaultRule["constant.character"] = "ScorpeonConstantCharacter";
defaultRule["constant.character.escape"] = "ScorpeonConstantCharacterEscape";
defaultRule["constant.language"] = "ScorpeonConstantLanguage";

defaultRule["entity"] = "ScorpeonEntity";
defaultRule["entity.name.function"] = "ScorpeonEntityNameFunction";
defaultRule["entity.name.type"] = "ScorpeonEntityNameType";
defaultRule["entity.name.tag"] = "ScorpeonEntityNameTag";
defaultRule["entity.name.section"] = "ScorpeonEntityNameSection";
defaultRule["entity.other.inherited-class"] = "ScorpeonEntityOtherInheritedClass";
defaultRule["entity.other.attribute-name"] = "ScorpeonEntityOtherAttributeName";

defaultRule["keyword"] = "ScorpeonKeyword";
defaultRule["keyword.control"] = "ScorpeonKeywordControl";
defaultRule["keyword.operator"] = "ScorpeonKeywordOperator";

defaultRule["markup"] = "ScorpeonMarkup";
defaultRule["markup.underline"] = "ScorpeonMarkupUnderline";
defaultRule["markup.underline.link"] = "ScorpeonMarkupUnderlineLink";
defaultRule["markup.bold"] = "ScorpeonMarkupBold";
defaultRule["markup.heading"] = "ScorpeonMarkupHeading";
defaultRule["markup.italic"] = "ScorpeonMarkupItalic";
defaultRule["markup.list"] = "ScorpeonMarkupList";
defaultRule["markup.quote"] = "ScorpeonMarkupQuote";
defaultRule["markup.raw"] = "ScorpeonMarkupRaw";

defaultRule["storage"] = "ScorpeonStorage";
defaultRule["storage.type"] = "ScorpeonStorageType";
defaultRule["storage.modifier"] = "ScorpeonStorageModifier";

defaultRule["string"] = "ScorpeonString";
defaultRule["string.quoted"] = "ScorpeonStringQuoted";
defaultRule["string.quoted.single"] = "ScorpeonStringQuotedSingle";
defaultRule["string.quoted.double"] = "ScorpeonStringQuotedDouble";
defaultRule["string.quoted.triple"] = "ScorpeonStringQuotedTriple";
defaultRule["string.unquoted"] = "ScorpeonStringUnquoted";
defaultRule["string.interpolated"] = "ScorpeonStringInterpolated";
defaultRule["string.regexp"] = "ScorpeonStringRegexp";

defaultRule["support"] = "ScorpeonSupport";
defaultRule["support.function"] = "ScorpeonSupportFunction";
defaultRule["support.class"] = "ScorpeonSupportClass";
defaultRule["support.type"] = "ScorpeonSupportType";
defaultRule["support.constant"] = "ScorpeonSupportConstant";
defaultRule["support.variable"] = "ScorpeonSupportVariable";

defaultRule["variable"] = "ScorpeonVariable";
defaultRule["variable.parameter"] = "ScorpeonVariableParameter";
defaultRule["variable.language"] = "ScorpeonVariableLanguage";
