if has('nvim')
  function! s:clear() abort
    let ns = nvim_create_namespace('denops_std:buffer:decoration:decorate')
    call nvim_buf_clear_namespace(0, ns, 0, -1)
  endfunction

  function! s:all_lines() abort
    return nvim_buf_get_lines(0, 0, -1, v:false)
  endfunction
else
  function! s:clear() abort
    call prop_clear(1, line('$'))
  endfunction

  function! s:all_lines() abort
    return getline(1, '$')
  endfunction
endif

function! vsctm#update() abort
  call denops#notify('vsctm', 'highlight', [expand('%:p'), s:all_lines()])
endfunction

function! vsctm#enable() abort
  augroup Vsctm
    autocmd!
    autocmd TextChanged,TextChangedI,TextChangedP,WinScrolled
          \ <buffer> call vsctm#util#debounce('call vsctm#update()', 100)
  augroup END
  call s:clear()
  call vsctm#update()
  set syntax=OFF
endfunction

function! vsctm#disable() abort
  augroup Vsctm
    autocmd! * <buffer>
  augroup END
  call s:clear()
  set syntax=ON
endfunction

function! vsctm#show_scope() abort
  call denops#request('vsctm', 'showScope', [expand('%:p'), s:all_lines()])
endfunction
