let s:debounce_timer = 0

function vsctm#util#debounce(fn, delay) abort
  silent! call timer_stop(s:debounce_timer)
  let s:debounce_timer = timer_start(a:delay, { -> a:fn() })
endfunction
