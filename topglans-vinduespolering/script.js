(function () {
  'use strict';

  const COVERAGE_ZIPS = [
    7500, 7600, 7620, 7650, 7660, 7800, 7830, 7840, 7850, 7860, 7870, 7884,
    8000, 8200, 8210, 8220, 8230, 8240, 8250, 8260, 8270, 8300, 8310, 8320,
    8330, 8340, 8355, 8362, 8380, 8381, 8382, 8410, 8420, 8462, 8464, 8471,
    8800, 8830, 8831, 8832, 8840, 8850, 8860, 8870, 8881, 8920, 8930, 8940, 8950, 8960,
  ];

  const PROPERTY_OPTIONS = ['Hus', 'Lejlighed', 'Erhverv'];
  const FREQUENCY_OPTIONS = ['Engangs', 'Hver 4. uge', 'Hver 8. uge', 'Hver 12. uge'];
  const TIME_SLOTS = [
    { id: 'tors10', label: 'Torsdag 21/5 · 10:00' },
    { id: 'fre09',  label: 'Fredag 22/5 · 09:00' },
    { id: 'fre1330',label: 'Fredag 22/5 · 13:30' },
  ];

  const body = document.getElementById('chat-body');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const suggestions = document.getElementById('chat-suggestions');
  const tickerList = document.getElementById('ticker-list');
  const scoreFill = document.getElementById('score-fill');
  const scoreText = document.getElementById('score-text');
  const resetBtn = document.getElementById('chat-reset');

  const state = {
    step: 'greet',
    data: {},
  };

  function init() {
    body.innerHTML = '';
    suggestions.innerHTML = '';
    tickerList.innerHTML = '<li class="empty">Endnu intet — start samtalen til venstre.</li>';
    scoreFill.style.width = '0%';
    scoreText.textContent = 'Venter på data...';
    scoreText.classList.remove('hot');
    state.step = 'greet';
    state.data = {};
    input.value = '';
    input.disabled = false;
    setTimeout(() => greet(), 250);
  }

  /* ============ RENDERING ============ */

  function addMsg(text, role = 'bot', { html = false } = {}) {
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    if (html) el.innerHTML = text;
    else el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg bot';
    el.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function botSay(text, opts = {}) {
    const typing = showTyping();
    const delay = Math.min(900 + text.length * 12, 1800);
    return new Promise((res) => {
      setTimeout(() => {
        typing.remove();
        addMsg(text, 'bot', opts);
        res();
      }, delay);
    });
  }

  function setSuggestions(items) {
    suggestions.innerHTML = '';
    if (!items || !items.length) return;
    items.forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.addEventListener('click', () => handleUserInput(label));
      suggestions.appendChild(btn);
    });
  }

  /* ============ TICKER ============ */

  function updateTicker() {
    const empty = !Object.keys(state.data).length;
    tickerList.innerHTML = '';
    if (empty) {
      tickerList.innerHTML = '<li class="empty">Endnu intet — start samtalen til venstre.</li>';
    } else {
      const entries = [];
      if (state.data.zip) {
        entries.push({
          icon: 'fa-location-dot',
          lbl: 'Postnummer',
          val: `${state.data.zip}${state.data.coverage === false ? ' · uden for vores rute' : ' · dækkes'}`,
        });
      }
      if (state.data.property) entries.push({ icon: 'fa-house', lbl: 'Boligtype', val: state.data.property });
      if (state.data.windows) entries.push({ icon: 'fa-window-maximize', lbl: 'Omfang', val: `${state.data.windows} vinduer${state.data.floors ? ' · ' + state.data.floors + ' etager' : ''}` });
      if (state.data.frequency) entries.push({ icon: 'fa-repeat', lbl: 'Frekvens', val: state.data.frequency });
      if (state.data.estimate) entries.push({ icon: 'fa-tag', lbl: 'Estimat pr. besøg', val: `${state.data.estimate} kr.` });
      if (state.data.slot) entries.push({ icon: 'fa-calendar-check', lbl: 'Booket tid', val: state.data.slot });
      if (state.data.contact) entries.push({ icon: 'fa-envelope', lbl: 'Kontakt', val: state.data.contact });
      entries.forEach((e) => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid ${e.icon}"></i><div><strong>${e.lbl}</strong>${e.val}</div>`;
        tickerList.appendChild(li);
      });
    }

    const score = computeScore();
    scoreFill.style.width = score + '%';
    if (score === 0) {
      scoreText.textContent = 'Venter på data...';
      scoreText.classList.remove('hot');
    } else if (score < 40) {
      scoreText.textContent = 'Kvalificerer kunden...';
      scoreText.classList.remove('hot');
    } else if (score < 80) {
      scoreText.textContent = 'Lead er ved at modnes';
      scoreText.classList.remove('hot');
    } else {
      scoreText.textContent = 'Varmt lead · klar til Anders';
      scoreText.classList.add('hot');
    }
  }

  function computeScore() {
    let s = 0;
    if (state.data.zip) s += 18;
    if (state.data.coverage === false) s -= 12;
    if (state.data.property) s += 15;
    if (state.data.windows) s += 18;
    if (state.data.frequency) s += 15;
    if (state.data.estimate) s += 12;
    if (state.data.slot) s += 14;
    if (state.data.contact) s += 8;
    return Math.max(0, Math.min(100, s));
  }

  /* ============ PARSING ============ */

  function parseZip(str) {
    const m = str.match(/\b(\d{4})\b/);
    return m ? parseInt(m[1], 10) : null;
  }

  function parseNumber(str) {
    const map = {
      'en': 1, 'et': 1, 'to': 2, 'tre': 3, 'fire': 4, 'fem': 5, 'seks': 6,
      'syv': 7, 'otte': 8, 'ni': 9, 'ti': 10, 'tolv': 12, 'femten': 15, 'tyve': 20,
    };
    const m = str.match(/\b(\d{1,3})\b/);
    if (m) return parseInt(m[1], 10);
    for (const w in map) if (new RegExp('\\b' + w + '\\b', 'i').test(str)) return map[w];
    return null;
  }

  function parseProperty(str) {
    const s = str.toLowerCase();
    if (/erhverv|kontor|butik|caf[ée]|restaurant|virksom|firma|sal[oó]n|forretning/.test(s)) return 'Erhverv';
    if (/lejlighed|etage|altan|opgang|3\.\s?sal|2\.\s?sal/.test(s)) return 'Lejlighed';
    if (/hus|villa|r[æae]kke|parcel|sommerhus|hjem/.test(s)) return 'Hus';
    return null;
  }

  function parseFrequency(str) {
    const s = str.toLowerCase();
    if (/engang|en gang|enkelt|f[øo]rste/.test(s)) return 'Engangs';
    if (/\b4\b|hver 4|m[åa]ned/.test(s)) return 'Hver 4. uge';
    if (/\b8\b|hver 8|to m[åa]ned|2 m[åa]ned/.test(s)) return 'Hver 8. uge';
    if (/\b12\b|hver 12|kvartal|tre m[åa]ned|3 m[åa]ned/.test(s)) return 'Hver 12. uge';
    if (/fast|abon|l[øo]bende/.test(s)) return 'Hver 8. uge';
    return null;
  }

  function parseContact(str) {
    const email = str.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    const phone = str.match(/(?:\+?45[\s-]?)?(?:\d[\s-]?){8}/);
    return email ? email[0] : phone ? phone[0].replace(/[\s-]/g, '') : null;
  }

  function parseYesNo(str) {
    const s = str.toLowerCase();
    if (/^(ja|jo|jeps|jaffald|yes|gerne|fint|ok|okay|sikkert|absolut|selvf[øo]lgelig)\b/.test(s)) return true;
    if (/^(nej|n[æa]|ikke|no|stop)/.test(s)) return false;
    return null;
  }

  /* ============ PRICE ============ */

  function calcEstimate() {
    const w = state.data.windows || 12;
    const floors = state.data.floors || 1;
    const prop = state.data.property || 'Hus';
    const freq = state.data.frequency || 'Engangs';

    let price = 350 + w * 28;
    if (floors >= 2) price *= 1.12;
    if (floors >= 3) price *= 1.08;
    if (prop === 'Erhverv') price *= 1.25;
    if (prop === 'Lejlighed') price *= 0.95;
    const freqMult = { 'Engangs': 1.2, 'Hver 4. uge': 0.82, 'Hver 8. uge': 0.9, 'Hver 12. uge': 0.95 };
    price *= freqMult[freq] || 1;

    return Math.round(price / 5) * 5;
  }

  /* ============ FLOW ============ */

  async function greet() {
    await botSay('Hej! 👋 Velkommen til Topglans. Jeg hjælper dig med at få et tilbud — det tager under 2 minutter.');
    await botSay('Først: hvor skal vinduerne pudses? Skriv din adresse eller bare dit postnummer.');
    state.step = 'ask_zip';
    setSuggestions(['8000 Aarhus C', '7500 Holstebro', 'Risskov']);
  }

  async function handleUserInput(rawText) {
    const text = rawText.trim();
    if (!text) return;
    addMsg(text, 'user');
    suggestions.innerHTML = '';
    input.value = '';
    input.disabled = true;

    try {
      switch (state.step) {
        case 'ask_zip':      await handleZip(text); break;
        case 'ask_property': await handleProperty(text); break;
        case 'ask_size':     await handleSize(text); break;
        case 'ask_frequency':await handleFrequency(text); break;
        case 'confirm_estimate': await handleConfirmEstimate(text); break;
        case 'ask_time':     await handleTime(text); break;
        case 'ask_contact':  await handleContact(text); break;
        case 'done':         await botSay('Anders har modtaget din booking 💪 Jeg holder fri til næste kunde dukker op. Du kan starte forfra med ↻-knappen øverst.'); break;
        default: await fallback();
      }
    } finally {
      input.disabled = false;
      input.focus();
      updateTicker();
    }
  }

  async function handleZip(text) {
    const zip = parseZip(text) || guessZipFromCity(text);
    if (!zip) {
      await botSay('Jeg fangede ikke postnummeret — kan du skrive 4-cifret postnummer eller bynavn? (fx 8000 eller Aarhus)');
      return;
    }
    state.data.zip = zip;
    state.data.coverage = COVERAGE_ZIPS.includes(zip);

    if (!state.data.coverage) {
      await botSay(`Hmm — ${zip} ligger lige uden for vores faste rute. Jeg sender din henvendelse til Anders alligevel, så han kan vurdere om vi kan komme i nærmeste fremtid. Vil du fortsætte og give mig lidt mere info?`);
      setSuggestions(['Ja, fortsæt', 'Nej tak']);
      state.step = 'ask_property';
      return;
    }

    await botSay(`Perfekt — ${zip} dækker vi fast 👍`);
    await botSay('Bor du i hus, lejlighed eller er det en virksomhed?');
    setSuggestions(PROPERTY_OPTIONS);
    state.step = 'ask_property';
  }

  function guessZipFromCity(text) {
    const s = text.toLowerCase();
    if (/aarhus c|århus c|aarhus midt/.test(s)) return 8000;
    if (/risskov/.test(s)) return 8240;
    if (/h[øo]jbjerg/.test(s)) return 8270;
    if (/viby/.test(s)) return 8260;
    if (/holstebro/.test(s)) return 7500;
    if (/viborg/.test(s)) return 8800;
    if (/herning/.test(s)) return 7400;
    return null;
  }

  async function handleProperty(text) {
    if (/nej/i.test(text)) {
      await botSay('Helt fint — jeg sender en kort note til Anders med dit postnummer, så ved han at du har vist interesse. God dag! 🌤️');
      state.step = 'done';
      return;
    }
    const prop = parseProperty(text);
    if (!prop) {
      await botSay('Tryk gerne på en af knapperne — Hus, Lejlighed eller Erhverv. 😊');
      setSuggestions(PROPERTY_OPTIONS);
      return;
    }
    state.data.property = prop;
    updateTicker();

    if (prop === 'Hus') {
      await botSay('Cool. Hvor mange vinduer ca. — og er det 1 eller 2 etager?');
    } else if (prop === 'Lejlighed') {
      await botSay('Hvilken etage bor du på, og hvor mange vinduer/altandøre er der?');
    } else {
      await botSay('Hvor mange vinduer/glaspartier er der — og er noget i højden (over 1. sal)?');
    }
    state.step = 'ask_size';
  }

  async function handleSize(text) {
    const num = parseNumber(text);
    if (!num) {
      await botSay('Helt ok at gætte — bare skriv et tal. Fx "18 vinduer" eller "12 styk".');
      return;
    }
    state.data.windows = num;
    const floorMatch = text.match(/(\d)\s?(?:etage|sal|plan)/i);
    if (floorMatch) state.data.floors = parseInt(floorMatch[1], 10);
    else if (/2\s?(plan|etage)/i.test(text)) state.data.floors = 2;
    else if (/h[øo]j|h[øo]jt|kvist|tagvindue/i.test(text)) state.data.floors = 2;
    else state.data.floors = 1;
    updateTicker();

    await botSay(`${num} vinduer noteret. Skal det være engangs eller en fast aftale?`);
    setSuggestions(FREQUENCY_OPTIONS);
    state.step = 'ask_frequency';
  }

  async function handleFrequency(text) {
    const freq = parseFrequency(text);
    if (!freq) {
      await botSay('Vælg gerne en af knapperne — Engangs, eller hver 4./8./12. uge.');
      setSuggestions(FREQUENCY_OPTIONS);
      return;
    }
    state.data.frequency = freq;
    state.data.estimate = calcEstimate();
    updateTicker();

    const e = state.data.estimate;
    const isAbo = freq !== 'Engangs';
    await botSay(`Tak. Baseret på det du har sagt, lyder vores estimat på <strong>${e} kr.</strong> pr. besøg${isAbo ? ' (ved ' + freq.toLowerCase() + ')' : ''}. Prisen er bindende — vi justerer kun, hvis vi ved besøget ser noget afvigende.`, { html: true });
    await botSay('Skal vi finde en tid med det samme?');
    setSuggestions(['Ja, find en tid', 'Jeg vil tænke over det']);
    state.step = 'confirm_estimate';
  }

  async function handleConfirmEstimate(text) {
    const yn = parseYesNo(text);
    if (yn === false || /t[æa]nk|senere|mailen?|sende/i.test(text)) {
      await botSay('Selvfølgelig — jeg sender dig prisestimatet på mail, så har du det at kigge på. Hvad er din mail eller telefon, så Anders kan følge op?');
      state.step = 'ask_contact';
      return;
    }
    await botSay('Super. Anders har følgende tider ledig i denne uge — vælg hvad der passer:');
    setSuggestions(TIME_SLOTS.map(s => s.label));
    state.step = 'ask_time';
  }

  async function handleTime(text) {
    const slot = matchTimeSlot(text);
    if (slot) {
      state.data.slot = slot.label;
      updateTicker();
      await botSay(`Booket: ${slot.label} ✓`);
    } else {
      state.data.slot = text + ' (ønsket alternativ)';
      updateTicker();
      await botSay('Det tidspunkt er ikke i den faste rute, men Anders ringer dig op og finder en tid der passer.');
    }
    await botSay('Sidste skridt — på hvilken mail eller telefon kan vi sende bekræftelsen?');
    state.step = 'ask_contact';
  }

  function matchTimeSlot(text) {
    const lower = text.toLowerCase();
    const exact = TIME_SLOTS.find(s => lower === s.label.toLowerCase());
    if (exact) return exact;
    const dayMatch = lower.match(/torsdag|fredag/);
    const timeMatch = lower.match(/(\d{1,2})[:.]?(\d{2})?/);
    if (!dayMatch) return null;
    return TIME_SLOTS.find(s => {
      const day = s.label.toLowerCase().split(' ')[0];
      if (day !== dayMatch[0]) return false;
      if (!timeMatch) return true;
      const hour = parseInt(timeMatch[1], 10);
      return s.label.includes(String(hour).padStart(2, '0') + ':') || s.label.includes(hour + ':');
    });
  }

  async function handleContact(text) {
    const c = parseContact(text);
    if (!c) {
      await botSay('Mangler jeg lige din mail eller telefon — så Anders kan bekræfte 😊');
      return;
    }
    state.data.contact = c;
    updateTicker();
    addMsg('Sender lead til Anders...', 'system');
    await new Promise(r => setTimeout(r, 900));
    addMsg('Lead modtaget · kalender opdateret · SMS-bekræftelse sendt', 'system');

    const summary = renderSummary();
    await botSay(summary, { html: true });
    state.step = 'done';
    setSuggestions(['Start forfra']);
  }

  function renderSummary() {
    const d = state.data;
    return `
      <div style="margin-top:4px">
        <div style="font-weight:600; margin-bottom:8px;">Du er nu i kalenderen 🎉</div>
        ${d.slot ? `<div>📅 <strong>${d.slot}</strong></div>` : ''}
        ${d.estimate ? `<div>💰 <strong>${d.estimate} kr.</strong> pr. besøg</div>` : ''}
        ${d.frequency ? `<div>🔁 ${d.frequency}</div>` : ''}
        <div style="margin-top:10px; font-size:0.8rem; opacity:0.8;">Anders ringer dagen før for at bekræfte. God dag!</div>
      </div>
    `;
  }

  async function fallback() {
    await botSay('Beklager, jeg er ikke helt med — kan du formulere det lidt anderledes?');
  }

  /* ============ EVENTS ============ */

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (v) handleUserInput(v);
  });

  resetBtn.addEventListener('click', () => {
    init();
  });

  init();
})();
