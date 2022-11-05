if has('nvim')
  let s:ns_id = nvim_create_namespace('vsctm')
endif

function! vsctm#add_hl(group, line, col_start, col_end) abort
  if has('nvim')
    call nvim_buf_add_highlight(0, s:ns_id, a:group, a:line, a:col_start, a:col_end)
  else
    call matchaddpos(a:group, [[a:line + 1, a:col_start + 1, a:col_end - a:col_start]])
  endif
endfunction

function! s:clear() abort
  if has('nvim')
    call nvim_buf_clear_namespace(0, s:ns_id, 0, -1)
  else
    call clearmatches()
  endif
endfunction

function! s:highlight_enable() abort
  call denops#request('vsctm', 'highlight', [expand('%:p')])
endfunction

function! vsctm#highlight_enable() abort
  call s:highlight_enable()
  augroup Vsctm
    autocmd!
    autocmd TextChanged,TextChangedI,TextChangedP * call s:highlight_enable()
  augroup END
endfunction

function! vsctm#highlight_disable() abort
  augroup Vsctm
    autocmd!
  augroup END
  call s:clear()
endfunction
