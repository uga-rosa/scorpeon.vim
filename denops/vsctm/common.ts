export const getHighlightGroup = (scopes: string[]): string | null => {
  for (let i = scopes.length - 1; i > 0; i--) {
    const scope = scopes[i];
    for (let j = 0; j < ruleKeys.length; j++) {
      const rule = ruleKeys[j];
      if (scope.startsWith(rule)) {
        return defaultRule[rule];
      }
    }
  }
  return null;
};

// https://macromates.com/manual/en/language_grammars
// :h group-name
const defaultRule: { [scopeName: string]: string } = {};
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

const ruleKeys = Object.keys(defaultRule).sort((a, b) => b.length - a.length);
