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
defaultRule["comment"] = "VsctmComment";

defaultRule["constant"] = "VsctmConstant";
defaultRule["constant.numeric"] = "VsctmConstantNumeric";
defaultRule["constant.character"] = "VsctmConstantCharacter";
defaultRule["constant.language"] = "VsctmConstantLanguage";

defaultRule["keyword"] = "VsctmKeyword";
defaultRule["keyword.control"] = "VsctmKeywordControl";
defaultRule["keyword.operator"] = "VsctmKeywordOperator";

defaultRule["markup"] = "VsctmMarkup";

defaultRule["storage"] = "VsctmStorage";
defaultRule["storage.type"] = "VsctmStorageType";
defaultRule["storage.modifier"] = "VsctmStorageModifier";

defaultRule["string"] = "VsctmString";

defaultRule["support"] = "VsctmSupport";
defaultRule["support.function"] = "VsctmSupportFunction";
defaultRule["support.class"] = "VsctmSupportClass";
defaultRule["support.type"] = "VsctmSupportType";
defaultRule["support.constant"] = "VsctmSupportConstant";
defaultRule["support.variable"] = "VsctmSupportVariable";

defaultRule["variable"] = "VsctmVariable";
