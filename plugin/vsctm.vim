if !exists('g:vsctm_extensions_path')
  echoerr 'g:vsctm_extensions_path is not set'
endif
if !exists('g:vsctm_rule')
  let g:vsctm_rule = {}
endif

command! VsctmHighlightEnable call vsctm#highlight_enable()
command! VsctmHighlightDisable call vsctm#highlight_disable()

hi def link VsctmComment                 Comment
hi def link VsctmCommentLine             Comment
hi def link VsctmCommentBlock            Comment

hi def link VsctmConstant                Constant
hi def link VsctmConstantNumeric         Number
hi def link VsctmConstantCharacter       String
hi def link VsctmConstantCharacterEscape String
hi def link VsctmConstantLanguage        Boolean

hi def link VsctmKeyword                 Statement
hi def link VsctmKeywordControl          Conditional
hi def link VsctmKeywordOperator         Operator

hi def link VsctmMarkup                  Underlined
hi def link VsctmMarkupUnderline         Underlined
hi def link VsctmMarkupUnderlineLink     Underlined
hi def link VsctmMarkupBold              Underlined
hi def link VsctmMarkupHeading           Underlined
hi def link VsctmMarkupItalic            Underlined
hi def link VsctmMarkupList              Underlined
hi def link VsctmMarkupQuote             Underlined
hi def link VsctmMarkupRaw               Underlined

hi def link VsctmStorage                 Type
hi def link VsctmStorageType             Type
hi def link VsctmStorageModifier         StorageClass

hi def link VsctmString                  String
hi def link VsctmStringQuoted            String
hi def link VsctmStringQuotedSingle      String
hi def link VsctmStringQuotedDouble      String
hi def link VsctmStringQuotedTriple      String
hi def link VsctmStringUnquoted          String
hi def link VsctmStringInterpolated      String
hi def link VsctmStringRegexp            String

hi def link VsctmSupport                 Identifier
hi def link VsctmSupportFunction         Function
hi def link VsctmSupportClass            Type
hi def link VsctmSupportType             Typedef
hi def link VsctmSupportConstant         Constant
hi def link VsctmSupportVariable         Identifier

hi def link VsctmVariable                Identifier
hi def link VsctmVariableParameter       Identifier
hi def link VsctmVariableLanguage        Identifier
