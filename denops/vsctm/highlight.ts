import { Denops } from "./deps.ts";
import { Token } from "./token.ts";

export const highlight = (denops: Denops, tokens: Token[], spc_rule: Rule) => {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const group = getHighlightGroup(token.scopes, spc_rule);
    if (group === null) {
      continue;
    }
    denops.call("vsctm#add_hl", group, token.row, token.start, token.end);
  }
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
defaultRule["comment"] = "VsctmComment";
defaultRule["comment.line"] = "VsctmCommentLine";
defaultRule["comment.block"] = "VsctmCommentBlock";

defaultRule["constant"] = "VsctmConstant";
defaultRule["constant.numeric"] = "VsctmConstantNumeric";
defaultRule["constant.character"] = "VsctmConstantCharacter";
defaultRule["constant.character.escape"] = "VsctmConstantCharacterEscape";
defaultRule["constant.language"] = "VsctmConstantLanguage";

defaultRule["entity.name.function"] = "VsctmEntityNameFunction";
defaultRule["entity.name.type"] = "VsctmEntityNameType";
defaultRule["entity.name.tag"] = "VsctmEntityNameTag";
defaultRule["entity.name.section"] = "VsctmEntityNameSection";
defaultRule["entity.other.inherited-class"] = "VsctmEntityOtherInheritedClass";
defaultRule["entity.other.attribute-name"] = "VsctmEntityOtherAttributeName";

defaultRule["keyword"] = "VsctmKeyword";
defaultRule["keyword.control"] = "VsctmKeywordControl";
defaultRule["keyword.operator"] = "VsctmKeywordOperator";

defaultRule["markup"] = "VsctmMarkup";
defaultRule["markup.underline"] = "VsctmMarkupUnderline";
defaultRule["markup.underline.link"] = "VsctmMarkupUnderlineLink";
defaultRule["markup.bold"] = "VsctmMarkupBold";
defaultRule["markup.heading"] = "VsctmMarkupHeading";
defaultRule["markup.italic"] = "VsctmMarkupItalic";
defaultRule["markup.list"] = "VsctmMarkupList";
defaultRule["markup.quote"] = "VsctmMarkupQuote";
defaultRule["markup.raw"] = "VsctmMarkupRaw";

defaultRule["storage"] = "VsctmStorage";
defaultRule["storage.type"] = "VsctmStorageType";
defaultRule["storage.modifier"] = "VsctmStorageModifier";

defaultRule["string"] = "VsctmString";
defaultRule["string.quoted"] = "VsctmStringQuoted";
defaultRule["string.quoted.single"] = "VsctmStringQuotedSingle";
defaultRule["string.quoted.double"] = "VsctmStringQuotedDouble";
defaultRule["string.quoted.triple"] = "VsctmStringQuotedTriple";
defaultRule["string.unquoted"] = "VsctmStringUnquoted";
defaultRule["string.interpolated"] = "VsctmStringInterpolated";
defaultRule["string.regexp"] = "VsctmStringRegexp";

defaultRule["support"] = "VsctmSupport";
defaultRule["support.function"] = "VsctmSupportFunction";
defaultRule["support.class"] = "VsctmSupportClass";
defaultRule["support.type"] = "VsctmSupportType";
defaultRule["support.constant"] = "VsctmSupportConstant";
defaultRule["support.variable"] = "VsctmSupportVariable";

defaultRule["variable"] = "VsctmVariable";
defaultRule["variable.parameter"] = "VsctmVariableParameter";
defaultRule["variable.language"] = "VsctmVariableLanguage";
