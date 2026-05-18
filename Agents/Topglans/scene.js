(function () {
  'use strict';

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const scenes = ['scene-1','scene-2','scene-3','scene-4','scene-5'];

  function showScene(i) {
    scenes.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (idx === i) el.classList.add('active');
      else el.classList.remove('active');
    });
    document.getElementById('counter').textContent = String(i + 1).padStart(2, '0');
  }

  function setClock(text) { document.getElementById('clock').textContent = text; }

  /* ============ SCENE 1: chat capture ============ */
  async function playScene1() {
    showScene(0);
    setClock('21:47');
    const body = document.getElementById('s1-body');
    body.innerHTML = '';

    await sleep(800);
    await typeBubble(body, 'bot', 'Hej 👋 Jeg ser at du skriver til Topglans efter lukketid — hvordan kan jeg hjælpe dig?');
    await sleep(700);
    await typeBubble(body, 'user', 'Kan I komme og pudse mine vinduer på fredag?');
    await sleep(600);
    await typeBubble(body, 'bot', 'Det skal jeg helt sikkert prøve at finde tid til. Hvor bor du, og er det hus eller lejlighed?');
    await sleep(700);
    await typeBubble(body, 'user', 'Hus i 8000 Aarhus, 18 vinduer, 2 etager');
    await sleep(600);
    await typeBubble(body, 'bot', 'Perfekt. Estimat: 860 kr. pr. besøg ved fast aftale hver 8. uge. Jeg har en åben tid fredag 22/5 kl. 09:00 — skal jeg booke?');
    await sleep(700);
    await typeBubble(body, 'user', 'Ja tak!');
    await sleep(600);
    await typeBubble(body, 'bot', '✓ Booket. Bekræftelse sendt til Maria. Anders ringer dagen før.');
    await sleep(700);

    // Notification pops on top
    const notif = document.getElementById('notif');
    notif.classList.add('in');
    await sleep(2400);
    notif.classList.remove('in');
  }

  async function typeBubble(parent, role, text) {
    const typing = document.createElement('div');
    typing.className = `msg ${role}`;
    if (role === 'bot') typing.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    else typing.textContent = '';
    parent.appendChild(typing);
    parent.scrollTop = parent.scrollHeight;
    await sleep(role === 'bot' ? 700 : 350);
    typing.innerHTML = text;
    parent.scrollTop = parent.scrollHeight;
    await sleep(role === 'bot' ? 350 : 200);
  }

  /* ============ SCENE 2: mail ============ */
  async function playScene2() {
    showScene(1);
    setClock('21:47:32');
    const tags = document.getElementById('s2-tags');
    const body = document.getElementById('s2-body');
    tags.innerHTML = '';
    body.innerHTML = '';

    await sleep(600);
    const tagDefs = [
      ['green', 'Nyt lead'],
      ['blue', 'Hus · 18 vinduer'],
      ['gold', 'Fast aftale · hver 8. uge'],
    ];
    for (const [cls, label] of tagDefs) {
      const t = document.createElement('span');
      t.className = `tag ${cls} pop-in`;
      t.textContent = label;
      tags.appendChild(t);
      await sleep(180);
      t.classList.add('in');
    }
    await sleep(600);

    const lines = [
      '<p>Hej Maria,</p>',
      '<p>Tak for din henvendelse — du er nu i kalenderen <strong>fredag d. 22. maj kl. 09:00</strong>.</p>',
      '<p>Vores tilbud lyder på <strong>860 kr.</strong> pr. besøg ved fast aftale hver 8. uge. Du modtager en SMS-påmindelse aftenen før.</p>',
      '<p>De bedste hilsner,<br/>Anders · Topglans</p>',
    ];
    for (const html of lines) {
      const p = document.createElement('div');
      p.className = 'fade-in';
      p.innerHTML = html;
      body.appendChild(p);
      await sleep(120);
      p.classList.add('in');
      await sleep(360);
    }
    await sleep(1400);
  }

  /* ============ SCENE 3: calendar ============ */
  async function playScene3() {
    showScene(2);
    setClock('21:47:35');
    const day = document.getElementById('s3-day');
    // reset
    [...day.querySelectorAll('.cal-slot')].forEach(s => s.remove());
    document.getElementById('s3-route').classList.remove('in');

    const slots = [
      { time: '08:30', who: 'Familien Holm · Risskov', state: 'busy' },
      { time: '10:00', who: 'Maria K. · 8000 Aarhus C', state: 'new', icon: true },
      { time: '11:30', who: 'Café Mocca · Centrum', state: 'busy' },
      { time: '13:00', who: 'Søren P. · Højbjerg', state: 'busy' },
    ];
    for (const s of slots) {
      const el = document.createElement('div');
      el.className = `cal-slot ${s.state} pop-in`;
      el.innerHTML = `<span>${s.time}</span><em>${s.who}${s.icon ? ' <i class="fa-solid fa-bolt"></i>' : ''}</em>`;
      day.appendChild(el);
      await sleep(180);
      el.classList.add('in');
    }
    await sleep(600);
    document.getElementById('s3-route').classList.add('in');
    await sleep(2200);
  }

  /* ============ SCENE 4: SMS ============ */
  async function playScene4() {
    showScene(3);
    setClock('+ 8 uger');
    const sms = document.getElementById('s4-sms');
    sms.innerHTML = '';
    document.getElementById('s4-stat').classList.remove('in');

    const bubbles = [
      { role: 'out', html: 'Hej Maria 👋 Vi var hos jer for 8 uger siden — vinduerne trænger nok igen. Næste ledige tur i 8000 er <strong>tirsdag 14. juli kl. 09:00</strong>. Svar <strong>JA</strong> for at booke. /Topglans' },
      { role: 'in',  html: 'JA' },
      { role: 'out small', html: '<i class="fa-solid fa-check-double"></i> Booket. Kalender opdateret. Bekræftelse på vej.' },
    ];
    for (const b of bubbles) {
      const el = document.createElement('div');
      el.className = `sms-bubble ${b.role} pop-in`;
      el.innerHTML = b.html;
      sms.appendChild(el);
      await sleep(160);
      el.classList.add('in');
      await sleep(b.role === 'in' ? 700 : 1100);
    }
    await sleep(500);
    document.getElementById('s4-stat').classList.add('in');
    await sleep(2000);
  }

  /* ============ SCENE 5: impact ============ */
  async function playScene5() {
    showScene(4);
    setClock('READY');

    const nums = document.querySelectorAll('.impact-num');
    nums.forEach(n => n.classList.remove('in'));
    await sleep(400);

    for (let i = 0; i < nums.length; i++) {
      const n = nums[i];
      await sleep(120);
      n.classList.add('in');
      const target = n.dataset.target;
      animateNumber(n, target);
      await sleep(700);
    }
    await sleep(3000);
  }

  function animateNumber(el, target) {
    // Parse number out: e.g. "+7,5 t" or "+23 %" or "4,9 ★"
    const match = target.match(/(-?\d+(?:[,.]?\d)?)/);
    if (!match) { el.textContent = target; return; }
    const finalVal = parseFloat(match[1].replace(',', '.'));
    const prefix = target.slice(0, target.indexOf(match[1]));
    const suffix = target.slice(target.indexOf(match[1]) + match[1].length);
    const decimals = match[1].includes(',') || match[1].includes('.') ? 1 : 0;

    let start = null;
    const duration = 1100;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = (finalVal * eased).toFixed(decimals).replace('.', ',');
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  }

  /* ============ MASTER LOOP ============ */
  async function playOnce() {
    await playScene1();
    await sleep(400);
    await playScene2();
    await sleep(400);
    await playScene3();
    await sleep(400);
    await playScene4();
    await sleep(400);
    await playScene5();
    await sleep(600);
  }

  // Allow URL param to jump to a single scene: ?scene=1..5
  function init() {
    const url = new URL(location.href);
    const single = parseInt(url.searchParams.get('scene'), 10);
    if (single >= 1 && single <= 5) {
      const fn = [playScene1, playScene2, playScene3, playScene4, playScene5][single - 1];
      fn();
      return;
    }
    if (url.searchParams.has('loop')) {
      (async function loop() {
        while (true) { await playOnce(); }
      })();
    } else {
      playOnce();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
