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

function! s:update() abort
  call denops#notify('vsctm', 'highlight', [expand('%:p'), s:all_lines()])
endfunction

function! vsctm#enable() abort
  augroup Vsctm
    au!
    au TextChanged,TextChangedI,TextChangedP <buffer> call s:update()
  augroup END
  call s:clear()
  call s:update()
  syntax off
endfunction

function! vsctm#disable() abort
  augroup Vsctm
    au! * <buffer>
  augroup END
  call s:clear()
  syntax on
endfunction

function! vsctm#show_scope() abort
  call denops#request('vsctm', 'showScope', [expand('%:p'), s:all_lines()])
endfunction
