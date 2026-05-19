(function () {
  'use strict';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ============================================================
     STATE
  ============================================================ */
  const chyronLabel = $('#chyron-label');
  const chyronSub   = $('#chyron-sub');

  function setChyron(label, sub) {
    chyronLabel.textContent = label;
    chyronSub.textContent = sub;
  }

  function showChapter(id) {
    $$('.chapter').forEach((c) => c.classList.toggle('active', c.id === id));
  }

  /* ============================================================
     CHAPTER 1 — Inbox triage (Gmail-style)
  ============================================================ */
  const INBOX_ROWS = [
    {
      from: 'Maria Holm', avatar: 'm',
      subject: 'Tilbud på vinduespudsning',
      preview: 'Hej, vi har et hus i Aarhus C med ca. 18 vinduer på 2 etager. Vi vil gerne ...',
      time: '21:43',
      label: { text: 'Nyt lead', cls: 'green' },
      highlight: true,
    },
    {
      from: 'Søren Jensen', avatar: 's',
      subject: 'Kan vi flytte vores fredag-tid?',
      preview: 'Hej Anders, jeg er desværre nødt til at rykke pudsningen fra fredag til onsdag ...',
      time: '20:18',
      label: { text: 'Booking-ændring', cls: 'blue' },
    },
    {
      from: 'Lars Petersen', avatar: 'l',
      subject: 'Pris på pudsning + tagrensning',
      preview: 'Vi har et større parcelhus i Risskov og er interesseret i både vinduespudsning ...',
      time: '18:52',
      label: { text: 'Spørgsmål', cls: 'orange' },
    },
    {
      from: 'Anne Mortensen', avatar: 'a',
      subject: 'Striber efter sidste besøg',
      preview: 'Hej Anders, der var desværre tydelige striber på de fleste vinduer efter sidste ...',
      time: '17:31',
      label: { text: 'Hastesag', cls: 'red' },
    },
    {
      from: 'DanInvoice', avatar: 'j',
      subject: 'Faktura 2403 — Topglans Vinduespolering',
      preview: 'Vedhæftet finder du månedens faktura for jeres abonnement på Bookingsystemet ...',
      time: '14:09',
      label: { text: 'Faktura', cls: 'gray' },
    },
  ];

  async function playInbox() {
    setChyron('INDBAKKEN', 'Mail-agenten klassificerer automatisk');
    showChapter('ch-inbox');

    const list = $('#gmail-rows');
    const counter = $('#inbox-count');
    list.innerHTML = '';
    counter.textContent = '0';

    await sleep(900);

    // Step 1: emails arrive one by one (no labels yet)
    for (let i = 0; i < INBOX_ROWS.length; i++) {
      const r = INBOX_ROWS[i];
      const row = document.createElement('li');
      row.className = 'row unread' + (r.highlight ? ' highlight' : '');
      row.innerHTML = `
        <input type="checkbox" tabindex="-1" />
        <i class="fa-regular fa-star row-star"></i>
        <div class="row-from">
          <span class="avatar avatar-${r.avatar}" style="width:22px;height:22px;font-size:0.7rem;display:inline-flex;margin-right:8px;vertical-align:middle">${r.from[0]}</span>
          ${r.from}
        </div>
        <div class="row-subject">
          ${r.subject} <em>— ${r.preview}</em>
        </div>
        <div class="row-time">
          <span class="row-label" data-i="${i}"></span>
          <div style="margin-top:2px">${r.time}</div>
        </div>
      `;
      list.appendChild(row);
      counter.textContent = String(i + 1);
      await sleep(80);
      row.classList.add('in');
      await sleep(900);
    }

    await sleep(1400);

    // Step 2: labels fade in
    setChyron('INDBAKKEN', 'AI tildeler etiketter på ~0,3 sek pr. mail');
    for (let i = 0; i < INBOX_ROWS.length; i++) {
      const r = INBOX_ROWS[i];
      const target = list.querySelector(`.row-label[data-i="${i}"]`);
      const lbl = document.createElement('span');
      lbl.className = `lbl ${r.label.cls}`;
      lbl.innerHTML = `<span class="lbl-dot ${r.label.cls}"></span>${r.label.text}`;
      target.appendChild(lbl);
      requestAnimationFrame(() => lbl.classList.add('appear'));
      await sleep(700);
    }

    await sleep(2400);
  }

  /* ============================================================
     CHAPTER 2 — Open mail + AI draft
  ============================================================ */
  const MAIL_BODY = [
    'Hej Anders,',
    'Vi har set Topglans anbefalet af vores nabo Hanne i Aarhus C. Vi har et toetagers hus med ca. 18 vinduer og kunne godt tænke os at få et tilbud på fast vinduespudsning hver 8. uge — gerne med besøg første gang inden weekenden, hvis det kan lade sig gøre.',
    'Hvad ville det ca. koste, og hvornår kan I komme forbi?',
    'De bedste hilsner,\nMaria Holm',
  ];
  const DRAFT_BODY = [
    'Hej Maria,',
    'Tak for jeres henvendelse — og en stor tak til Hanne for omtalen 🙂',
    'Baseret på et toetagers hus med 18 vinduer kommer vores tilbud på <strong>860 kr. pr. besøg</strong> ved fast aftale hver 8. uge. Første ledige tid hos jer er <strong>torsdag d. 21. maj kl. 10:00</strong>, og den passer fint ind i vores rute i Aarhus C.',
    'Bekræft ved at svare på denne mail, så er I i kalenderen og modtager en SMS-påmindelse aftenen før.',
    'De bedste hilsner,\nAnders · Topglans Vinduespolering',
  ];

  async function playMail() {
    setChyron('NYT LEAD', 'Mail-agenten foreslår et svar');
    showChapter('ch-mail');

    const incomingBody = $('#mail-incoming-body');
    const draftBody = $('#mail-draft-body');
    const draftCard = $('#mail-draft');

    incomingBody.innerHTML = '';
    draftBody.innerHTML = '';
    draftCard.classList.remove('in');
    const sendBtn = $('.btn-send');
    if (sendBtn) sendBtn.classList.remove('glow');

    await sleep(700);

    // Type the incoming email
    for (const para of MAIL_BODY) {
      const p = document.createElement('p');
      p.innerHTML = para.replace(/\n/g, '<br/>');
      incomingBody.appendChild(p);
      requestAnimationFrame(() => p.classList.add('in'));
      await sleep(900);
    }

    await sleep(1500);

    // Show draft card
    setChyron('NYT LEAD', 'AI har skrevet et udkast');
    draftCard.classList.add('in');
    await sleep(700);

    for (const para of DRAFT_BODY) {
      const p = document.createElement('p');
      p.innerHTML = para.replace(/\n/g, '<br/>');
      draftBody.appendChild(p);
      requestAnimationFrame(() => p.classList.add('in'));
      await sleep(950);
    }

    await sleep(900);
    if (sendBtn) sendBtn.classList.add('glow');
    await sleep(2800);
  }

  /* ============================================================
     CHAPTER 3 — Calendar booking
  ============================================================ */
  const CAL_EVENTS = [
    { topPct: 4,  heightPct: 13, title: 'Familien Holm', loc: 'Risskov', time: '08:30 – 09:30', state: 'busy' },
    { topPct: 25, heightPct: 13, title: 'Maria Holm', loc: 'Aarhus C', time: '10:00 – 11:00', state: 'new' },
    { topPct: 46, heightPct: 13, title: 'Café Mocca', loc: 'Aarhus C', time: '11:30 – 12:30', state: 'busy' },
    { topPct: 67, heightPct: 13, title: 'Søren Pedersen', loc: 'Højbjerg', time: '13:00 – 14:00', state: 'busy' },
  ];

  async function playCalendar() {
    setChyron('KALENDER', 'Booking-agenten finder pladsen');
    showChapter('ch-calendar');

    const day = $('#gcal-day');
    day.innerHTML = '';
    $('.gcal-route').classList.remove('in');

    await sleep(800);

    // First add busy events
    const busy = CAL_EVENTS.filter(e => e.state === 'busy');
    for (const e of busy) {
      const el = renderEvent(e);
      day.appendChild(el);
      await sleep(120);
      el.classList.add('in');
      await sleep(620);
    }

    await sleep(900);

    // Now add new event
    setChyron('KALENDER', 'Nyt lead bookes uden dobbeltbooking');
    const newEv = CAL_EVENTS.find(e => e.state === 'new');
    const el = renderEvent(newEv);
    day.appendChild(el);
    await sleep(160);
    el.classList.add('in');
    await sleep(1500);

    // Route badge
    $('.gcal-route').classList.add('in');
    await sleep(2800);
  }

  function renderEvent(e) {
    const el = document.createElement('div');
    el.className = 'event ' + e.state;
    el.style.top = e.topPct + '%';
    el.style.height = e.heightPct + '%';
    el.innerHTML = `
      <div class="event-time">${e.time}</div>
      <div class="event-title">${e.title}</div>
      <div class="event-loc">${e.loc}</div>
    `;
    return el;
  }

  /* ============================================================
     CHAPTER 4 — SMS reactivation
  ============================================================ */
  const SMS_THREAD = [
    { type: 'meta', text: 'iMessage · 8 uger efter sidste besøg' },
    { type: 'them', html: 'Hej Maria 👋 Det er 8 uger siden, vi var hos jer i Aarhus C — vinduerne trænger nok igen. Næste ledige tur i jeres område er <strong>tirsdag 14/7 kl. 09:00</strong>. Svar <strong>JA</strong> for at booke direkte. /Topglans' },
    { type: 'me',   html: 'JA tak' },
    { type: 'them', html: '✓ Booket. Du får en påmindelse aftenen før, og kvitteringen er på vej til din mail.' },
    { type: 'meta', text: 'I dag 11:34' },
  ];

  async function playSms() {
    setChyron('SMS', 'Opfølgnings-agenten henter kunden tilbage');
    showChapter('ch-sms');

    const thread = $('#sms-thread');
    thread.innerHTML = '';
    await sleep(900);

    for (const m of SMS_THREAD) {
      if (m.type === 'meta') {
        const el = document.createElement('div');
        el.className = 'ios-meta';
        el.textContent = m.text;
        thread.appendChild(el);
        await sleep(60);
        el.classList.add('in');
        await sleep(800);
      } else {
        const el = document.createElement('div');
        el.className = 'ios-bubble ' + (m.type === 'them' ? 'from-them' : 'from-me');
        el.innerHTML = m.html;
        thread.appendChild(el);
        await sleep(80);
        el.classList.add('in');
        await sleep(m.type === 'them' ? 2200 : 1200);
      }
    }
    await sleep(2400);
  }

  /* ============================================================
     CHAPTER 5 — Review collection
  ============================================================ */
  async function playReview() {
    setChyron('ANMELDELSER', 'Reputations-agenten samler stjernerne ind');
    showChapter('ch-review');

    const result = $('#review-result');
    const stars = $$('#review-stars i');
    result.classList.remove('in');
    stars.forEach(s => s.classList.remove('lit'));

    await sleep(2400);

    result.classList.add('in');
    await sleep(700);

    for (const s of stars) {
      s.classList.add('lit');
      await sleep(280);
    }
    await sleep(3400);
  }

  /* ============================================================
     CHAPTER 6 — Dashboard
  ============================================================ */
  async function playDashboard() {
    setChyron('OVERBLIK', 'Hvad agenten leverer på 30 dage');
    showChapter('ch-dash');

    const kpis = $$('.kpi');
    kpis.forEach((k) => { k.classList.remove('in'); k.querySelector('.kpi-val').textContent = '0'; });

    await sleep(700);

    for (let i = 0; i < kpis.length; i++) {
      kpis[i].classList.add('in');
      await sleep(180);
    }

    await sleep(400);

    // Count up numbers in parallel
    kpis.forEach((k) => countUp(k));

    await sleep(4500);
  }

  function countUp(kpi) {
    const valEl = kpi.querySelector('.kpi-val');
    const targetRaw = kpi.dataset.target;
    const suffix = kpi.dataset.suffix || '';
    const decimals = parseInt(kpi.dataset.dec || '0', 10);
    const target = parseFloat(targetRaw.replace(',', '.'));
    const dur = 1400;
    let start = null;
    function tick(ts) {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      if (p >= 1) {
        valEl.textContent = targetRaw + suffix;
        return;
      }
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      valEl.textContent = val.toFixed(decimals).replace('.', ',') + suffix;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    // Belt-and-braces: force final value after duration
    setTimeout(() => { valEl.textContent = targetRaw + suffix; }, dur + 200);
  }

  /* ============================================================
     MASTER SEQUENCE
  ============================================================ */
  const CHAPTERS = {
    inbox:    playInbox,
    mail:     playMail,
    calendar: playCalendar,
    sms:      playSms,
    review:   playReview,
    dashboard:playDashboard,
  };

  async function playAll() {
    await playInbox();
    await playMail();
    await playCalendar();
    await playSms();
    await playReview();
    await playDashboard();
  }

  function init() {
    const url = new URL(location.href);
    const only = url.searchParams.get('only');
    if (only && CHAPTERS[only]) {
      CHAPTERS[only]();
      return;
    }
    playAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
