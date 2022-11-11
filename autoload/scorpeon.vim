if has('nvim')
  function! s:clear() abort
    let ns = nvim_create_namespace('denops_std:buffer:decoration:decorate')
    call nvim_buf_clear_namespace(0, ns, 0, -1)
  endfunction

  function! s:get_all_lines() abort
    return nvim_buf_get_lines(0, 0, -1, v:false)
  endfunction
else
  function! s:clear() abort
    call prop_clear(1, line('$'))
  endfunction

  function! s:get_all_lines() abort
    return getline(1, '$')
  endfunction
endif

function! s:debounce(fn, delay) abort
  let timer = get(s:, 'scorpeon_timer', 0)
  silent! call timer_stop(timer)
  let s:scorpeon_timer = timer_start(a:delay, { -> a:fn() })
endfunction

function! s:highlight_start() abort
  let buf = bufnr()
  let path = expand('%:p')
  let start = 1
  let end = line('$')
  let lines = s:get_all_lines()
  call denops#plugin#wait_async('scorpeon', {
        \ -> denops#notify('scorpeon', 'highlight', [buf, path, start, end, lines]) })
endfunction

function! s:highlight_update_async() abort
  let buf = bufnr()
  let path = expand('%:p')
  let start = line('w0')
  let end = line('w$')
  let lines = s:get_all_lines()
  call denops#plugin#wait_async('scorpeon', {
        \ -> denops#notify('scorpeon', 'highlight', [buf, path, start, end, lines]) })
endfunction

function! s:highlight_update() abort
  call s:debounce({ -> s:highlight_update_async() }, 100)
endfunction

function! scorpeon#enable() abort
  augroup Scorpeon
    autocmd! * <buffer>
    autocmd TextChanged,TextChangedI,TextChangedP,WinScrolled
          \ <buffer> call s:highlight_update()
  augroup END
  call s:clear()
  call s:highlight_start()
  set syntax=OFF
endfunction

function! scorpeon#disable() abort
  augroup scorpeon
    autocmd! * <buffer>
  augroup END
  call s:clear()
  set syntax=ON
endfunction

function! scorpeon#show_scope() abort
  call denops#request('scorpeon', 'showScope', [expand('%:p'), s:get_all_lines()])
endfunction

function! scorpeon#auto_highlight() abort
  let Enable = g:scorpeon_highlight.enable
  let Disable = g:scorpeon_highlight.disable

  let enable = v:false
  let enable = enable || (type(Enable) == v:t_list && index(Enable, &ft) != -1)
  let enable = enable || (type(Enable) == v:t_bool && Enable)
  let disable = v:false
  let disable = disable || (type(Disable) == v:t_list && index(Disable, &ft) != -1)
  let disable = disable || (type(Disable) == v:t_func && Disable())

  if enable && !disable
    call scorpeon#enable()
  endif
endfunction
