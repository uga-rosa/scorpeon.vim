if !exists('g:vsctm_extensions_path')
  echoerr 'g:vsctm_extensions_path is not set'
endif

command! VsctmHighlighEnable call vsctm#highlight_enable()
command! VsctmHighlighDisable call vsctm#highlight_disable()
