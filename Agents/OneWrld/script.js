(function () {
  'use strict';

  /* ============ PLACEHOLDER CATALOG ============
     Erstattes med onewrld's rigtige produkter, priser og lager. */
  const CATALOG = [
    { id: 'core-hoodie', name: 'Core Hoodie',          cat: 'hoodie', price: 649, fit: 'Oversized', colors: ['Sort', 'Off-white', 'Beton'], note: 'Bestseller' },
    { id: 'zip-hoodie',  name: 'Continent Zip Hoodie', cat: 'hoodie', price: 749, fit: 'Regular',   colors: ['Sort', 'Olive'] },
    { id: 'boxy-tee',    name: 'Worldwide Boxy Tee',   cat: 'tee',    price: 329, fit: 'Boxy',      colors: ['Sort', 'Hvid', 'Beton'] },
    { id: 'logo-tee',    name: 'OW Logo Tee',          cat: 'tee',    price: 299, fit: 'Regular',   colors: ['Sort', 'Hvid'] },
    { id: 'cargo',       name: 'Atlas Cargo Pants',    cat: 'pants',  price: 749, fit: 'Relaxed',   colors: ['Sort', 'Beton', 'Olive'], note: 'Få tilbage' },
    { id: 'sweat',       name: 'Meridian Sweatpants',  cat: 'pants',  price: 549, fit: 'Relaxed',   colors: ['Sort', 'Grå'] },
    { id: 'puffer',      name: 'Globe Puffer Jacket',  cat: 'jacket', price: 1299, fit: 'Oversized', colors: ['Sort'] },
    { id: 'cap',         name: 'OW Logo Cap',          cat: 'cap',    price: 249, fit: 'One size',  colors: ['Sort', 'Beige'] },
    { id: 'beanie',      name: 'Horizon Beanie',       cat: 'cap',    price: 199, fit: 'One size',  colors: ['Sort', 'Grå'] },
  ];

  const CAT_LABEL = { hoodie: 'Hoodies', tee: 'T-shirts', pants: 'Bukser', jacket: 'Jakker', cap: 'Caps & huer' };
  const FREE_SHIPPING = 499;

  const body = document.getElementById('chat-body');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const suggestions = document.getElementById('chat-suggestions');
  const tickerList = document.getElementById('ticker-list');
  const scoreFill = document.getElementById('score-fill');
  const scoreText = document.getElementById('score-text');
  const resetBtn = document.getElementById('chat-reset');

  const state = { step: 'greet', data: { cart: [] } };

  function init() {
    body.innerHTML = '';
    suggestions.innerHTML = '';
    tickerList.innerHTML = '<li class="empty">Endnu intet — start samtalen til venstre.</li>';
    scoreFill.style.width = '0%';
    scoreText.textContent = 'Venter på data...';
    scoreText.classList.remove('hot');
    state.step = 'greet';
    state.data = { cart: [] };
    input.value = '';
    input.disabled = false;
    setTimeout(greet, 250);
  }

  /* ============ RENDERING ============ */
  function addMsg(text, role = 'bot', { html = false } = {}) {
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    if (html) el.innerHTML = text; else el.textContent = text;
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
    const delay = Math.min(800 + text.length * 10, 1700);
    return new Promise((res) => setTimeout(() => { typing.remove(); addMsg(text, 'bot', opts); res(); }, delay));
  }
  function setSuggestions(items) {
    suggestions.innerHTML = '';
    (items || []).forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.addEventListener('click', () => handleUserInput(label));
      suggestions.appendChild(btn);
    });
  }

  /* ============ TICKER ============ */
  function updateTicker() {
    const d = state.data;
    const entries = [];
    if (d.intent)   entries.push({ icon: 'fa-bullseye', lbl: 'Hensigt', val: d.intent });
    if (d.category) entries.push({ icon: 'fa-shirt', lbl: 'Kategori', val: CAT_LABEL[d.category] || d.category });
    if (d.fit || d.color) entries.push({ icon: 'fa-wand-magic-sparkles', lbl: 'Stil', val: [d.fit, d.color].filter(Boolean).join(' · ') });
    if (d.size)     entries.push({ icon: 'fa-ruler', lbl: 'Størrelse', val: d.size });
    if (d.cart.length) {
      const total = cartTotal();
      entries.push({ icon: 'fa-bag-shopping', lbl: `Kurv · ${d.cart.length} vare${d.cart.length > 1 ? 'r' : ''}`, val: `${d.cart.map(c => c.name).join(', ')} — ${total} kr.` });
    }
    if (d.contact)  entries.push({ icon: 'fa-envelope', lbl: 'Kontakt', val: d.contact });

    tickerList.innerHTML = '';
    if (!entries.length) {
      tickerList.innerHTML = '<li class="empty">Endnu intet — start samtalen til venstre.</li>';
    } else {
      entries.forEach((e) => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="${e.icon}"></i><div><strong>${e.lbl}</strong>${escapeHtml(e.val)}</div>`;
        tickerList.appendChild(li);
      });
    }

    const score = computeScore();
    scoreFill.style.width = score + '%';
    if (score === 0) { scoreText.textContent = 'Venter på data...'; scoreText.classList.remove('hot'); }
    else if (score < 40) { scoreText.textContent = 'Browser endnu...'; scoreText.classList.remove('hot'); }
    else if (score < 80) { scoreText.textContent = 'Varm — kigger på styles'; scoreText.classList.remove('hot'); }
    else { scoreText.textContent = state.data.contact ? 'Sendt til Hamza · klar' : 'Klar til checkout'; scoreText.classList.add('hot'); }
  }

  function computeScore() {
    const d = state.data; let s = 0;
    if (d.intent) s += 8;
    if (d.category) s += 14;
    if (d.fit || d.color) s += 10;
    if (d.size) s += 16;
    if (d.viewed) s += 12;
    if (d.cart.length) s += 28;
    if (d.contact) s += 14;
    return Math.max(0, Math.min(100, s));
  }

  /* ============ PARSING ============ */
  function parseCategory(str) {
    const s = str.toLowerCase();
    if (/hoodie|hættetrøje|haettetroje|trøje|troje|sweatshirt|zip/.test(s)) return 'hoodie';
    if (/t-?shirt|tee|tshirt|top/.test(s)) return 'tee';
    if (/buks|cargo|sweatpant|pants|joggers|jogger/.test(s)) return 'pants';
    if (/jakke|puffer|jacket|vinterjakke|frakke/.test(s)) return 'jacket';
    if (/cap|kasket|hue|beanie|accessor/.test(s)) return 'cap';
    return null;
  }
  function parseFit(str) {
    const s = str.toLowerCase();
    if (/oversized|oversize|boxy|baggy|stor|løs|los|relaxed/.test(s)) return 'Oversized';
    if (/regular|normal|fitted|tight|slim|tætsiddende|taet|almindelig/.test(s)) return 'Regular';
    return null;
  }
  function parseColor(str) {
    const s = str.toLowerCase();
    if (/sort|black/.test(s)) return 'Sort';
    if (/hvid|white|off-?white|offwhite|creme|cream/.test(s)) return s.includes('off') || /creme|cream/.test(s) ? 'Off-white' : 'Hvid';
    if (/beton|grå|graa|gray|grey/.test(s)) return /beton/.test(s) ? 'Beton' : 'Grå';
    if (/olive|oliven|grøn|gron|green/.test(s)) return 'Olive';
    if (/beige|sand|tan/.test(s)) return 'Beige';
    return null;
  }
  function parseSize(str) {
    const s = str.toLowerCase().replace(/\s/g, '');
    const m = s.match(/\b(xxl|xl|x-large|large|medium|small|xs|s|m|l)\b/);
    const map = { xs: 'XS', s: 'S', small: 'S', m: 'M', medium: 'M', l: 'L', large: 'L', xl: 'XL', 'x-large': 'XL', xxl: 'XXL' };
    if (m && map[m[1]]) return map[m[1]];
    // direct token like "m" / "l"
    if (/^(xs|s|m|l|xl|xxl)$/.test(s)) return s.toUpperCase();
    return null;
  }
  function parseHeight(str) {
    const m = str.match(/\b(1[5-9]\d|2[0-1]\d)\b/);
    return m ? parseInt(m[1], 10) : null;
  }
  function sizeFromHeight(cm) {
    if (cm < 168) return 'S';
    if (cm < 178) return 'M';
    if (cm < 187) return 'L';
    if (cm < 194) return 'XL';
    return 'XXL';
  }
  function parseContact(str) {
    const email = str.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    const phone = str.match(/(?:\+?45[\s-]?)?(?:\d[\s-]?){8}/);
    return email ? email[0] : phone ? phone[0].replace(/[\s-]/g, '') : null;
  }
  function parseYesNo(str) {
    const s = str.toLowerCase();
    if (/^(ja|jo|jeps|yes|gerne|fint|ok|okay|sikkert|absolut|klart|selvf)/.test(s)) return true;
    if (/^(nej|næ|nae|ikke|no|stop|niks)/.test(s)) return false;
    return null;
  }
  function detectService(str) {
    const s = str.toLowerCase();
    if (/ordre|pakke|pakken|levering|track|trace|sendt|hvor er min|order|forsendels/.test(s)) return 'order';
    if (/retur|bytte|bytt|for lille|for stor|fortryd|refund|tilbage med|sende tilbage/.test(s)) return 'return';
    if (/fragt|levering|hvor lang tid|hvornår kommer|leveringstid|shipping|porto/.test(s)) return 'shipping';
    return null;
  }

  /* ============ CART ============ */
  function cartTotal() { return state.data.cart.reduce((sum, c) => sum + c.price, 0); }
  function addToCart(prod) {
    if (!state.data.cart.find(c => c.id === prod.id)) state.data.cart.push(prod);
  }
  function getProductByName(text) {
    const s = text.toLowerCase();
    return CATALOG.find(p => s.includes(p.name.toLowerCase())) ||
           CATALOG.find(p => p.name.toLowerCase().split(' ').every(w => s.includes(w)));
  }
  function recCard(p) {
    const color = state.data.color && p.colors.includes(state.data.color) ? state.data.color : p.colors[0];
    const note = p.note ? `<span class="stock"> · ${p.note}</span>` : '';
    return `<div class="rec"><div class="rec-thumb"><i class="fa-shirt"></i></div>` +
      `<div class="rec-info"><span class="nm">${p.name}</span>` +
      `<span class="meta">${p.fit} · ${color}${note}</span></div>` +
      `<span class="rec-price">${p.price} kr.</span></div>`;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ============ FLOW ============ */
  async function greet() {
    await botSay('Yo 🖤 Velkommen til onewrld. Jeg er shop-assistenten — jeg kan finde din style, ramme din størrelse og svare på fragt &amp; retur.', { html: true });
    await botSay('Leder du efter noget bestemt, eller skal jeg hjælpe dig i gang?');
    state.step = 'route';
    setSuggestions(['Vis mig hoodies', 'Hjælp med min størrelse', 'Hvor er min ordre?']);
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
        case 'route':        await handleRoute(text); break;
        case 'ask_category': await handleCategory(text); break;
        case 'ask_pref':     await handlePref(text); break;
        case 'size_help':    await handleSizeHelp(text); break;
        case 'ask_size':     await handleSize(text); break;
        case 'recommend':    await handleRecommend(text); break;
        case 'ask_addon':    await handleAddon(text); break;
        case 'checkout':     await handleCheckout(text); break;
        case 'ask_contact':  await handleContact(text); break;
        case 'order_lookup': await handleOrderLookup(text); break;
        case 'done':         await botSay('Kurven er sendt videre 💪 Tryk ↻ øverst for at starte forfra.'); break;
        default:             await fallback();
      }
    } finally {
      input.disabled = false;
      input.focus();
      updateTicker();
    }
  }

  async function handleRoute(text) {
    const svc = detectService(text);
    if (svc) { await runService(svc); return; }
    if (/størrelse|str|size|passer|fit|måler|hvor stor/i.test(text)) { await startSizeHelp(); return; }
    const cat = parseCategory(text);
    if (cat) { state.data.intent = 'Shopping'; state.data.category = cat; updateTicker(); await askPref(); return; }
    // generic browse
    state.data.intent = 'Shopping'; updateTicker();
    await botSay('Fedt — hvad er du i humør til?');
    setSuggestions(['Hoodies', 'T-shirts', 'Bukser', 'Jakker']);
    state.step = 'ask_category';
  }

  async function handleCategory(text) {
    const svc = detectService(text);
    if (svc) { await runService(svc); return; }
    const cat = parseCategory(text);
    if (!cat) {
      await botSay('Vælg gerne en kategori herunder 👇');
      setSuggestions(['Hoodies', 'T-shirts', 'Bukser', 'Jakker', 'Caps & huer']);
      return;
    }
    state.data.intent = 'Shopping';
    state.data.category = cat;
    updateTicker();
    await askPref();
  }

  async function askPref() {
    await botSay(`${CAT_LABEL[state.data.category]} — god stil 🙌 Foretrækker du oversized eller regular fit? Og en bestemt farve?`);
    setSuggestions(['Oversized · Sort', 'Regular · Hvid', 'Bare vis bestsellers']);
    state.step = 'ask_pref';
  }

  async function handlePref(text) {
    const svc = detectService(text);
    if (svc) { await runService(svc); return; }
    if (/bestseller|populær|popul|ligegyldig|bare vis|vis bare|whatever|alt/i.test(text)) {
      // skip prefs
    } else {
      const fit = parseFit(text); const color = parseColor(text);
      if (fit) state.data.fit = fit;
      if (color) state.data.color = color;
    }
    updateTicker();
    await botSay('Hvad er din størrelse? Skriv fx S/M/L — eller din højde, så gætter jeg (fx "182 cm").');
    setSuggestions(['S', 'M', 'L', 'Jeg er ikke sikker']);
    state.step = 'ask_size';
  }

  async function startSizeHelp() {
    state.data.intent = 'Shopping'; updateTicker();
    await botSay('Jeg hjælper dig med fit 📏 Hvor høj er du, og hvad tager du normalt i et andet mærke?');
    setSuggestions(['178 cm, normalt M', '185 cm', 'Ved ikke']);
    state.step = 'size_help';
  }

  async function handleSizeHelp(text) {
    const explicit = parseSize(text);
    const cm = parseHeight(text);
    let size = explicit || (cm ? sizeFromHeight(cm) : null);
    if (!size) {
      await botSay('Helt fint — de fleste lander på M. Vil du have et clean fit, så tag din normale størrelse; vil du have det oversized, så gå én op.');
      size = 'M';
    } else {
      const fitNote = state.data.fit === 'Oversized' ? ' Da du vil have det oversized, kan du roligt gå én størrelse op.' : '';
      await botSay(`Så vil jeg pege på <strong>${size}</strong> for et clean onewrld-fit.${fitNote} Vores hoodies og tees er i forvejen lidt boxy.`, { html: true });
    }
    state.data.size = size;
    updateTicker();
    if (!state.data.category) {
      await botSay('Skal jeg vise dig noget i din størrelse?');
      setSuggestions(['Hoodies', 'T-shirts', 'Bukser']);
      state.step = 'ask_category';
    } else {
      await showRecommendations();
    }
  }

  async function handleSize(text) {
    const svc = detectService(text);
    if (svc) { await runService(svc); return; }
    if (/ikke sikker|ved ikke|usikker|hjælp|hjaelp|aner det ikke/i.test(text)) { await startSizeHelp(); return; }
    const explicit = parseSize(text);
    const cm = parseHeight(text);
    if (explicit) state.data.size = explicit;
    else if (cm) state.data.size = sizeFromHeight(cm);
    else { await botSay('Skriv gerne S, M, L, XL — eller din højde i cm 🙏'); setSuggestions(['S', 'M', 'L', 'XL']); return; }
    if (cm) await botSay(`${cm} cm → jeg sætter dig til <strong>${state.data.size}</strong>.`, { html: true });
    updateTicker();
    await showRecommendations();
  }

  async function showRecommendations() {
    const d = state.data;
    let items = CATALOG.filter(p => p.cat === d.category);
    if (d.fit) {
      const oversized = d.fit === 'Oversized';
      const pref = items.filter(p => oversized ? /Oversized|Boxy|Relaxed/.test(p.fit) : /Regular|One size/.test(p.fit));
      if (pref.length) items = pref;
    }
    if (d.color) {
      const byColor = items.filter(p => p.colors.includes(d.color));
      if (byColor.length) items = byColor;
    }
    if (!items.length) items = CATALOG.filter(p => p.cat === d.category);
    items = items.slice(0, 2);
    d.viewed = true;
    updateTicker();

    const cards = items.map(recCard).join('');
    await botSay(`Her er et par stykker, der matcher dig — str. <strong>${d.size || 'M'}</strong>:${cards}`, { html: true });
    await botSay('Skal jeg lægge en af dem i kurven?');
    setSuggestions([...items.map(p => p.name), 'Vis noget andet']);
    state.step = 'recommend';
    d._lastShown = items;
  }

  async function handleRecommend(text) {
    const svc = detectService(text);
    if (svc) { await runService(svc); return; }
    if (/andet|flere|mere|nej|ikke/i.test(text)) {
      await botSay('No worries — vil du kigge i en anden kategori?');
      setSuggestions(['Hoodies', 'T-shirts', 'Bukser', 'Jakker', 'Caps & huer']);
      state.step = 'ask_category';
      return;
    }
    const prod = getProductByName(text);
    if (!prod) { await botSay('Tryk på en af knapperne, så lægger jeg den i kurven 🛒'); setSuggestions([...(state.data._lastShown || []).map(p => p.name), 'Vis noget andet']); return; }
    addToCart(prod);
    updateTicker();
    addMsg('Lagt i kurv', 'system');
    await botSay(`${prod.name} (str. ${state.data.size || 'M'}) ligger i kurven ✓`);
    // upsell a matching item
    const addon = pickAddon(prod);
    if (addon) {
      state.data._addon = addon;
      await botSay(`Folk tager ofte denne til — så er fittet komplet:${recCard(addon)}`, { html: true });
      setSuggestions([`Tilføj ${addon.name}`, 'Nej tak, videre til kurv']);
      state.step = 'ask_addon';
    } else {
      await goCheckout();
    }
  }

  function pickAddon(prod) {
    const order = ['hoodie', 'pants', 'cap', 'tee', 'jacket'];
    const inCart = new Set(state.data.cart.map(c => c.id));
    for (const cat of order) {
      if (cat === prod.cat) continue;
      const cand = CATALOG.find(p => p.cat === cat && !inCart.has(p.id));
      if (cand) return cand;
    }
    return null;
  }

  async function handleAddon(text) {
    const yn = parseYesNo(text);
    const wantsAdd = /tilføj|tilfoj|ja|add|begge|begge dele/i.test(text) && !/nej/i.test(text);
    if (wantsAdd || yn === true) {
      const addon = state.data._addon || getProductByName(text);
      if (addon) { addToCart(addon); updateTicker(); addMsg('Lagt i kurv', 'system'); await botSay(`Nice — ${addon.name} er med ✓`); }
    }
    await goCheckout();
  }

  async function goCheckout() {
    const total = cartTotal();
    const missing = FREE_SHIPPING - total;
    let line = `Din kurv er på <strong>${total} kr.</strong>`;
    if (missing > 0) line += ` — mangler kun ${missing} kr. til fri fragt.`;
    else line += ` — og du har <strong>fri fragt</strong> 🎉`;
    await botSay(line, { html: true });
    await botSay('Vil du gøre købet færdigt? Så sender jeg en bekræftelse + vores 30-dages bytte-garanti til din mail.');
    setSuggestions(['Ja, send til min mail', 'Jeg kigger lidt videre']);
    state.step = 'checkout';
  }

  async function handleCheckout(text) {
    const svc = detectService(text);
    if (svc) { await runService(svc); return; }
    const yn = parseYesNo(text);
    if (yn === false || /kigger|videre|senere|tænk|taenk/i.test(text)) {
      await botSay('Helt fint 🙌 Skriv din mail, så gemmer jeg kurven og sender dig et link — så er den klar, når du er.');
      state.step = 'ask_contact';
      return;
    }
    await botSay('Perfekt. Hvad er din mail?');
    state.step = 'ask_contact';
  }

  async function handleContact(text) {
    const c = parseContact(text);
    if (!c) { await botSay('Mangler lige din mail eller telefon, så jeg kan sende bekræftelsen 😊'); return; }
    state.data.contact = c;
    updateTicker();
    addMsg('Sender kurv · opretter kunde · giver Hamza besked', 'system');
    await new Promise(r => setTimeout(r, 900));
    addMsg('Kurv gemt · bekræftelse sendt · varmt lead til Hamza', 'system');
    await botSay(renderSummary(), { html: true });
    state.step = 'done';
    setSuggestions(['Start forfra']);
  }

  function renderSummary() {
    const d = state.data; const total = cartTotal();
    return `<div style="margin-top:4px">
      <div style="font-weight:600;margin-bottom:8px;">Du er klar 🎉</div>
      ${d.cart.length ? `<div>🛒 <strong>${d.cart.map(c => c.name).join(', ')}</strong></div>` : ''}
      ${d.size ? `<div>📏 Størrelse ${d.size}</div>` : ''}
      ${total ? `<div>💳 <strong>${total} kr.</strong>${total >= FREE_SHIPPING ? ' · fri fragt' : ''}</div>` : ''}
      <div style="margin-top:10px;font-size:0.8rem;opacity:0.8;">Bekræftelse + bytte-garanti er på vej til ${escapeHtml(d.contact)}. Tak fordi du shoppede onewrld 🖤</div>
    </div>`;
  }

  /* ============ SERVICE BRANCHES ============ */
  async function runService(kind) {
    state.data.intent = 'Service'; updateTicker();
    if (kind === 'order') {
      await botSay('Klart — jeg tjekker din ordre 📦 Skriv dit ordrenummer eller den mail, du bestilte med.');
      setSuggestions(['#10428', 'Brug min mail']);
      state.step = 'order_lookup';
    } else if (kind === 'return') {
      await botSay('Selvfølgelig 🙌 Du har <strong>30 dages retur og bytte</strong>. Skriv hvilken vare og hvilken størrelse du vil bytte til, så reserverer jeg den og sender en gratis returlabel til din mail.', { html: true });
      setSuggestions(['Bytte til L', 'Jeg vil returnere']);
      state.step = 'ask_contact';
    } else if (kind === 'shipping') {
      await botSay(`Fragt hos onewrld: <strong>39 kr.</strong>, og <strong>fri fragt over ${FREE_SHIPPING} kr.</strong> Levering er typisk 1–3 hverdage med GLS til pakkeshop eller hjemme.`, { html: true });
      await botSay('Skal jeg hjælpe dig med at finde noget?');
      setSuggestions(['Vis mig hoodies', 'T-shirts', 'Bukser']);
      state.step = 'route';
    }
  }

  async function handleOrderLookup(text) {
    const hasRef = /\d{3,}/.test(text) || parseContact(text) || /mail/i.test(text);
    if (!hasRef) { await botSay('Skriv gerne dit ordrenummer (fx #10428) eller din mail 🙏'); return; }
    await botSay('Fandt den ✓');
    await botSay('Ordre <strong>#10428</strong> blev sendt i går med GLS 📦 Forventet levering <strong>i morgen inden kl. 16</strong> til pakkeshoppen. Track &amp; trace er sendt til din mail.', { html: true });
    await botSay('Var der mere, jeg kan hjælpe med?');
    setSuggestions(['Retur & bytte', 'Vis mig nye styles', 'Nej tak']);
    state.step = 'route';
  }

  async function fallback() {
    await botSay('Beklager, jeg er ikke helt med — prøv at formulere det lidt anderledes, eller vælg en knap 🙏');
    setSuggestions(['Vis mig hoodies', 'Hjælp med størrelse', 'Hvor er min ordre?']);
    state.step = 'route';
  }

  /* ============ AUTOPLAY WALKTHROUGH ============ */
  const autoBtn = document.getElementById('autoplay-btn');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let autoOn = false;

  async function typeInto(text) {
    input.value = '';
    for (const ch of text) { input.value += ch; await sleep(26); }
    await sleep(220);
  }

  async function autoplay() {
    autoOn = true;
    autoBtn.classList.add('on');
    autoBtn.innerHTML = '<span class="ap-ico">■</span> Stop afspilning';
    init();
    await sleep(3900);
    const steps = ['Vis mig hoodies', 'Oversized · Sort', '182 cm', 'Core Hoodie', 'Tilføj Atlas Cargo Pants', 'Ja, send til min mail', 'hamza@onewrld.com'];
    for (const s of steps) {
      if (!autoOn) break;
      await typeInto(s);
      if (!autoOn) break;
      await handleUserInput(s);
      await sleep(1400);
    }
    stopAuto();
  }

  function stopAuto() {
    autoOn = false;
    if (autoBtn) { autoBtn.classList.remove('on'); autoBtn.innerHTML = '<span class="ap-ico">▶</span> Afspil demo (hands-free)'; }
  }

  if (autoBtn) autoBtn.addEventListener('click', () => { if (autoOn) stopAuto(); else autoplay(); });

  /* ============ EVENTS ============ */
  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value.trim(); if (v) handleUserInput(v); });
  resetBtn.addEventListener('click', init);

  // reveal-on-scroll for sections below the fold
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        const delay = parent && parent.matches('.bts-grid, .roi-grid')
          ? [...parent.children].indexOf(entry.target) * 80 : 0;
        setTimeout(() => entry.target.classList.add('in'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

  init();
})();
