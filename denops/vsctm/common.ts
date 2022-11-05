export type Rule = { [scopeName: string]: string };

export const getHighlightGroup = (
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
// :h group-name
const defaultRule: Rule = {};
defaultRule["comment"] = "Comment";

defaultRule["constant"] = "Constant";
defaultRule["constant.numeric"] = "Number";
defaultRule["constant.numeric.float"] = "Float";
defaultRule["constant.character"] = "Character";
defaultRule["constant.language"] = "Boolean";

defaultRule["keyword"] = "Statement";
defaultRule["keyword.control"] = "Conditional";
defaultRule["keyword.operator"] = "Operator";

defaultRule["markup"] = "Underlined";

defaultRule["storage"] = "Type";
defaultRule["storage.type"] = "Type";
defaultRule["storage.modifier"] = "StorageClass";

defaultRule["string"] = "String";

defaultRule["support"] = "Identifier";
defaultRule["support.function"] = "Function";
defaultRule["support.class"] = "Type";
defaultRule["support.type"] = "Typedef";
defaultRule["support.constant"] = "Constant";
defaultRule["support.variable"] = "Identifier";

defaultRule["variable"] = "Identifier";
