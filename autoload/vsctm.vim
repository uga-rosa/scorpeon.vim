if has('nvim')
  let s:ns_id = nvim_create_namespace('vsctm')

  function! vsctm#add_hl(group, line, col_start, col_end) abort
    call nvim_buf_add_highlight(0, s:ns_id, a:group, a:line, a:col_start, a:col_end)
  endfunction

  function! s:clear() abort
    call nvim_buf_clear_namespace(0, s:ns_id, 0, -1)
  endfunction

  function! s:all_lines() abort
    return nvim_buf_get_lines(0, 0, -1, v:false)
  endfunction
else
  function! vsctm#add_hl(group, line, col_start, col_end) abort
    call matchaddpos(a:group, [[a:line + 1, a:col_start + 1, a:col_end - a:col_start]])
  endfunction

  function! s:clear() abort
    call clearmatches()
  endfunction

  function! s:all_lines() abort
    return getline(1, '$')
  endfunction
endif

function! s:highlight_update() abort
  syntax off
  call s:clear()
  call denops#notify('vsctm', 'highlight', [expand('%:p'), s:all_lines()])
endfunction

function! vsctm#highlight_enable() abort
  call s:highlight_update()
  augroup Vsctm
    autocmd!
    autocmd TextChanged,TextChangedI,TextChangedP * call s:highlight_update()
    autocmd BufRead * call s:highlight_update()
  augroup END
endfunction

function! vsctm#highlight_disable() abort
  call s:clear()
  augroup Vsctm
    autocmd!
    autocmd BufRead * call s:clear()
  augroup END
  syntax on
endfunction

function! vsctm#show_scope() abort
  call denops#request('vsctm', 'showScope', [expand('%:p'), s:all_lines()])
endfunction
