/* =====================================================================
   ENGINE — game state, scene rendering, dialogue, notebook,
   deductions, accusation, saving. Plain DOM + SVG, no dependencies.
   ===================================================================== */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const SAVE_KEY = 'marshlight_save_v1';

  /* ---------------- STATE ---------------- */
  const freshState = () => ({
    scene: 'entrance',
    clues: [], newClues: [],
    flags: [],
    unlocked: Object.entries(DATA.scenes).filter(([, s]) => s.unlocked).map(([id]) => id),
    visited: [],
    talked: [],
    notes: {},
    solved: [],
    wrongGuesses: 0,
    startedAt: Date.now(),
    finished: false,
  });
  let S = freshState();

  // Query helpers passed into data callbacks
  const Q = {
    has: (c) => S.clues.includes(c),
    flag: (f) => S.flags.includes(f),
    unlocked: (sc) => S.unlocked.includes(sc),
    solved: (d) => S.solved.includes(d),
    talked: (k) => S.talked.includes(k),
  };

  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* private mode etc. */ } };
  const load = () => { try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } };

  /* ---------------- SOUND (tiny WebAudio blips, no assets) ---------------- */
  const Sound = (() => {
    let ctx = null, muted = false;
    try { muted = localStorage.getItem('marshlight_muted') === '1'; } catch (e) {}
    const ensure = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } } return ctx; };
    const tone = (freq, dur, type = 'sine', vol = .08, when = 0) => {
      const c = ensure(); if (!c || muted) return;
      const o = c.createOscillator(), gN = c.createGain();
      o.type = type; o.frequency.value = freq;
      gN.gain.setValueAtTime(0, c.currentTime + when);
      gN.gain.linearRampToValueAtTime(vol, c.currentTime + when + .01);
      gN.gain.exponentialRampToValueAtTime(.0001, c.currentTime + when + dur);
      o.connect(gN).connect(c.destination);
      o.start(c.currentTime + when); o.stop(c.currentTime + when + dur + .05);
    };
    return {
      click: () => tone(520, .06, 'triangle', .05),
      talk: () => tone(300 + Math.random() * 200, .05, 'square', .02),
      clue: () => { tone(660, .12, 'sine', .07); tone(880, .18, 'sine', .07, .1); tone(1320, .25, 'sine', .06, .2); },
      success: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'triangle', .07, i * .09)); },
      fail: () => { tone(220, .2, 'sawtooth', .04); tone(180, .3, 'sawtooth', .04, .12); },
      travel: () => { tone(400, .1, 'sine', .05); tone(300, .15, 'sine', .05, .08); },
      unlock: () => { tone(440, .1, 'triangle', .06); tone(660, .2, 'triangle', .06, .1); },
      toggle() { muted = !muted; try { localStorage.setItem('marshlight_muted', muted ? '1' : '0'); } catch (e) {} return muted; },
      get muted() { return muted; },
    };
  })();

  /* ---------------- SCREENS ---------------- */
  const show = (id) => { document.querySelectorAll('.screen').forEach(s => s.hidden = true); $('#' + id).hidden = false; };

  /* ---------------- STEP RUNNER (dialogue queue) ---------------- */
  const dlg = { queue: [], onDone: null, typing: null, busy: false, fullText: '' };
  const dlgEl = $('#dialogue'), dlgText = $('#dlg-text'), dlgName = $('#dlg-name'), dlgPortrait = $('#dlg-portrait'), dlgCont = $('#dlg-continue'), dlgChoices = $('#dlg-choices');

  function runSteps(steps, onDone) {
    const list = (typeof steps === 'function' ? steps(Q) : steps) || [];
    dlg.queue = dlg.queue.concat(list.slice());
    if (onDone) { const prev = dlg.onDone; dlg.onDone = prev ? () => { prev(); onDone(); } : onDone; }
    if (!dlg.busy) nextStep();
  }

  function nextStep() {
    if (dlg.typing) { clearInterval(dlg.typing); dlg.typing = null; }
    // consume non-visual steps immediately
    while (dlg.queue.length) {
      const st = dlg.queue[0];
      if (st.who !== undefined) break;
      dlg.queue.shift();
      applyStep(st);
      if (st.goto) { return; }
    }
    if (!dlg.queue.length) {
      dlg.busy = false;
      const cb = dlg.onDone; dlg.onDone = null;
      if (cb) cb(); else hideDialogue();
      return;
    }
    dlg.busy = true;
    const st = dlg.queue.shift();
    showLine(st.who, st.text);
  }

  function applyStep(st) {
    if (st.clue) addClue(st.clue);
    if (st.flag) { if (!S.flags.includes(st.flag)) S.flags.push(st.flag); }
    if (st.unlock) unlockScene(st.unlock);
    if (st.note) { const [c, t] = st.note; S.notes[c] = S.notes[c] || []; if (!S.notes[c].includes(t)) S.notes[c].push(t); }
    if (st.goto) { dlg.queue = []; dlg.busy = false; dlg.onDone = null; hideDialogue(); travel(st.goto); }
    save();
  }

  function showLine(who, text) {
    dlgEl.hidden = false;
    dlgChoices.hidden = true; dlgChoices.innerHTML = '';
    dlgCont.hidden = false;
    if (who === 'narr') {
      dlgPortrait.classList.add('narr'); dlgPortrait.innerHTML = ''; dlgName.textContent = ''; dlgText.classList.add('narr');
    } else {
      const c = DATA.characters[who];
      dlgPortrait.classList.remove('narr'); dlgText.classList.remove('narr');
      dlgPortrait.innerHTML = Art.portrait(c.look);
      dlgName.textContent = c.name;
    }
    // typewriter
    dlg.fullText = text; dlgText.textContent = '';
    let i = 0;
    dlg.typing = setInterval(() => {
      i += 2; dlgText.textContent = text.slice(0, i);
      if (i % 6 === 0) Sound.talk();
      if (i >= text.length) { clearInterval(dlg.typing); dlg.typing = null; dlgText.textContent = text; }
    }, 14);
  }
  function hideDialogue() { dlgEl.hidden = true; dlg.busy = false; if (dlg.typing) { clearInterval(dlg.typing); dlg.typing = null; } }

  $('#dlg-body').addEventListener('click', (e) => {
    if (e.target.closest('.choice')) return;
    if (!dlg.busy) return;
    if (dlg.typing) { clearInterval(dlg.typing); dlg.typing = null; dlgText.textContent = dlg.fullText; return; }
    Sound.click(); nextStep();
  });

  /* ---------------- CLUES / FLAGS ---------------- */
  function addClue(id) {
    if (S.clues.includes(id)) return;
    S.clues.push(id); S.newClues.push(id);
    const c = DATA.clues[id];
    toast(`${c.conclusion ? 'New conclusion' : 'New clue'}: <b>${c.name}</b>`, Art.clueIcon(c.icon, 48));
    Sound.clue();
    updateHud(); save();
  }
  function unlockScene(id) {
    if (S.unlocked.includes(id)) return;
    S.unlocked.push(id);
    toast(`Location added to map: <b>${DATA.scenes[id].name}</b>`, '🗺');
    Sound.unlock(); save();
    if (S.scene) renderScene(); // exits may have appeared
  }
  function toast(html, iconHtml) {
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = `<span class="ticon">${iconHtml}</span><span>${html}</span>`;
    $('#toast-area').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2600);
  }
  function updateHud() {
    const badge = $('#notebook-badge');
    const availDed = DATA.deductions.filter(d => deductionAvailable(d) && !S.solved.includes(d.id)).length;
    const n = S.newClues.length + availDed;
    badge.hidden = n === 0; badge.textContent = n;
    const dbadge = $('#deduction-badge'); dbadge.hidden = availDed === 0; dbadge.textContent = availDed;
    const ready = DATA.deductions.every(d => S.solved.includes(d.id)) && !S.finished;
    $('#btn-accuse').hidden = !ready;
    if (ready && !S.flags.includes('accuse_ready')) { S.flags.push('accuse_ready'); save(); toast('Every deduction made. You can now <b>make an accusation</b>.', '⚖'); }
    $('#btn-sound').textContent = Sound.muted ? '🔇' : '🔊';
  }

  /* ---------------- SCENE RENDERING ---------------- */
  const sceneEl = $('#scene'), labelEl = $('#hotspot-label');
  function travel(id) {
    S.scene = id; save();
    Sound.travel();
    renderScene();
    const sc = DATA.scenes[id];
    $('#location-name').textContent = sc.name;
    if (!S.visited.includes(id)) { S.visited.push(id); save(); if (sc.intro) runSteps(sc.intro); }
  }

  function renderScene() {
    const id = S.scene, sc = DATA.scenes[id];
    let art = Art.SCENES[id](id === 'boathouse' ? Q.flag('pip_out') : true);
    // characters drawn into the art layer
    const chars = (sc.characters || []).filter(ch => !ch.requires || Q.flag(ch.requires));
    let charSvg = '';
    for (const ch of chars) {
      const look = DATA.characters[ch.id].look;
      charSvg += Art.character(look, ch.x, ch.y, ch.scale, ch.facing);
    }
    if (art.includes('%%MARIGOLD%%')) {
      const m = chars.find(c => c.id === 'marigold');
      art = art.replace('%%MARIGOLD%%', m ? Art.character(DATA.characters.marigold.look, m.x, m.y, m.scale, m.facing) : '');
      charSvg = '';
    }
    art = art.replace('%%CHARS%%', charSvg);

    // hotspots layer (not wobbled)
    const H = Art.helpers;
    let hs = '';
    for (const h of sc.hotspots) {
      if (h.condition && !h.condition(Q)) continue;
      hs += `<rect class="hotspot" data-hs="${h.id}" data-label="${h.label}" x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}"/>`;
    }
    for (const ch of chars) {
      const look = DATA.characters[ch.id].look;
      const hgt = 300 * ch.scale, wid = 200 * ch.scale;
      const top = ch.behind === 'window' ? ch.y - hgt : ch.y - hgt;
      const height = ch.behind === 'window' ? hgt * .62 : hgt;
      hs += `<rect class="hotspot char-hotspot" data-char="${ch.id}" data-label="${ch.label}" x="${ch.x - wid / 2}" y="${top}" width="${wid}" height="${height}"/>`;
    }
    for (const ex of sc.exits || []) {
      if (ex.requires && !S.unlocked.includes(ex.requires)) continue;
      const target = DATA.scenes[ex.to];
      hs += H.arrow(ex.x, ex.y, ex.dir);
      hs += `<rect class="hotspot exit-hotspot" data-exit="${ex.to}" data-label="${ex.label}" x="${ex.hx}" y="${ex.hy}" width="${ex.hw}" height="${ex.hh}"/>`;
    }
    sceneEl.innerHTML = `<svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><g filter="url(#wobble)">${art}</g>${hs}</svg>`;
    $('#location-name').textContent = sc.name;
    updateHud();
  }

  sceneEl.addEventListener('click', (e) => {
    const t = e.target.closest('.hotspot'); if (!t) return;
    if (dlg.busy) return;
    Sound.click();
    if (t.dataset.exit) { travel(t.dataset.exit); return; }
    if (t.dataset.char) { startDialogue(t.dataset.char); return; }
    const sc = DATA.scenes[S.scene];
    const h = sc.hotspots.find(x => x.id === t.dataset.hs);
    if (h) runSteps(h.act(Q), () => { hideDialogue(); renderScene(); });
  });
  sceneEl.addEventListener('mousemove', (e) => {
    const t = e.target.closest('.hotspot');
    if (!t || dlg.busy) { labelEl.classList.remove('show'); return; }
    const r = $('#play-screen').getBoundingClientRect();
    labelEl.textContent = t.dataset.label;
    labelEl.style.left = (e.clientX - r.left) + 'px'; labelEl.style.top = (e.clientY - r.top) + 'px';
    labelEl.classList.add('show');
  });
  sceneEl.addEventListener('mouseleave', () => labelEl.classList.remove('show'));

  /* ---------------- DIALOGUE WITH CHARACTERS ---------------- */
  let currentChar = null;
  function startDialogue(charId) {
    currentChar = charId;
    const d = DATA.dialogue[charId];
    runSteps(d.greet(Q), showTopicMenu);
  }
  function showTopicMenu() {
    const charId = currentChar, d = DATA.dialogue[charId], c = DATA.characters[charId];
    dlgEl.hidden = false; dlgCont.hidden = true; dlg.busy = true;
    dlgPortrait.classList.remove('narr'); dlgText.classList.remove('narr');
    dlgPortrait.innerHTML = Art.portrait(c.look); dlgName.textContent = c.name;
    dlgText.textContent = '';
    dlgChoices.innerHTML = ''; dlgChoices.hidden = false;
    const topics = d.topics.filter(t => !t.condition || t.condition(Q));
    for (const t of topics) {
      const key = `${charId}:${t.id}`;
      const b = document.createElement('button'); b.className = 'choice' + (S.talked.includes(key) ? ' done' : '');
      b.textContent = t.ask;
      b.onclick = () => {
        Sound.click();
        if (!S.talked.includes(key)) S.talked.push(key);
        save();
        dlgChoices.hidden = true; dlg.busy = false;
        runSteps(typeof t.reply === 'function' ? t.reply(Q) : t.reply, showTopicMenu);
      };
      dlgChoices.appendChild(b);
    }
    const present = document.createElement('button'); present.className = 'choice special'; present.textContent = '🔍 Show them a clue…';
    present.disabled = S.clues.length === 0;
    present.onclick = () => { Sound.click(); openPicker('Show which clue to ' + c.name + '?', S.clues, (clueId) => presentClue(charId, clueId)); };
    dlgChoices.appendChild(present);
    const leave = document.createElement('button'); leave.className = 'choice leave'; leave.textContent = 'That\'s all for now.';
    leave.onclick = () => { Sound.click(); currentChar = null; hideDialogue(); renderScene(); };
    dlgChoices.appendChild(leave);
  }
  function presentClue(charId, clueId) {
    const d = DATA.dialogue[charId];
    let r = d.present[clueId];
    if (r === 'proof') r = d.proof(Q);
    if (!r) r = d.present.default;
    dlgChoices.hidden = true; dlg.busy = false;
    runSteps(typeof r === 'function' ? r(Q) : r, showTopicMenu);
  }

  /* ---------------- CLUE PICKER ---------------- */
  const pickerEl = $('#picker-overlay');
  function openPicker(title, clueIds, onPick) {
    $('#picker-title').textContent = title;
    const grid = $('#picker-grid'); grid.innerHTML = '';
    if (!clueIds.length) grid.innerHTML = '<div class="nb-empty">You haven\'t found any clues yet.</div>';
    for (const id of clueIds) {
      const c = DATA.clues[id];
      const card = document.createElement('div'); card.className = 'clue-card' + (c.conclusion ? ' conclusion' : '');
      card.innerHTML = `<div class="cicon">${Art.clueIcon(c.icon)}</div><div class="cname">${c.name}</div>`;
      card.title = c.text;
      card.onclick = () => { Sound.click(); pickerEl.hidden = true; onPick(id); };
      grid.appendChild(card);
    }
    pickerEl.hidden = false;
  }

  /* ---------------- MAP ---------------- */
  function openMap() {
    const locs = Object.entries(DATA.scenes).filter(([, s]) => !s.hidden).map(([id, s]) => ({ id, ...s }));
    $('#map-art').innerHTML = Art.mapArt(locs, S.scene === 'tunnel' ? 'ghosttrain' : S.scene, new Set(S.unlocked));
    $('#map-overlay').hidden = false;
    $('#map-art').querySelectorAll('.map-pin').forEach(pin => {
      pin.addEventListener('click', () => {
        const id = pin.dataset.scene;
        if (!S.unlocked.includes(id)) { Sound.fail(); return; }
        Sound.click(); $('#map-overlay').hidden = true;
        if (id !== S.scene) { hideDialogue(); currentChar = null; travel(id); }
      });
    });
  }

  /* ---------------- NOTEBOOK ---------------- */
  let nbTab = 'clues';
  function openNotebook(tab) {
    if (tab) nbTab = tab;
    document.querySelectorAll('.nb-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === nbTab));
    renderNotebook();
    $('#notebook-overlay').hidden = false;
  }
  document.querySelectorAll('.nb-tab').forEach(b => b.addEventListener('click', () => { Sound.click(); openNotebook(b.dataset.tab); }));

  function renderNotebook() {
    const el = $('#nb-content');
    if (nbTab === 'clues') {
      if (!S.clues.length) { el.innerHTML = '<div class="nb-empty">No clues yet. Poke around. Detectives poke.</div>'; return; }
      const grid = document.createElement('div'); grid.className = 'clue-grid';
      for (const id of S.clues) {
        const c = DATA.clues[id];
        const card = document.createElement('div'); card.className = 'clue-card' + (c.conclusion ? ' conclusion' : '') + (S.newClues.includes(id) ? ' new' : '');
        card.innerHTML = `<div class="cicon">${Art.clueIcon(c.icon)}</div><div class="cname">${c.name}</div>`;
        card.onclick = () => { Sound.click(); showClueDetail(id); };
        grid.appendChild(card);
      }
      el.innerHTML = ''; el.appendChild(grid);
      // the NEW ribbons have been seen once; clear them for next time
      if (S.newClues.length) { S.newClues = []; save(); updateHud(); }
    } else if (nbTab === 'suspects') {
      const list = document.createElement('div'); list.className = 'suspect-list';
      const ids = ['barty', ...DATA.accusation.suspects, 'bramble'];
      for (const id of ids) {
        const c = DATA.characters[id];
        const met = id === 'barty' || S.flags.includes('met_' + id) || (S.notes[id] || []).length;
        const notes = S.notes[id] || [];
        const card = document.createElement('div'); card.className = 'suspect-card' + (id === 'barty' ? ' victim' : '');
        card.innerHTML = `<div class="sportrait">${Art.portrait(c.look)}</div><div><h3>${met ? c.name : '???'}</h3><div class="srole">${met ? c.role : 'Not yet met'}</div>${notes.length ? '<ul>' + notes.map(n => `<li>${n}</li>`).join('') + '</ul>' : '<div class="none">Nothing noted yet.</div>'}</div>`;
        list.appendChild(card);
      }
      el.innerHTML = ''; el.appendChild(list);
    } else if (nbTab === 'deductions') {
      const list = document.createElement('div'); list.className = 'deduction-list';
      list.innerHTML = '<div class="hint-box notes-list">Combine the clues you have found to reach a conclusion. A deduction unlocks once you hold every clue it needs.</div>';
      DATA.deductions.forEach((d, i) => {
        const solved = S.solved.includes(d.id), avail = deductionAvailable(d);
        const row = document.createElement('div'); row.className = 'deduction-row' + (solved ? ' solved' : avail ? '' : ' locked');
        row.innerHTML = `<div class="dnum">${i + 1}</div><div class="dtitle">${avail || solved ? d.title : 'Locked — keep investigating'}</div><div class="dstatus">${solved ? '✓ Solved' : avail ? 'Ready to deduce' : `${d.requires.filter(r => S.clues.includes(r)).length}/${d.requires.length} clues${d.requiresFlag && !Q.flag(d.requiresFlag) ? ' + a statement' : ''}`}</div>`;
        if (avail || solved) row.onclick = () => { Sound.click(); openDeduction(d); };
        list.appendChild(row);
      });
      el.innerHTML = ''; el.appendChild(list);
    } else if (nbTab === 'notes') {
      const hint = DATA.hints.find(h => h.when(Q));
      let html = `<div class="notes-list"><div class="hint-box"><b>What now?</b> ${hint ? hint.text : ''}</div>`;
      html += `<h3>The case so far</h3><ul>`;
      html += `<li>Victim: Bartholomew Quill, owner of Marshlight Fair. Found in the Ghost Train tunnel this morning.</li>`;
      if (Q.has('bartys_note')) html += `<li>Time of death between 9 and 10pm. He had arranged to meet "D" in the tunnel at nine.</li>`;
      if (Q.has('concl_key')) html += `<li>The killer left through the maintenance door — with a key.</li>`;
      if (Q.has('concl_staged')) html += `<li>The haunting was staged with a fog timer and a cut lighting wire.</li>`;
      if (Q.has('concl_motive')) html += `<li>The sale to Bellwether would have ended the Wraith attraction — and the fair.</li>`;
      if (Q.has('concl_alibi')) html += `<li>Doreen's tea room alibi is false.</li>`;
      if (Q.has('concl_glass')) html += `<li>The killer returned at dawn to replace the lantern's glass.</li>`;
      html += `</ul><h3>Progress</h3><ul><li>Clues found: ${S.clues.filter(c => !DATA.clues[c].conclusion).length} / ${Object.values(DATA.clues).filter(c => !c.conclusion).length}</li><li>Deductions solved: ${S.solved.length} / ${DATA.deductions.length}</li><li>Locations known: ${S.unlocked.length} / ${Object.values(DATA.scenes).filter(s => !s.hidden).length}</li></ul></div>`;
      el.innerHTML = html;
    }
  }
  function showClueDetail(id) {
    const c = DATA.clues[id];
    $('#nb-content').innerHTML = `<button class="back-link">← Back to clues</button><div class="clue-detail"><div class="cicon">${Art.clueIcon(c.icon)}</div><div><h3>${c.name}</h3><p>${c.text}</p>${c.conclusion ? '<p><em>A conclusion you reached yourself. Can be used like any other clue.</em></p>' : ''}</div></div>`;
    $('#nb-content .back-link').onclick = () => { Sound.click(); renderNotebook(); };
  }

  /* ---------------- DEDUCTIONS ---------------- */
  const deductionAvailable = (d) => d.requires.every(r => S.clues.includes(r)) && (!d.requiresFlag || Q.flag(d.requiresFlag));
  let dedState = null;
  function openDeduction(d) {
    const solved = S.solved.includes(d.id);
    dedState = { d, picks: solved ? d.answers.slice() : d.answers.map(() => null) };
    renderDeduction(solved ? 'solved' : null);
    $('#deduction-overlay').hidden = false;
  }
  function renderDeduction(status, wrongIdx = []) {
    const { d, picks } = dedState;
    const solved = status === 'solved';
    let tpl = '';
    for (const part of d.template) {
      if (typeof part === 'string') tpl += part;
      else {
        const pick = picks[part];
        const c = pick ? DATA.clues[pick] : null;
        const cls = 'slot' + (pick ? ' filled' : '') + (solved ? ' correct' : '') + (wrongIdx.includes(part) ? ' wrong' : '');
        tpl += `<span class="${cls}" data-slot="${part}">${c ? `<span class="sicon">${Art.clueIcon(c.icon, 32)}</span>${c.name}` : 'choose a clue'}</span>`;
      }
    }
    const el = $('#deduction-content');
    el.innerHTML = `<h3 class="ded-title">${d.title}</h3><div class="ded-question">${d.question}</div><div class="ded-template">${tpl}</div>` +
      (solved ? `<div class="ded-result">${d.result}</div><div class="ded-footer"><span></span><button class="big-btn secondary" id="ded-close">Close</button></div>`
        : `<div class="ded-footer"><div class="ded-msg" id="ded-msg">${status === 'wrong' ? 'Hmm. That doesn\'t quite fit. Try a different clue in the red slot.' : ''}</div><button class="big-btn" id="ded-go" ${picks.every(Boolean) ? '' : 'disabled'}>Deduce!</button></div>`);
    if (!solved) {
      el.querySelectorAll('.slot').forEach(sl => sl.onclick = () => {
        Sound.click();
        const idx = +sl.dataset.slot;
        openPicker('Which clue fits here?', S.clues, (clueId) => { picks[idx] = clueId; renderDeduction(null); });
      });
      $('#ded-go').onclick = () => {
        const wrong = [];
        d.answers.forEach((ans, i) => { const ok = Array.isArray(ans) ? ans.includes(picks[i]) : ans === picks[i]; if (!ok) wrong.push(i); });
        if (!wrong.length) {
          Sound.success();
          S.solved.push(d.id); save();
          renderDeduction('solved');
          if (d.conclusion) setTimeout(() => addClue(d.conclusion), 400);
          updateHud(); renderNotebook();
        } else {
          Sound.fail(); S.wrongGuesses++;
          wrong.forEach(i => picks[i] = null);
          renderDeduction('wrong', wrong);
        }
      };
    } else {
      $('#ded-close').onclick = () => { Sound.click(); $('#deduction-overlay').hidden = true; renderNotebook(); updateHud(); };
    }
  }

  /* ---------------- ACCUSATION ---------------- */
  let acc = null;
  function openAccusation() {
    acc = { step: -1, ruled: [] };
    $('#accuse-overlay').hidden = false;
    renderAccusation();
  }
  function renderAccusation(msg = '') {
    const A = DATA.accusation, el = $('#accuse-content');
    const progress = `<div class="acc-progress">${[0, ...A.questions.map((_, i) => i + 1)].map(i => `<span class="${i < acc.step + 1 ? 'done' : i === acc.step + 1 ? 'cur' : ''}"></span>`).join('')}</div>`;
    if (acc.step === -1) {
      el.innerHTML = `<h3 class="acc-title">Make an accusation</h3><div class="acc-question">Who killed Bartholomew Quill?</div><div class="acc-suspects">${A.suspects.map(id => `<div class="acc-suspect${acc.ruled.includes(id) ? ' ruled' : ''}" data-id="${id}"><div class="sportrait">${Art.portrait(DATA.characters[id].look)}</div><div class="sname">${DATA.characters[id].name}</div></div>`).join('')}</div><div class="acc-footer"><div class="acc-msg">${msg}</div>${progress}<button class="big-btn secondary" id="acc-cancel">Not yet</button></div>`;
      el.querySelectorAll('.acc-suspect').forEach(s => s.onclick = () => {
        const id = s.dataset.id;
        if (id === A.culprit) { Sound.success(); acc.step = 0; renderAccusation(); }
        else { Sound.fail(); S.wrongGuesses++; save(); if (!acc.ruled.includes(id)) acc.ruled.push(id); renderAccusation(A.wrongSuspect[id]); }
      });
      $('#acc-cancel').onclick = () => { Sound.click(); $('#accuse-overlay').hidden = true; };
    } else {
      const q = A.questions[acc.step];
      el.innerHTML = `<h3 class="acc-title">Accusing Doreen Quill</h3><div class="acc-question">${q.q}</div><div class="ded-template" style="flex:1;display:flex;align-items:center;justify-content:center;"><span class="slot" id="acc-slot" style="min-width:12em;height:2.4em;font-size:1em">choose a clue</span></div><div class="acc-footer"><div class="acc-msg">${msg}</div>${progress}<button class="big-btn secondary" id="acc-cancel">Step back</button></div>`;
      $('#acc-slot').onclick = () => openPicker('Which clue proves it?', S.clues, (clueId) => {
        if (q.accept.includes(clueId)) {
          Sound.success(); acc.step++;
          if (acc.step >= A.questions.length) finale(); else renderAccusation();
        } else { Sound.fail(); S.wrongGuesses++; save(); renderAccusation(q.wrong); }
      });
      $('#acc-cancel').onclick = () => { Sound.click(); $('#accuse-overlay').hidden = true; };
    }
  }
  function finale() {
    $('#accuse-overlay').hidden = true;
    S.finished = true; save();
    // gather everyone at the ghost train for the confession
    S.scene = 'ghosttrain';
    const sc = DATA.scenes.ghosttrain;
    let art = Art.SCENES.ghosttrain(false).replace('%%CHARS%%',
      Art.character(DATA.characters.tobias.look, 100, 505, .8, 1) + Art.character(DATA.characters.bramble.look, 250, 500, .8, 1) +
      Art.character(DATA.characters.doreen.look, 480, 505, .85, 1) + Art.character(DATA.characters.reg.look, 640, 500, .8, -1) +
      Art.character(DATA.characters.marigold.look, 800, 500, .76, -1) + Art.character(DATA.characters.pip.look, 910, 512, .66, -1));
    sceneEl.innerHTML = `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"><g filter="url(#wobble)">${art}</g></svg>`;
    $('#location-name').textContent = 'The Ghost Train — Case Closed';
    updateHud();
    runSteps(DATA.accusation.finale, () => { hideDialogue(); showEnding(); });
  }
  function showEnding() {
    const mins = Math.max(1, Math.round((Date.now() - S.startedAt) / 60000));
    $('#end-art').innerHTML = Art.titleArt(DATA.characters.det.look);
    $('#end-stats').innerHTML = `Doreen Quill confessed. The Wraith is innocent — of this, at least.<br>Clues found: ${S.clues.filter(c => !DATA.clues[c].conclusion).length} / ${Object.values(DATA.clues).filter(c => !c.conclusion).length} &nbsp;·&nbsp; Wrong guesses: ${S.wrongGuesses} &nbsp;·&nbsp; Time: ${mins} min`;
    show('end-screen');
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }

  /* ---------------- BUTTONS / KEYS ---------------- */
  $('#btn-map').onclick = () => { if (dlg.busy && !currentChar) return; Sound.click(); openMap(); };
  $('#btn-notebook').onclick = () => { Sound.click(); openNotebook(); };
  $('#btn-accuse').onclick = () => { Sound.click(); openAccusation(); };
  $('#btn-sound').onclick = () => { Sound.toggle(); updateHud(); };
  document.querySelectorAll('.close-btn').forEach(b => b.onclick = () => { Sound.click(); $('#' + b.dataset.close).hidden = true; if (b.dataset.close === 'deduction-overlay') { renderNotebook(); updateHud(); } });
  document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', (e) => { if (e.target === o && o.id !== 'accuse-overlay') { o.hidden = true; if (o.id === 'deduction-overlay') { renderNotebook(); updateHud(); } } }));
  document.addEventListener('keydown', (e) => {
    if ($('#play-screen').hidden) return;
    const anyOpen = [...document.querySelectorAll('.overlay')].some(o => !o.hidden);
    if (e.key === 'Escape') { document.querySelectorAll('.overlay').forEach(o => { if (o.id !== 'accuse-overlay') o.hidden = true; }); renderNotebook(); updateHud(); }
    if (anyOpen) return;
    if (e.key === 'n' || e.key === 'N') openNotebook();
    if (e.key === 'm' || e.key === 'M') openMap();
    if ((e.key === ' ' || e.key === 'Enter') && dlg.busy && dlgChoices.hidden) { e.preventDefault(); $('#dlg-body').click(); }
  });

  /* ---------------- BOOT ---------------- */
  function startGame(state) {
    S = state;
    show('play-screen');
    hideDialogue();
    travel(S.scene);
  }
  $('#global-defs').innerHTML = Art.DEFS;
  $('#title-art').innerHTML = Art.titleArt(DATA.characters.det.look);
  const saved = load();
  if (saved && !saved.finished) $('#btn-continue').hidden = false;
  $('#btn-new').onclick = () => { Sound.click(); startGame(freshState()); };
  $('#btn-continue').onclick = () => { Sound.click(); startGame(saved); };
  $('#btn-again').onclick = () => { Sound.click(); startGame(freshState()); };
})();
