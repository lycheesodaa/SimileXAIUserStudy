/* ==================================================================
   Gold-MSI — Musical Training subscale (7 items)
   Qualtrics QUESTION JAVASCRIPT for gold-msi-musical-training.html

   Goldsmiths MSI v1.0 (Mullensiefen, Gingras, Musil & Stewart, 2014),
   CC BY-NC-SA. VERIFY the item wording and response anchors below
   against the official inventory PDF before fielding — the strings
   here are transcribed for convenience, not authoritative.

   Scoring: every item 1..7; reverse-scored items are recoded 8 - x.
   Subscale score = sum, range 7..49.

   Create these Embedded Data fields in the Survey Flow ABOVE this
   block:  GMSI_MT_sum, GMSI_MT_mean, GMSI_MT_raw, GMSI_MT_secs
   ================================================================== */

Qualtrics.SurveyEngine.addOnload(function () {

  /* ---------------- ITEMS ---------------- */
  // rev: true  => recoded 8 - x before summing
  // opts order MUST run from the response scored 1 to the one scored 7.

  var AGREE = ['Completely<br>disagree', 'Strongly<br>disagree', 'Disagree',
               'Neither agree<br>nor disagree', 'Agree', 'Strongly<br>agree',
               'Completely<br>agree'];

  var ITEMS = [
    { id: 'MT1', rev: false,
      q: 'I engaged in regular, daily practice of a musical instrument (including voice) for ___ years.',
      opts: ['0', '1', '2', '3', '4-5', '6-9', '10 or more'] },

    { id: 'MT2', rev: false,
      q: 'At the peak of my interest, I practised ___ hours per day on my primary instrument.',
      opts: ['0', '0.5', '1', '1.5', '2', '3-4', '5 or more'] },

    { id: 'MT3', rev: false,
      q: 'I have had formal training in music theory for ___ years.',
      opts: ['0', '0.5', '1', '2', '3', '4-6', '7 or more'] },

    { id: 'MT4', rev: false,
      q: 'I have had ___ years of formal training on a musical instrument (including voice) during my lifetime.',
      opts: ['0', '0.5', '1', '2', '3-5', '6-9', '10 or more'] },

    { id: 'MT5', rev: false,
      q: 'I can play ___ musical instruments.',
      opts: ['0', '1', '2', '3', '4', '5', '6 or more'] },

    { id: 'MT6', rev: true,
      q: 'I would not consider myself a musician.',
      opts: AGREE },

    // VERIFY THIS ONE FIRST — it is the item I am least sure belongs
    // to Musical Training rather than another subscale.
    { id: 'MT7', rev: true,
      q: 'I have never been complimented for my talents as a musical performer.',
      opts: AGREE }
  ];

  /* ---------------- RENDER ---------------- */

  var page = this;
  var t0   = Date.now();
  var host = document.getElementById('gmsi-items');

  ITEMS.forEach(function (it, i) {
    var wrap = document.createElement('div');
    wrap.className = 'gmsi-item';
    wrap.id = 'gmsi-wrap-' + it.id;

    var q = document.createElement('div');
    q.className = 'gmsi-q';
    q.innerHTML = (i + 1) + '. ' + it.q;
    wrap.appendChild(q);

    var row = document.createElement('div');
    row.className = 'gmsi-opts';
    it.opts.forEach(function (label, k) {
      var lab = document.createElement('label');
      lab.innerHTML =
        '<input type="radio" name="gmsi_' + it.id + '" value="' + (k + 1) + '">' +
        '<span>' + label + '</span>';
      lab.querySelector('input').addEventListener('change', function () {
        wrap.classList.remove('gmsi-missing');
        refreshNext();
      });
      row.appendChild(lab);
    });
    wrap.appendChild(row);
    host.appendChild(wrap);
  });

  /* ---------------- VALIDATE + SCORE ---------------- */

  function collect() {
    return ITEMS.map(function (it) {
      var sel = document.querySelector('input[name="gmsi_' + it.id + '"]:checked');
      return { it: it, v: sel ? parseInt(sel.value, 10) : null };
    });
  }

  // Force-response without a real Qualtrics question: the Next button stays
  // hidden until all 7 items are answered. (addOnPageSubmit cannot reliably
  // cancel a submit, so gate the button instead of blocking the submit.)
  page.hideNextButton();

  function refreshNext() {
    var done = collect().every(function (r) { return r.v !== null; });
    if (done) {
      page.showNextButton();
      document.getElementById('gmsi-warn').style.display = 'none';
    } else {
      page.hideNextButton();
    }
  }

  page.addOnPageSubmit(function (type) {
    if (type !== 'next') return;

    var rows = collect();
    if (rows.some(function (r) { return r.v === null; })) return;

    var sum = 0;
    var raw = rows.map(function (r) {
      var scored = r.it.rev ? (8 - r.v) : r.v;
      sum += scored;
      return r.it.id + ':' + r.v + ':' + scored;
    }).join('|');

    Qualtrics.SurveyEngine.setEmbeddedData('GMSI_MT_sum',  sum);
    Qualtrics.SurveyEngine.setEmbeddedData('GMSI_MT_mean',
      Math.round((sum / ITEMS.length) * 100) / 100);
    Qualtrics.SurveyEngine.setEmbeddedData('GMSI_MT_raw',  raw);
    Qualtrics.SurveyEngine.setEmbeddedData('GMSI_MT_secs',
      Math.round((Date.now() - t0) / 1000));
  });
});
