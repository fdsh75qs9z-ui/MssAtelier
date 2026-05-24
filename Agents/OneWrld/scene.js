(function () {
  'use strict';
  const scenes = [...document.querySelectorAll('.scene')];
  const fill = document.getElementById('progress-fill');
  const controls = document.getElementById('controls');
  const replay = document.getElementById('replay');
  const chatBody = document.getElementById('reel-chat');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  let idx = -1;
  let timer = null;
  let runId = 0;

  const turns = [
    { r: 'user', t: 'er Core Hoodie oversized? jeg er 178' },
    { r: 'bot', t: 'Yo! 🖤 Ja, den er boxy/oversized. Ved 178 cm rammer M et clean fit — L hvis du vil have den rigtig stor.' },
    { r: 'user', t: 'tag en M' },
    { r: 'sys', t: 'Lagt i kurv' },
    { r: 'bot', t: 'Done ✓ Folk tager ofte Atlas Cargo til — så er fittet komplet. Skal jeg lægge et par ved?' },
    { r: 'user', t: 'ja gør det' },
    { r: 'bot', t: 'Sweet — kurv: 1.398 kr., du har fri fragt 🎉 Sender betaling + bytte-garanti til din mail.' },
  ];

  function bubble(role, text) {
    const el = document.createElement('div');
    el.className = 'bubble ' + (role === 'user' ? 'user' : role === 'sys' ? 'sys' : 'bot');
    el.textContent = text;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    return el;
  }
  function typing() {
    const el = document.createElement('div');
    el.className = 'bubble bot';
    el.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    return el;
  }

  async function playChat(myRun) {
    if (!chatBody) return;
    chatBody.innerHTML = '';
    for (const turn of turns) {
      if (myRun !== runId) return;
      if (turn.r === 'bot') { const ty = typing(); await wait(1050); if (myRun !== runId) { ty.remove(); return; } ty.remove(); }
      else { await wait(turn.r === 'sys' ? 400 : 650); }
      if (myRun !== runId) return;
      bubble(turn.r, turn.t);
      await wait(turn.r === 'bot' ? 1150 : 500);
    }
  }

  function activate(i, myRun) {
    scenes.forEach((s, n) => s.classList.toggle('active', n === i));
    const dur = +scenes[i].dataset.dur || 4000;
    fill.style.transition = 'none';
    fill.style.width = '0%';
    // force reflow so the width reset applies before animating
    void fill.offsetWidth;
    fill.style.transition = `width ${dur}ms linear`;
    fill.style.width = '100%';
    if (scenes[i].id === 's-chat') playChat(myRun);
    timer = setTimeout(() => { if (myRun === runId) next(myRun); }, dur);
  }

  function next(myRun) {
    idx++;
    if (idx < scenes.length) activate(idx, myRun);
    else end();
  }

  function end() {
    scenes.forEach((s) => s.classList.remove('active'));
    fill.style.width = '0%';
    controls.classList.add('show');
  }

  function start() {
    clearTimeout(timer);
    runId++;
    idx = -1;
    controls.classList.remove('show');
    if (chatBody) chatBody.innerHTML = '';
    next(runId);
  }

  if (replay) replay.addEventListener('click', start);
  start();
})();
