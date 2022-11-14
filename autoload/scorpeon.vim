if has('nvim')
  " 0-index
  function! scorpeon#clear(start, end) abort
    let ns = nvim_create_namespace('denops_std:buffer:decoration:decorate')
    call nvim_buf_clear_namespace(0, ns, a:start, a:end)
  endfunction

  function! s:get_all_lines() abort
    return nvim_buf_get_lines(0, 0, -1, v:false)
  endfunction
else
  " 0-index
  function! scorpeon#clear(start, end) abort
    let start = a:start + 1
    let end = a:end == -1 ? line('$') : a:end + 1
    call prop_clear(start, end)
  endfunction

  function! s:get_all_lines() abort
    return getline(1, '$')
  endfunction
endif

function! s:clear() abort
  call scorpeon#clear(0, -1)
endfunction

let s:scorpeon_timer = {}

function! s:debounce(name, fn, delay) abort
  let timer = get(s:scorpeon_timer, a:name, 0)
  silent! call timer_stop(timer)
  let s:scorpeon_timer[a:name] = timer_start(a:delay, { -> a:fn() })
endfunction

function! s:highlight_start_async() abort
  let buf = bufnr()
  let path = expand('%:p')
  let lines = s:get_all_lines()
  let end = line('$')
  call denops#plugin#wait_async('scorpeon', {
        \ -> denops#notify('scorpeon', 'highlight', [buf, path, lines, end]) })
endfunction

function! s:highlight_start() abort
  call s:debounce('start', { -> s:highlight_start_async() }, 100)
endfunction

function! s:highlight_update_async() abort
  let buf = bufnr()
  let path = expand('%:p')
  let lines = s:get_all_lines()
  let end = line('w$')
  call denops#plugin#wait_async('scorpeon', {
        \ -> denops#notify('scorpeon', 'highlight', [buf, path, lines, end]) })
endfunction

function! s:highlight_update() abort
  call s:debounce('update', { -> s:highlight_update_async() }, 100)
endfunction

function! scorpeon#enable() abort
  augroup Scorpeon
    autocmd! * <buffer>
    autocmd TextChanged,TextChangedI,TextChangedP
          \ <buffer> call s:highlight_update()
  augroup END
  call s:clear()
  call s:highlight_start()
  set syntax=OFF
endfunction

function! scorpeon#disable() abort
  augroup Scorpeon
    autocmd! * <buffer>
  augroup END
  call s:clear()
  set syntax=ON
endfunction

function! scorpeon#auto_highlight() abort
  let Enable = g:scorpeon_highlight.enable
  let Disable = g:scorpeon_highlight.disable

  let enable = v:false
  let enable = enable || (type(Enable) == v:t_list && index(Enable, &ft) != -1)
  let enable = enable || (type(Enable) == v:t_bool && Enable)
  let disable = !enable
  let disable = disable || (type(Disable) == v:t_list && index(Disable, &ft) != -1)
  let disable = disable || (type(Disable) == v:t_func && Disable())

  if enable && !disable
    call scorpeon#enable()
  endif
endfunction

function! scorpeon#show_scope() abort
  let buf = bufnr()
  let path = expand('%:p')
  let lines = s:get_all_lines()
  call denops#request('scorpeon', 'showScope', [buf, path, lines])
endfunction
