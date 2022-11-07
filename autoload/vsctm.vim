if has('nvim')
  let s:ns_id = nvim_create_namespace('vsctm')

  function! vsctm#add_hl(group, pos) abort
    " 0-index, [row, start, end]
    for pos in a:pos
      call nvim_buf_add_highlight(0, s:ns_id, a:group, pos[0], pos[1], pos[2])
    endfor
  endfunction

  function! s:clear() abort
    call nvim_buf_clear_namespace(0, s:ns_id, 0, -1)
  endfunction

  function! s:all_lines() abort
    return nvim_buf_get_lines(0, 0, -1, v:false)
  endfunction
else
  function! vsctm#add_hl(group, pos) abort
    " 0-index, [row, start, end]
    let pos = map(a:pos, { _, p -> [p[0] + 1, p[1] + 1, p[2] - p[1]] })
    call matchaddpos(a:group, pos)
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
