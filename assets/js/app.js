/* ==========================================================================
   Bhasha — bootstrap
   Wires everything together and fails loudly-but-kindly if a module is
   missing (e.g. someone opened index.html without the assets folder).
   ========================================================================== */
(function (root) {
  'use strict';

  function missing() {
    var need = ['TLData', 'TLSfx', 'TLSpeech', 'TLStore', 'TLAI', 'TLEx', 'TLLesson', 'TLUI'];
    return need.filter(function (n) { return !root[n]; });
  }

  function fatal(msg) {
    var el = document.getElementById('app') || document.body;
    el.innerHTML =
      '<div style="max-width:560px;margin:60px auto;padding:24px;font-family:system-ui,sans-serif">' +
      '<h1 style="color:#ff4b4b;font-size:24px;margin:0 0 8px">Bhasha could not start</h1>' +
      '<p style="color:#777;line-height:1.5">' + msg + '</p>' +
      '<p style="color:#777;line-height:1.5">Make sure the <code>assets</code> folder sits next to <code>index.html</code>, ' +
      'then reload. If you are opening the file directly from disk, some browsers block local scripts — ' +
      'serve the folder instead, for example: <code>python -m http.server</code>.</p></div>';
  }

  function start() {
    var gone = missing();
    if (gone.length) { fatal('Missing module(s): <b>' + gone.join(', ') + '</b>.'); return; }
    try {
      TLUI.boot();
      /* expose a couple of helpers for debugging in the console */
      root.bhasha = {
        state: function () { return TLStore.state; },
        reset: function () { TLStore.reset(); location.reload(); },
        courses: TLData.courses
      };
      if (root.location.protocol === 'file:') {
        setTimeout(function () {
          TLUI.toast('Tip: run a local server (python -m http.server) for the smoothest experience.');
        }, 2200);
      }
    } catch (err) {
      console.error(err);
      fatal('A module threw an error: <b>' + (err && err.message ? err.message : 'unknown') + '</b>. Check the browser console for details.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  root.addEventListener('error', function (e) {
    if (e && e.message && /TLUI|TLLesson|TLEx|TLAI/.test(e.message)) console.error('Bhasha runtime error:', e.message);
  });
})(window);
