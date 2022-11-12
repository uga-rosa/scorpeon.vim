if exists('g:loaded_scorpeon')
  finish
endif
let g:loaded_scorpeon = 1

if !exists('g:scorpeon_extensions_path')
  echoerr 'g:scorpeon_extensions_path is not set'
endif

let s:path = g:scorpeon_extensions_path
let g:scorpeon_extensions_path = type(s:path) == v:t_list ? s:path : [s:path]

let g:scorpeon_rule = get(g:, 'scorpeon_rule', {})

let g:scorpeon_highlight = get(g:, 'scorpeon_highlight', {})
let g:scorpeon_highlight.enable = get(g:scorpeon_highlight, 'enable', v:false)
let g:scorpeon_highlight.disable = get(g:scorpeon_highlight, 'disable', [])

augroup scorpeonHighlight
  autocmd!
  autocmd FileType * call scorpeon#auto_highlight()
augroup END

command! ScorpeonHighlightEnable call scorpeon#enable()
command! ScorpeonHighlightDisable call scorpeon#disable()
command! ScorpeonShowScope call scorpeon#show_scope()

" https://macromates.com/manual/en/language_grammars
" :h group-name
hi def link ScorpeonComment                   Comment
hi def link ScorpeonCommentLine               Comment
hi def link ScorpeonCommentBlock              Comment

hi def link ScorpeonConstant                  Constant
hi def link ScorpeonConstantNumeric           Number
hi def link ScorpeonConstantCharacter         String
hi def link ScorpeonConstantCharacterEscape   String
hi def link ScorpeonConstantLanguage          Boolean

hi def link ScorpeonEntity                    Identifier
hi def link ScorpeonEntityNameFunction        Function
hi def link ScorpeonEntityNameType            Type
hi def link ScorpeonEntityNameTag             Statement
hi def link ScorpeonEntityNameSection         Delimiter
hi def link ScorpeonEntityOtherInheritedClass Type
hi def link ScorpeonEntityOtherAttributeName  Constant

hi def link ScorpeonKeyword                   Statement
hi def link ScorpeonKeywordControl            Conditional
hi def link ScorpeonKeywordOperator           Operator

hi def link ScorpeonMarkup                    Underlined
hi def link ScorpeonMarkupUnderline           Underlined
hi def link ScorpeonMarkupUnderlineLink       Underlined
hi def link ScorpeonMarkupBold                Underlined
hi def link ScorpeonMarkupHeading             Underlined
hi def link ScorpeonMarkupItalic              Underlined
hi def link ScorpeonMarkupList                Underlined
hi def link ScorpeonMarkupQuote               Underlined
hi def link ScorpeonMarkupRaw                 Underlined

hi def link ScorpeonStorage                   Type
hi def link ScorpeonStorageType               Type
hi def link ScorpeonStorageModifier           Statement

hi def link ScorpeonString                    String
hi def link ScorpeonStringQuoted              String
hi def link ScorpeonStringQuotedSingle        String
hi def link ScorpeonStringQuotedDouble        String
hi def link ScorpeonStringQuotedTriple        String
hi def link ScorpeonStringUnquoted            String
hi def link ScorpeonStringInterpolated        String
hi def link ScorpeonStringRegexp              String

hi def link ScorpeonSupport                   Identifier
hi def link ScorpeonSupportFunction           Function
hi def link ScorpeonSupportClass              Type
hi def link ScorpeonSupportType               Typedef
hi def link ScorpeonSupportConstant           Constant
hi def link ScorpeonSupportVariable           Identifier

hi def link ScorpeonVariable                  Identifier
hi def link ScorpeonVariableParameter         Identifier
hi def link ScorpeonVariableLanguage          Identifier
