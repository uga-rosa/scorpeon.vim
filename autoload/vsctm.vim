function! vsctm#add_hl(group, line, col_start, col_end) abort
  if has('nvim')
    call nvim_buf_add_highlight(0, -1, a:group, a:line, a:col_start, a:col_end)
  else
    call matchaddpos(a:group, [a:line + 1, a:col_start + 1, a:col_end - a:col_start])
  endif
endfunction
