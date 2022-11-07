if has('nvim')
  let s:ns_id = nvim_create_namespace('vsctm')

  function! vsctm#add_hl(group, row, start, end) abort
    call nvim_buf_add_highlight(0, s:ns_id, a:group, a:row, a:start, a:end)
  endfunction

  function! s:clear() abort
    call nvim_buf_clear_namespace(0, s:ns_id, 0, -1)
  endfunction

  function! s:all_lines() abort
    return nvim_buf_get_lines(0, 0, -1, v:false)
  endfunction
else
  function! vsctm#add_hl(group, row, start, end) abort
    let row = a:row + 1
    let col = a:start + 1
    let len = a:end - a:start
    if empty(prop_type_get(a:group))
      call prop_type_add(a:group, {'highlight': a:group})
    endif
    call prop_add(row, col, {'length': len, 'type': a:group})
  endfunction

  function! s:clear() abort
    call prop_clear(1, line('$'))
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
    au TextChanged,TextChangedI,TextChangedP,WinScrolled <buffer> call s:update()
  augroup END
  call s:clear()
  call s:update()
  set syntax=OFF
endfunction

function! vsctm#disable() abort
  augroup Vsctm
    au! * <buffer>
  augroup END
  call s:clear()
  set syntax=ON
endfunction

function! vsctm#show_scope() abort
  call denops#request('vsctm', 'showScope', [expand('%:p'), s:all_lines()])
endfunction
