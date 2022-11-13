import { decorate, Denops } from "./deps.ts";
import { Token } from "./token.ts";

export type Rule = { [scopeName: string]: string };

export class Highlight {
  denops: Denops;
  bufnr: number;
  ruleArray: { scope: string; hlGroup: string }[];

  constructor(denops: Denops, bufnr: number, spc_rule: Rule) {
    this.denops = denops;
    this.bufnr = bufnr;
    const rules = { ...defaultRule, ...spc_rule };
    this.ruleArray = Object.keys(rules).map((key) => {
      return {
        scope: key,
        hlGroup: rules[key],
      };
    }).sort((a, b) => b.scope.length - a.scope.length);
  }

  async set(tokens: Token[]) {
    const decorations = tokens
      .map((token) => {
        return {
          line: token.line,
          column: token.column,
          length: token.length,
          highlight: this.getHighlightGroup(token.scopes),
        };
      })
      .filter((token) => token.highlight);
    await decorate(this.denops, this.bufnr, decorations);
  }

  getHighlightGroup(scopes: string[]): string {
    for (let i = scopes.length - 1; i > 0; i--) {
      const scope = scopes[i];
      for (const rule of this.ruleArray) {
        if (scope.startsWith(rule.scope)) {
          return rule.hlGroup;
        }
      }
    }
    return "";
  }
}

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
defaultRule["entity.other.inherited-class"] =
  "ScorpeonEntityOtherInheritedClass";
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
