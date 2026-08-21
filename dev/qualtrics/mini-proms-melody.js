/* ==================================================================
   mini-PROMS — single subtest (Melody) — Qualtrics QUESTION JAVASCRIPT
   Paste into the JS panel of the Text/Graphic question that holds
   mini-proms-melody.html.

   Before it will run you must:
     1. Upload the subtest audio to Qualtrics Library > Files, and set
        BASE_URL below (or paste full per-file URLs into TRIALS).
     2. Fill in TRIALS with the official trial list + answer key.
     3. Create these Embedded Data fields in the Survey Flow, ABOVE
        this block:  PROMS_MEL_score, PROMS_MEL_max, PROMS_MEL_pct,
                     PROMS_MEL_raw, PROMS_MEL_rt, PROMS_MEL_secs
   ================================================================== */

Qualtrics.SurveyEngine.addOnload(function () {

  /* ---------------- CONFIG ---------------- */

  // Qualtrics gives you a per-file URL like
  //   https://yourbrand.qualtrics.com/CP/File.php?F=F_xxxxxxxx
  // Easiest reliable route: paste the FULL url into each std/cmp field
  // below and leave BASE_URL as ''.
  var BASE_URL = '';

  var ISI     = 1.5;   // silence between the three presentations, seconds
  var LEAD_IN = 0.20;  // silence before the first presentation, seconds

  // ---- TRIAL LIST -------------------------------------------------
  // ans: 'same' | 'diff'   std: file played twice   cmp: third file
  // Replace ids/urls and the answer key with the official mini-PROMS
  // melody subtest values. Order here is the presentation order.
  var TRIALS = [
    { id: 'mel01', std: 'mel01_std.mp3', cmp: 'mel01_cmp.mp3', ans: 'diff' },
    { id: 'mel02', std: 'mel02_std.mp3', cmp: 'mel02_cmp.mp3', ans: 'same' },
    { id: 'mel03', std: 'mel03_std.mp3', cmp: 'mel03_cmp.mp3', ans: 'diff' },
    { id: 'mel04', std: 'mel04_std.mp3', cmp: 'mel04_cmp.mp3', ans: 'same' },
    { id: 'mel05', std: 'mel05_std.mp3', cmp: 'mel05_cmp.mp3', ans: 'diff' },
    { id: 'mel06', std: 'mel06_std.mp3', cmp: 'mel06_cmp.mp3', ans: 'diff' },
    { id: 'mel07', std: 'mel07_std.mp3', cmp: 'mel07_cmp.mp3', ans: 'same' },
    { id: 'mel08', std: 'mel08_std.mp3', cmp: 'mel08_cmp.mp3', ans: 'diff' }
  ];

  var RANDOMIZE = false;   // PROMS is normally given in fixed order

  /* ---------------- SETUP ---------------- */

  var page = this;
  page.hideNextButton();

  var $ = function (id) { return document.getElementById(id); };
  var AC = null, BUFFERS = {}, idx = 0, results = [], t0 = null, trialShownAt = 0;

  var order = TRIALS.slice();
  if (RANDOMIZE) {
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
  }

  function url(f) { return /^https?:/i.test(f) ? f : BASE_URL + f; }

  /* ---------------- PRELOAD (Web Audio = exact ISI) ---------------- */

  var files = [];
  order.forEach(function (t) {
    if (files.indexOf(t.std) < 0) files.push(t.std);
    if (files.indexOf(t.cmp) < 0) files.push(t.cmp);
  });

  var Ctx = window.AudioContext || window.webkitAudioContext;
  AC = new Ctx();

  var loaded = 0;
  function bump() {
    loaded++;
    $('proms-load-pct').textContent =
      Math.round((loaded / files.length) * 100) + '%';
    if (loaded === files.length) {
      $('proms-load').style.display  = 'none';
      $('proms-intro').style.display = 'block';
    }
  }

  files.forEach(function (f) {
    fetch(url(f))
      .then(function (r) { return r.arrayBuffer(); })
      .then(function (ab) {
        return new Promise(function (res, rej) {
          AC.decodeAudioData(ab, res, rej);   // callback form: Safari-safe
        });
      })
      .then(function (buf) { BUFFERS[f] = buf; bump(); })
      .catch(function (e) {
        console.error('mini-PROMS: could not load ' + f, e);
        BUFFERS[f] = null; bump();
      });
  });

  /* ---------------- PLAYBACK ---------------- */

  function playTrial(t) {
    var when  = AC.currentTime + LEAD_IN;
    var seq   = [t.std, t.std, t.cmp];
    var marks = [];

    seq.forEach(function (key) {
      var buf = BUFFERS[key];
      if (!buf) return;
      var src = AC.createBufferSource();
      src.buffer = buf;
      src.connect(AC.destination);
      src.start(when);
      marks.push({ at: when - AC.currentTime, dur: buf.duration });
      when += buf.duration + ISI;
    });

    marks.forEach(function (m, i) {
      setTimeout(function () {
        $('proms-nowplaying').textContent =
          (i < 2 ? 'Melody ' + (i + 1) : 'Third melody');
      }, m.at * 1000);
    });

    return when - ISI - AC.currentTime;   // total audio duration, seconds
  }

  /* ---------------- TRIAL LOOP ---------------- */

  function eachOpt(fn) {
    Array.prototype.forEach.call(document.querySelectorAll('.proms-opt'), fn);
  }

  function showTrial() {
    if (idx >= order.length) return finish();

    $('proms-progress').textContent   = 'Trial ' + (idx + 1) + ' of ' + order.length;
    $('proms-resp').style.display     = 'none';
    $('proms-nowplaying').textContent = '';
    $('proms-play').disabled          = false;
    $('proms-play').textContent       = 'Play';
    eachOpt(function (b) { b.disabled = false; });
  }

  $('proms-start').onclick = function () {
    if (AC.state === 'suspended') AC.resume();   // unlock audio on user gesture
    t0 = Date.now();
    $('proms-intro').style.display = 'none';
    $('proms-task').style.display  = 'block';
    showTrial();
  };

  $('proms-play').onclick = function () {
    this.disabled = true;
    this.textContent = 'Playing...';
    var dur = playTrial(order[idx]);
    setTimeout(function () {
      $('proms-nowplaying').textContent = '';
      $('proms-resp').style.display = 'block';
      trialShownAt = Date.now();
    }, dur * 1000 + 120);
  };

  eachOpt(function (btn) {
    btn.onclick = function () {
      eachOpt(function (b) { b.disabled = true; });

      var v = parseInt(this.getAttribute('data-v'), 10);  // +2 .. -2
      var t = order[idx];

      // PROMS scoring: 1 for a confident correct answer,
      // 0.5 for a hedged correct answer, 0 otherwise.
      var score = 0;
      if (t.ans === 'same') { if (v === 2)  score = 1; else if (v === 1)  score = 0.5; }
      else                  { if (v === -2) score = 1; else if (v === -1) score = 0.5; }

      results.push({ id: t.id, ans: t.ans, v: v, s: score,
                     rt: Date.now() - trialShownAt });

      idx++;
      setTimeout(showTrial, 350);
    };
  });

  /* ---------------- FINISH ---------------- */

  function finish() {
    var total = results.reduce(function (a, r) { return a + r.s; }, 0);
    var max   = order.length;

    Qualtrics.SurveyEngine.setEmbeddedData('PROMS_MEL_score', total);
    Qualtrics.SurveyEngine.setEmbeddedData('PROMS_MEL_max',   max);
    Qualtrics.SurveyEngine.setEmbeddedData('PROMS_MEL_pct',
      Math.round((total / max) * 1000) / 10);
    Qualtrics.SurveyEngine.setEmbeddedData('PROMS_MEL_raw',
      results.map(function (r) { return r.id + ':' + r.v + ':' + r.s; }).join('|'));
    Qualtrics.SurveyEngine.setEmbeddedData('PROMS_MEL_rt',
      results.map(function (r) { return r.rt; }).join('|'));
    Qualtrics.SurveyEngine.setEmbeddedData('PROMS_MEL_secs',
      Math.round((Date.now() - t0) / 1000));

    $('proms-task').style.display = 'none';
    $('proms-done').style.display = 'block';
    try { AC.close(); } catch (e) {}

    setTimeout(function () { page.clickNextButton(); }, 800);
  }
});
