if !exists('g:vsctm_extensions_path')
  echoerr 'g:vsctm_extensions_path is not set'
endif

command! VsctmHighlightEnable call vsctm#highlight_enable()
command! VsctmHighlightDisable call vsctm#highlight_disable()
