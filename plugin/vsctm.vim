if exists('g:loaded_vsctm')
  finish
endif
let g:loaded_vsctm = 1

if !exists('g:vsctm_extensions_path')
  echoerr 'g:vsctm_extensions_path is not set'
endif

command! VsctmHighlightEnable call vsctm#enable()
command! VsctmHighlightDisable call vsctm#disable()
command! VsctmShowScope call vsctm#show_scope()

let g:vsctm_rule = get(g:, 'vsctm_rule', {})

let g:vsctm_highlight = get(g:, 'vsctm_highlight', {})
let g:vsctm_highlight.enable = get(g:vsctm_highlight, 'enable', v:false)
let g:vsctm_highlight.disable = get(g:vsctm_highlight, 'disable', [])

augroup VsctmHighlight
  autocmd!
  autocmd FileType * call s:highlight()
augroup END

function! s:highlight() abort
  let enable = g:vsctm_highlight.enable
  let disable = g:vsctm_highlight.disable
  if type(enable) == v:t_list && index(enable, &ft) != -1
    VsctmHighlightEnable
  elseif type(enable) == v:t_bool && enable
    if type(disable) == v:t_list && index(disable, &ft) == -1
      VsctmHighlightEnable
    elseif type(disable) == v:t_func && !disable()
      VsctmHighlightEnable
    endif
  endif
endfunction

" https://macromates.com/manual/en/language_grammars
" :h group-name
hi def link VsctmComment                   Comment
hi def link VsctmCommentLine               Comment
hi def link VsctmCommentBlock              Comment

hi def link VsctmConstant                  Constant
hi def link VsctmConstantNumeric           Number
hi def link VsctmConstantCharacter         String
hi def link VsctmConstantCharacterEscape   String
hi def link VsctmConstantLanguage          Boolean

hi def link VsctmEntityNameFunction        Function
hi def link VsctmEntityNameType            Type
hi def link VsctmEntityNameTag             Statement
hi def link VsctmEntityNameSection         Delimiter
hi def link VsctmEntityOtherInheritedClass Type
hi def link VsctmEntityOtherAttributeName  Constant

hi def link VsctmKeyword                   Statement
hi def link VsctmKeywordControl            Conditional
hi def link VsctmKeywordOperator           Operator

hi def link VsctmMarkup                    Underlined
hi def link VsctmMarkupUnderline           Underlined
hi def link VsctmMarkupUnderlineLink       Underlined
hi def link VsctmMarkupBold                Underlined
hi def link VsctmMarkupHeading             Underlined
hi def link VsctmMarkupItalic              Underlined
hi def link VsctmMarkupList                Underlined
hi def link VsctmMarkupQuote               Underlined
hi def link VsctmMarkupRaw                 Underlined

hi def link VsctmStorage                   Type
hi def link VsctmStorageType               Type
hi def link VsctmStorageModifier           Statement

hi def link VsctmString                    String
hi def link VsctmStringQuoted              String
hi def link VsctmStringQuotedSingle        String
hi def link VsctmStringQuotedDouble        String
hi def link VsctmStringQuotedTriple        String
hi def link VsctmStringUnquoted            String
hi def link VsctmStringInterpolated        String
hi def link VsctmStringRegexp              String

hi def link VsctmSupport                   Identifier
hi def link VsctmSupportFunction           Function
hi def link VsctmSupportClass              Type
hi def link VsctmSupportType               Typedef
hi def link VsctmSupportConstant           Constant
hi def link VsctmSupportVariable           Identifier

hi def link VsctmVariable                  Identifier
hi def link VsctmVariableParameter         Identifier
hi def link VsctmVariableLanguage          Identifier
