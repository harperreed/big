window.onload = function() {
  var s = document.querySelectorAll('body > div'), ti, i;
  var notes = [];
  for (i = 0; i < s.length; i++) {
    s[i].setAttribute('tabindex', 0);
    var noteElements = s[i].getElementsByTagName('notes');
    notes.push([]);
    while (noteElements.length) {
      var note = noteElements[0];
      notes[i].push(note.innerHTML.trim());
      note.parentNode.removeChild(note);
    }
  }
  if (!s.length) return;
  var big = window.big = { current: 0, forward: fwd, reverse: rev, go: go, length: s.length };
  var audioCandidates = document.getElementsByTagName('audio');
  for(var ai = 0; ai < audioCandidates.length; ai++)
    if (audioCandidates[ai].textTracks.length === 1 && audioCandidates[ai].textTracks[0].cues.length > 0) {
      big.audio = audioCandidates[ai];
      var playControl = document.createElement('div');
      playControl.style = 'padding:5px;color:#aaa;';
      playControl.onclick = function(e) {
        if (big.audio.paused) {
          if (big.current === 0)
            big.fwd();
          else
            big.audio.play();
        }
        else
          big.audio.pause();
        e.stopPropagation();
      }
      document.getElementsByTagName('body')[0].appendChild(playControl);
      big.playControl = playControl;
      window.setInterval(function() {
        if (!big.audio.paused) {
          big.playControl.innerHTML = '&#9208;';
          for(var ci = 0; ci < big.audio.textTracks[0].cues.length; ci++)
            if ((big.audio.textTracks[0].cues[ci].startTime <= big.audio.currentTime)
              && (big.audio.textTracks[0].cues[ci].endTime > big.audio.currentTime)
              && ((big.current - 1) !== ci)) {
              go(ci + 1, true);
              break;
            }
        }
        else
          big.playControl.innerHTML = '&#9654;';

      }, 200);
      break;
    }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight, e = s[big.current];
    e.style.fontSize = h + 'px';
    function pass(cinch, start) {
      for (var i = start; i > 0 && (e.offsetWidth > w || e.offsetHeight > h); i -= cinch) {
        e.style.fontSize = i + 'px';
      }
      return i + cinch;
    }
    pass(2, pass(5, pass(10, h - 2)));
    e.style.marginTop = (h - e.offsetHeight) / 2 + 'px';
  }
  function go(n, dontSeek) {
    big.current = n;
    if (!dontSeek && big.audio && big.current === 0) {
      big.playControl.style = 'display:none';
      big.audio.pause();
    }
    if (!dontSeek && big.audio && big.current > 0) {
      big.playControl.style = 'padding:5px;color:#aaa;';
      big.audio.currentTime = big.audio.textTracks[0].cues[big.current - 1].startTime;
      if (big.audio.paused)
        big.audio.play();
    }
    for (i = 0; typeof console === 'object' && i < notes[n].length; i++) console.log('%c%s: %s', 'padding:5px;font-family:serif;font-size:18px;line-height:150%;', n, notes[n][i]);
    var e = s[n], t = parseInt(e.getAttribute('data-time-to-next') || 0, 10);
    document.body.className = e.getAttribute('data-bodyclass') || '';
    for (i = 0; i < s.length; i++) s[i].style.display = 'none';
    e.style.display = 'inline';
    e.focus();
    if (e.firstChild && e.firstChild.nodeName === 'IMG') {
      document.body.style.backgroundImage = 'url("' + e.firstChild.src + '")';
      e.firstChild.style.display = 'none';
      if ('classList' in e) e.classList.add('imageText');
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = e.style.backgroundColor;
    }
    if (ti !== undefined) window.clearInterval(ti);
    if (t > 0 && !big.audio) ti = window.setTimeout(fwd, t * 1000);
    resize();
    if (window.location.hash !== n) window.location.hash = n;
    document.title = e.textContent || e.innerText;
  }
  document.onclick = function(e) { if (e.target.tagName !== 'A') go(++big.current % s.length); };
  function fwd() { go(Math.min(s.length - 1, ++big.current)); }
  function rev() { go(Math.max(0, --big.current)); }
  document.onkeydown = function(e) {
    if (e.which === 39 || e.which === 34 || e.which === 40) fwd();
    if (e.which === 37 || e.which === 33 || e.which === 38) rev();
  };
  document.ontouchstart = function(e) {
    var x0 = e.changedTouches[0].pageX;
    document.ontouchend = function(e2) {
      var x1 = e2.changedTouches[0].pageX;
      if (x1 - x0 < 0) fwd();
      if (x1 - x0 > 0) rev();
    };
  };
  function parse_hash() {
    return Math.max(Math.min(s.length - 1,
      parseInt(window.location.hash.substring(1), 10)), 0);
  }
  if (window.location.hash) big.current = parse_hash() || big.current;
  window.onhashchange = function() {
    i = parse_hash();
    if (i !== big.current) go(i);
  };
  window.onresize = resize;
  go(big.current);
};
