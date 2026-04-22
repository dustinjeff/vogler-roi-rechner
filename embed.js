/**
 * Vogler Marketing — ROI-Rechner (Shadow DOM Embed)
 * Lädt sich selbst in einen Shadow DOM Container — komplett CSS-isoliert,
 * aber mit vollem Zugriff auf dataLayer, Cookies und Meta Pixel.
 *
 * Einbettung auf Webflow:
 *   <div id="vm-roi-rechner"></div>
 *   <script src="https://dustinjeff.github.io/vogler-roi-rechner/embed.js"></script>
 */
(function() {
  'use strict';

  var mount = document.getElementById('vm-roi-rechner');
  if (!mount) return;

  // --- Fonts (global, weil Shadow DOM font-face erbt) ---
  if (!document.querySelector('link[href*="Didact+Gothic"]')) {
    var fl = document.createElement('link');
    fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Didact+Gothic&family=JetBrains+Mono:wght@400;600;700&display=swap';
    document.head.appendChild(fl);
  }

  // --- Shadow DOM ---
  var shadow = mount.attachShadow({mode: 'open'});

  // --- Tracking (direkt in dataLayer, kein postMessage) ---
  function trackEvent(eventName, params) {
    window.dataLayer = window.dataLayer || [];
    var d = {event: eventName, rechner_name: (params || {}).rechner || 'unknown'};
    for (var k in params) {
      if (params.hasOwnProperty(k)) d['rechner_' + k] = params[k];
    }
    window.dataLayer.push(d);
  }

  trackEvent('rechner_started', {rechner: 'roi-rechner'});

  // --- DOM Helpers ---
  function $(id) { return shadow.querySelector('#' + id); }
  function $$(sel) { return shadow.querySelectorAll(sel); }

  // ==========================================================================
  // CSS
  // ==========================================================================
  var CSS = '\
    :host { display: block; }\
    :root {\
      --bg: #0a0a0a; --bg-card: #141414; --bg-input: #1a1a1a;\
      --border: #2a2a2a; --border-focus: #4a4a4a; --page-bg: #f5f5f0;\
      --text: #e8e8e8; --text-muted: #888; --text-dim: #666;\
      --accent: #f4e75a; --accent-hover: #f7ed7a;\
      --green: #22c55e; --green-bg: rgba(34,197,94,0.1);\
      --yellow: #eab308; --yellow-bg: rgba(234,179,8,0.1);\
      --red: #ef4444; --red-bg: rgba(239,68,68,0.1);\
      --font: "Didact Gothic",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;\
      --mono: "JetBrains Mono","SF Mono","Fira Code",monospace;\
    }\
    * { margin:0; padding:0; box-sizing:border-box; }\
    .vm-root { font-family:var(--font); color:var(--text); line-height:1.6; -webkit-font-smoothing:antialiased; }\
    .tool-box { background:var(--bg); border-radius:16px; padding:48px 56px; color:var(--text); box-shadow:0 8px 32px rgba(0,0,0,0.15); }\
    @media(max-width:600px){ .tool-box { padding:24px 18px; border-radius:12px; } }\
    header { padding:48px 0 32px; text-align:center; border-bottom:1px solid var(--border); }\
    header h1 { font-size:28px; font-weight:600; letter-spacing:-0.5px; margin-bottom:12px; }\
    header p { color:var(--text-muted); font-size:16px; max-width:520px; margin:0 auto; }\
    .steps-nav { display:flex; gap:0; margin:32px 0 24px; border:1px solid var(--border); border-radius:8px; overflow:hidden; }\
    .step-tab { flex:1; padding:14px 16px; text-align:center; font-size:13px; font-weight:500; color:var(--text-dim); background:var(--bg); cursor:pointer; transition:all 0.2s; border-right:1px solid var(--border); user-select:none; }\
    .step-tab:last-child { border-right:none; }\
    .step-tab.active { background:var(--bg-card); color:var(--text); }\
    .step-tab.completed { color:var(--green); }\
    .step-tab .step-num { display:inline-block; width:22px; height:22px; line-height:22px; border-radius:50%; background:var(--border); color:var(--text-muted); font-size:11px; margin-right:8px; transition:all 0.2s; }\
    .step-tab.active .step-num { background:var(--accent); color:var(--bg); }\
    .step-tab.completed .step-num { background:var(--green); color:var(--bg); }\
    .section { display:none; animation:fadeIn 0.3s ease; }\
    .section.active { display:block; }\
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }\
    .field-group { margin-bottom:28px; }\
    .field-group label { display:block; font-size:14px; font-weight:500; margin-bottom:4px; }\
    .field-group .hint { display:block; font-size:12px; color:var(--text-dim); margin-bottom:10px; }\
    .slider-row { display:flex; align-items:center; gap:16px; }\
    .slider-row input[type="range"] { flex:1; }\
    .slider-value { min-width:90px; text-align:right; font-family:var(--mono); font-size:16px; font-weight:600; color:var(--accent); }\
    input[type="range"] { -webkit-appearance:none; appearance:none; height:4px; background:var(--border); border-radius:2px; outline:none; cursor:pointer; }\
    input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%; background:var(--accent); cursor:pointer; transition:transform 0.15s; }\
    input[type="range"]::-webkit-slider-thumb:hover { transform:scale(1.2); }\
    input[type="range"]::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:var(--accent); border:none; cursor:pointer; }\
    .input-field { width:100%; padding:12px 16px; background:var(--bg-input); border:1px solid var(--border); border-radius:6px; color:var(--text); font-family:var(--mono); font-size:16px; outline:none; transition:border-color 0.2s; }\
    .input-field:focus { border-color:var(--border-focus); }\
    .input-field::placeholder { color:var(--text-dim); }\
    .input-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }\
    @media(max-width:600px){ .input-row { grid-template-columns:1fr; } }\
    select.input-field { cursor:pointer; -webkit-appearance:none; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%23888\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:36px; }\
    .btn { display:inline-flex; align-items:center; justify-content:center; padding:14px 32px; font-size:15px; font-weight:500; border:none; border-radius:6px; cursor:pointer; transition:all 0.2s; font-family:var(--font); text-decoration:none; }\
    .btn-primary { background:var(--accent); color:var(--bg); }\
    .btn-primary:hover { background:var(--accent-hover); }\
    .btn-secondary { background:transparent; color:var(--text-muted); border:1px solid var(--border); }\
    .btn-secondary:hover { border-color:var(--border-focus); color:var(--text); }\
    .btn-row { display:flex; gap:12px; margin-top:32px; justify-content:flex-end; }\
    .divider { height:1px; background:var(--border); margin:32px 0; }\
    .section-label { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-dim); margin-bottom:20px; }\
    .results-hero { text-align:center; padding:40px 0; }\
    .results-hero h2 { font-size:22px; font-weight:500; margin-bottom:8px; }\
    .results-hero p { color:var(--text-muted); font-size:14px; }\
    .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:32px; }\
    @media(max-width:600px){ .kpi-grid { grid-template-columns:1fr; } }\
    .kpi-card { background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:20px; text-align:center; }\
    .kpi-card .kpi-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim); margin-bottom:8px; }\
    .kpi-card .kpi-value { font-family:var(--mono); font-size:28px; font-weight:700; color:var(--text); line-height:1.2; }\
    .kpi-card .kpi-sub { font-size:12px; color:var(--text-muted); margin-top:4px; }\
    .benchmark-section { margin-bottom:40px; }\
    .benchmark-section h3 { font-size:18px; font-weight:500; margin-bottom:16px; }\
    .benchmark-table { width:100%; border-collapse:collapse; }\
    .benchmark-table th { text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim); padding:10px 14px; border-bottom:1px solid var(--border); font-weight:500; }\
    .benchmark-table td { padding:14px; border-bottom:1px solid var(--border); font-size:14px; }\
    .benchmark-table tr:last-child td { border-bottom:none; }\
    .benchmark-table .val { font-family:var(--mono); font-weight:600; }\
    .status-badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:4px; font-size:12px; font-weight:500; }\
    .status-badge.red { background:var(--red-bg); color:var(--red); }\
    .status-badge.yellow { background:var(--yellow-bg); color:var(--yellow); }\
    .status-badge.green { background:var(--green-bg); color:var(--green); }\
    .status-dot { width:6px; height:6px; border-radius:50%; display:inline-block; }\
    .status-dot.red { background:var(--red); } .status-dot.yellow { background:var(--yellow); } .status-dot.green { background:var(--green); }\
    .compare-section { margin-bottom:40px; }\
    .compare-section h3 { font-size:18px; font-weight:500; margin-bottom:16px; }\
    .compare-grid { display:grid; grid-template-columns:1fr auto 1fr; gap:0; border:1px solid var(--border); border-radius:8px; overflow:hidden; }\
    @media(max-width:600px){ .compare-grid { grid-template-columns:1fr; } .compare-arrow { display:none; } }\
    .compare-col { padding:24px 20px; }\
    .compare-col.current { background:var(--bg-card); }\
    .compare-col.optimized { background:rgba(34,197,94,0.03); }\
    .compare-col .col-title { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim); margin-bottom:16px; }\
    .compare-col .col-title.green-title { color:var(--green); }\
    .compare-row { margin-bottom:14px; } .compare-row:last-child { margin-bottom:0; }\
    .compare-row .row-label { font-size:12px; color:var(--text-muted); margin-bottom:2px; }\
    .compare-row .row-value { font-family:var(--mono); font-size:20px; font-weight:600; }\
    .compare-arrow { display:flex; align-items:center; justify-content:center; background:var(--bg); color:var(--text-dim); font-size:20px; padding:0 12px; border-left:1px solid var(--border); border-right:1px solid var(--border); }\
    .hero-number { text-align:center; padding:48px 24px; margin:32px 0; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; }\
    .hero-number .hero-pre { font-size:14px; color:var(--text-muted); margin-bottom:12px; }\
    .hero-number .hero-value { font-family:var(--mono); font-size:48px; font-weight:700; color:var(--accent); line-height:1.1; margin-bottom:12px; }\
    @media(max-width:600px){ .hero-number .hero-value { font-size:36px; } }\
    .hero-number .hero-post { font-size:15px; color:var(--text-muted); max-width:440px; margin:0 auto; }\
    .cta-section { text-align:center; padding:40px 24px; margin:32px 0; border:1px solid var(--border); border-radius:12px; }\
    .cta-section p { font-size:16px; color:var(--text-muted); margin-bottom:24px; max-width:480px; margin-left:auto; margin-right:auto; }\
    .cta-section .btn { font-size:16px; padding:16px 40px; }\
    .export-bar { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 20px; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; margin:24px 0; }\
    .export-bar p { font-size:13px; color:var(--text-muted); }\
    .export-bar .btn { font-size:13px; padding:8px 20px; white-space:nowrap; }\
    footer { text-align:center; padding:40px 0; border-top:1px solid var(--border); margin-top:48px; }\
    footer p { font-size:12px; color:var(--text-dim); }\
    .hidden { display:none !important; }\
    .text-green { color:var(--green); } .text-red { color:var(--red); } .text-yellow { color:var(--yellow); } .text-accent { color:var(--accent); }\
  ';

  // ==========================================================================
  // HTML
  // ==========================================================================
  var HTML = '\
  <div class="vm-root"><div class="tool-box">\
    <header>\
      <h1>Marketing-ROI-Rechner</h1>\
      <p>Finde in 2 Minuten heraus, was dein Marketing wirklich kostet &mdash; und was es bringen sollte.</p>\
    </header>\
    <div class="steps-nav">\
      <div class="step-tab active" data-step="1"><span class="step-num">1</span>Aktuelle Situation</div>\
      <div class="step-tab" data-step="2"><span class="step-num">2</span>Branche</div>\
      <div class="step-tab" data-step="3"><span class="step-num">3</span>Ergebnis</div>\
    </div>\
    <!-- STEP 1 -->\
    <div class="section active" id="step1">\
      <p class="section-label">Kosten</p>\
      <div class="field-group"><label>Monatliches Werbebudget</label><span class="hint">Google Ads, Meta, LinkedIn &mdash; was du monatlich an Plattformen zahlst.</span><div class="slider-row"><input type="range" id="adBudget" min="0" max="20000" step="250" value="3000"><span class="slider-value" id="adBudget_val">3.000 &euro;</span></div></div>\
      <div class="field-group"><label>Agentur- oder Freelancer-Kosten / Monat</label><span class="hint">Retainer, Projektkosten, externe Dienstleister.</span><div class="slider-row"><input type="range" id="agencyCost" min="0" max="15000" step="250" value="2500"><span class="slider-value" id="agencyCost_val">2.500 &euro;</span></div></div>\
      <div class="field-group"><label>Sonstige Marketing-Kosten / Monat</label><span class="hint">Tools, Lizenzen, Messen, Content-Produktion.</span><div class="slider-row"><input type="range" id="otherCost" min="0" max="5000" step="100" value="500"><span class="slider-value" id="otherCost_val">500 &euro;</span></div></div>\
      <div class="divider"></div><p class="section-label">Ergebnisse</p>\
      <div class="field-group"><label>Leads pro Monat</label><span class="hint">Kontaktanfragen, Demo-Requests, Angebotsanfragen &mdash; alles was reinkommt.</span><div class="slider-row"><input type="range" id="leadsMonth" min="0" max="100" step="1" value="15"><span class="slider-value" id="leadsMonth_val">15</span></div></div>\
      <div class="field-group"><label>Davon qualifiziert</label><span class="hint">Wie viele davon sind echte potenzielle Kunden?</span><div class="slider-row"><input type="range" id="qualRate" min="0" max="100" step="5" value="30"><span class="slider-value" id="qualRate_val">30 %</span></div></div>\
      <div class="field-group"><label>Abschlussrate qualifizierte Leads</label><span class="hint">Wie viele qualifizierte Leads werden tats\u00e4chlich zu Kunden?</span><div class="slider-row"><input type="range" id="closeRate" min="0" max="100" step="5" value="25"><span class="slider-value" id="closeRate_val">25 %</span></div></div>\
      <div class="divider"></div><p class="section-label">Kundenwert</p>\
      <div class="input-row"><div class="field-group"><label>Durchschnittlicher Auftragswert</label><span class="hint">Typischer Erstauftrag in Euro.</span><input type="number" class="input-field" id="avgDealSize" value="40000" placeholder="z.B. 40000"></div><div class="field-group"><label>J\u00e4hrlicher Folgeumsatz pro Kunde</label><span class="hint">Was ein Bestandskunde pro Jahr bringt.</span><input type="number" class="input-field" id="annualRevPerCustomer" value="25000" placeholder="z.B. 25000"></div></div>\
      <div class="field-group"><label>Durchschnittliche Kundenbindung</label><span class="hint">Wie lange bleibt ein Kunde im Schnitt?</span><select class="input-field" id="retentionYears"><option value="1">1 Jahr</option><option value="2">2 Jahre</option><option value="3" selected>3 Jahre</option><option value="4">4 Jahre</option><option value="5">5 Jahre</option><option value="6">6 Jahre</option><option value="7">7 Jahre</option><option value="8">8 Jahre</option><option value="9">9 Jahre</option><option value="10">10 Jahre</option></select></div>\
      <div class="btn-row"><button class="btn btn-primary" data-action="goToStep" data-arg="2">Weiter</button></div>\
    </div>\
    <!-- STEP 2 -->\
    <div class="section" id="step2">\
      <p class="section-label">Branche &amp; Kontext (optional, verbessert den Benchmark-Vergleich)</p>\
      <div class="field-group"><label>Branche</label><select class="input-field" id="industry"><option value="allgemein">-- Bitte w\u00e4hlen --</option><option value="it">IT-Dienstleister</option><option value="beratung">Beratung / Consulting</option><option value="industrie">Industrie / Fertigung</option><option value="saas">SaaS / Software</option><option value="handwerk">Handwerk / Gewerbe</option><option value="sonstiges">Sonstiges</option></select></div>\
      <div class="input-row"><div class="field-group"><label>Unternehmensgr\u00f6\u00dfe</label><select class="input-field" id="companySize"><option value="5-20">5 &ndash; 20 Mitarbeiter</option><option value="20-50" selected>20 &ndash; 50 Mitarbeiter</option><option value="50-100">50 &ndash; 100 Mitarbeiter</option><option value="100-250">100 &ndash; 250 Mitarbeiter</option><option value="250+">250+ Mitarbeiter</option></select></div><div class="field-group"><label>Jahresumsatz</label><select class="input-field" id="annualRevenue"><option value="unter1m">unter 1 Mio. &euro;</option><option value="1-5m" selected>1 &ndash; 5 Mio. &euro;</option><option value="5-15m">5 &ndash; 15 Mio. &euro;</option><option value="15-50m">15 &ndash; 50 Mio. &euro;</option><option value="ueber50m">\u00fcber 50 Mio. &euro;</option></select></div></div>\
      <div class="btn-row"><button class="btn btn-secondary" data-action="goToStep" data-arg="1">Zur\u00fcck</button><button class="btn btn-primary" data-action="calculateAndShow">Ergebnis berechnen</button></div>\
    </div>\
    <!-- STEP 3 -->\
    <div class="section" id="step3">\
      <div class="results-hero"><h2>Deine aktuelle Realit\u00e4t</h2><p>Individuell berechnet auf Basis deiner Eingaben &mdash; nicht nur Ad-Spend, sondern alle Marketing-Kosten eingerechnet.</p></div>\
      <div class="kpi-grid"><div class="kpi-card"><div class="kpi-label">Wahrer Cost-per-Lead</div><div class="kpi-value" id="r_cpl">&mdash;</div><div class="kpi-sub">pro Lead, alles inklusive</div></div><div class="kpi-card"><div class="kpi-label">Customer Acquisition Cost</div><div class="kpi-value" id="r_cac">&mdash;</div><div class="kpi-sub">pro Neukunde</div></div><div class="kpi-card"><div class="kpi-label">Marketing-ROI</div><div class="kpi-value" id="r_roi">&mdash;</div><div class="kpi-sub">Return auf jeden Euro</div></div></div>\
      <div class="divider"></div>\
      <div class="benchmark-section"><h3>Wie du im Vergleich stehst</h3><table class="benchmark-table"><thead><tr><th>Kennzahl</th><th>Dein Wert</th><th>Benchmark</th><th>Status</th></tr></thead><tbody id="benchmarkBody"></tbody></table></div>\
      <div class="divider"></div>\
      <div class="compare-section"><h3>Was ein optimiertes System bringen w\u00fcrde</h3><div class="compare-grid"><div class="compare-col current"><div class="col-title">Aktuell</div><div class="compare-row"><div class="row-label">Neukunden / Jahr</div><div class="row-value" id="r_custNow">&mdash;</div></div><div class="compare-row"><div class="row-label">Neukunden-Umsatz</div><div class="row-value" id="r_revNow">&mdash;</div></div><div class="compare-row"><div class="row-label">Deckungsbeitrag</div><div class="row-value" id="r_dbNow">&mdash;</div></div></div><div class="compare-arrow">&rarr;</div><div class="compare-col optimized"><div class="col-title green-title">Optimiert</div><div class="compare-row"><div class="row-label">Neukunden / Jahr</div><div class="row-value text-green" id="r_custOpt">&mdash;</div></div><div class="compare-row"><div class="row-label">Neukunden-Umsatz</div><div class="row-value text-green" id="r_revOpt">&mdash;</div></div><div class="compare-row"><div class="row-label">Deckungsbeitrag</div><div class="row-value text-green" id="r_dbOpt">&mdash;</div></div></div></div></div>\
      <div class="divider"></div>\
      <!-- Profile A -->\
      <div id="profile_red" class="hidden"><div class="hero-number"><div class="hero-pre">Dir entgehen aktuell</div><div class="hero-value" id="r_gap_red">&mdash;</div><div class="hero-post">Deckungsbeitrag pro Jahr, weil dein Marketing-System nicht auf Benchmark-Niveau arbeitet.</div></div><div class="cta-section"><p>Du willst wissen, wie du diese L\u00fccke schlie\u00dft? In einem 30-min\u00fctigen Erstgespr\u00e4ch rechnen wir gemeinsam durch, welche Hebel bei dir am schnellsten wirken.</p><a class="btn btn-primary" href="https://vogler.marketing/erstgespraech" target="_blank" rel="noopener" data-action="ctaClick" data-cta="erstgespraech" data-profile="red">Erstgespr\u00e4ch buchen</a></div></div>\
      <!-- Profile B -->\
      <div id="profile_mixed" class="hidden"><div class="hero-number"><div class="hero-pre">Ein Hebel fehlt noch</div><div class="hero-value" id="r_gap_mixed">&mdash;</div><div class="hero-post" id="r_mixed_detail">Du bist nah dran. Eine Kennzahl bremst dich &mdash; der Rest l\u00e4uft.</div></div><div class="cta-section"><p>Du bist nah dran &mdash; ein gezielter Eingriff kann den Unterschied machen. Lass uns in 30 Minuten den einen Hebel identifizieren, der bei dir am meisten bewegt.</p><a class="btn btn-primary" href="https://vogler.marketing/erstgespraech" target="_blank" rel="noopener" data-action="ctaClick" data-cta="erstgespraech" data-profile="mixed">Erstgespr\u00e4ch buchen</a><div style="margin-top:16px;"><a class="btn btn-secondary" href="https://vogler.marketing/wissen/" target="_blank" rel="noopener" id="r_mixed_article" data-action="ctaClick" data-cta="artikel" data-profile="mixed">Passenden Artikel lesen</a></div></div></div>\
      <!-- Profile C -->\
      <div id="profile_good" class="hidden"><div class="hero-number" style="border-color:var(--green);"><div class="hero-pre">Dein Marketing arbeitet solide</div><div class="hero-value" style="color:var(--green);font-size:32px;">Effizienz \u00fcber Benchmark</div><div class="hero-post">Die spannende Frage ist jetzt: Skaliert das? Kannst du doppelt so viele Leads generieren &mdash; ohne dass die Kosten pro Lead explodieren?</div></div><div class="cta-section"><p>Du machst vieles richtig. Der n\u00e4chste Schritt ist nicht Effizienz, sondern Volumen &mdash; mehr qualifizierte Anfragen bei stabiler Kostenstruktur.</p><a class="btn btn-primary" href="https://vogler.marketing/erstgespraech" target="_blank" rel="noopener" data-action="ctaClick" data-cta="skalierung" data-profile="good">Skalierung besprechen</a><div style="margin-top:16px;"><a class="btn btn-secondary" href="https://vogler.marketing/wissen/" target="_blank" rel="noopener" data-action="ctaClick" data-cta="artikel" data-profile="good">Wie Skalierung ohne Kostensteigerung funktioniert</a></div></div></div>\
      <!-- Profile D -->\
      <div id="profile_excellent" class="hidden"><div class="hero-number" style="border-color:var(--green);"><div class="hero-pre">Respekt</div><div class="hero-value" style="color:var(--green);font-size:28px;">Dein Marketing-System arbeitet auf Top-Niveau</div><div class="hero-post">Ehrlich: Wenn diese Zahlen stimmen, brauchst du keine Agentur. Du brauchst jemanden, der mit dir \u00fcber den n\u00e4chsten Wachstumsschritt nachdenkt &mdash; oder du teilst diesen Rechner mit jemandem, der ihn braucht.</div></div><div class="cta-section"><p>Wir schicken dir alle zwei Wochen eine Analyse zu B2B-Marketing-Trends im DACH-Raum. Kein Spam, keine Verkaufsversuche &mdash; nur Substanz.</p><a class="btn btn-primary" href="https://vogler.marketing/newsletter" target="_blank" rel="noopener" data-action="ctaClick" data-cta="newsletter" data-profile="excellent">Newsletter abonnieren</a><div style="margin-top:16px;"><button class="btn btn-secondary" data-action="copyLink">Rechner-Link kopieren und teilen</button></div></div></div>\
      <!-- Export -->\
      <div class="export-bar"><p>Ergebnis als PDF speichern? Kommt per E-Mail &mdash; freiwillig, kein Zwang.</p><button class="btn btn-secondary" data-action="showExportForm">PDF anfordern</button></div>\
      <div id="exportForm" class="hidden" style="margin:16px 0;"><div class="input-row"><div class="field-group"><label>Vorname</label><input type="text" class="input-field" id="exportName" placeholder="Max"></div><div class="field-group"><label>E-Mail (gesch\u00e4ftlich)</label><input type="email" class="input-field" id="exportEmail" placeholder="max@firma.de"></div></div><div class="btn-row"><button class="btn btn-primary" data-action="submitExport">PDF senden</button></div><p id="exportMsg" style="font-size:13px;color:var(--green);margin-top:12px;" class="hidden"></p></div>\
      <div style="text-align:center;margin:32px 0;"><button class="btn btn-secondary" data-action="goToStep" data-arg="1">Mit anderen Zahlen nochmal rechnen</button></div>\
      <div style="margin:40px 0 0;padding:20px;border-top:1px solid var(--border);"><p style="font-size:11px;color:var(--text-dim);line-height:1.7;"><strong>Hinweis:</strong> Alle Berechnungen basieren ausschlie\u00dflich auf den von dir eingegebenen Werten und branchen\u00fcblichen Durchschnittswerten. Die dargestellten Ergebnisse, Szenarien und Optimierungspotenziale sind Sch\u00e4tzungen und stellen keine Garantie f\u00fcr zuk\u00fcnftige Ergebnisse dar. Tats\u00e4chliche Resultate h\u00e4ngen von zahlreichen individuellen Faktoren ab, die dieser Rechner nicht abbilden kann. Die Benchmark-Werte stammen aus \u00f6ffentlich zug\u00e4nglichen Branchenstudien (u.a. HubSpot, Gartner, Sopro) und k\u00f6nnen je nach Markt, Gesch\u00e4ftsmodell und Wettbewerbssituation abweichen. Dieser Rechner ersetzt keine individuelle Beratung.</p></div>\
    </div>\
    <footer><p>Marketing-ROI-Rechner von Vogler Marketing</p></footer>\
  </div></div>';

  // --- Inject ---
  shadow.innerHTML = '<style>' + CSS + '</style>' + HTML;

  // ==========================================================================
  // EVENT DELEGATION (statt inline onclick)
  // ==========================================================================
  shadow.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.dataset.action;
    var arg = el.dataset.arg;

    switch(action) {
      case 'goToStep': goToStep(parseInt(arg)); break;
      case 'calculateAndShow': calculateAndShow(); break;
      case 'showExportForm': showExportForm(); break;
      case 'submitExport': submitExport(); break;
      case 'copyLink': copyLink(el); break;
      case 'ctaClick':
        trackEvent('rechner_cta_clicked', {
          rechner: 'roi-rechner',
          cta: el.dataset.cta,
          profile: el.dataset.profile || (window._roiResults ? window._roiResults.profile : 'unknown')
        });
        break;
    }
  });

  // ==========================================================================
  // FORMATTING HELPERS
  // ==========================================================================
  function fmtEur(n) { if (!isFinite(n) || isNaN(n)) return '\u2014'; return Math.round(n).toLocaleString('de-DE') + ' \u20AC'; }
  function fmtPct(n) { if (!isFinite(n) || isNaN(n)) return '\u2014'; return Math.round(n).toLocaleString('de-DE') + ' %'; }
  function fmtRatio(n) { if (!isFinite(n) || isNaN(n)) return '\u2014'; return n.toFixed(1).replace('.', ',') + ':1'; }
  function fmtMonths(n) { if (!isFinite(n) || isNaN(n)) return '\u2014'; return Math.round(n) + ' Mon.'; }
  function fmtNum(n) { if (!isFinite(n) || isNaN(n)) return '\u2014'; return Math.round(n).toLocaleString('de-DE'); }

  // ==========================================================================
  // SLIDER LIVE-UPDATES
  // ==========================================================================
  var sliders = [
    { id: 'adBudget',   suffix: ' \u20AC' },
    { id: 'agencyCost', suffix: ' \u20AC' },
    { id: 'otherCost',  suffix: ' \u20AC' },
    { id: 'leadsMonth', suffix: '' },
    { id: 'qualRate',   suffix: ' %' },
    { id: 'closeRate',  suffix: ' %' },
  ];

  sliders.forEach(function(s) {
    var el = $(s.id);
    var valEl = $(s.id + '_val');
    if (el && valEl) {
      el.addEventListener('input', function() {
        valEl.textContent = parseInt(el.value).toLocaleString('de-DE') + s.suffix;
      });
    }
  });

  // ==========================================================================
  // STEP NAVIGATION
  // ==========================================================================
  function goToStep(n) {
    $$('.section').forEach(function(s) { s.classList.remove('active'); });
    $('step' + n).classList.add('active');

    $$('.step-tab').forEach(function(t) {
      var tn = parseInt(t.getAttribute('data-step'));
      t.classList.remove('active', 'completed');
      if (tn === n) t.classList.add('active');
      if (tn < n) t.classList.add('completed');
    });

    var stepNames = {1: 'aktuelle_situation', 2: 'branche', 3: 'ergebnis'};
    trackEvent('rechner_step', {rechner: 'roi-rechner', step: n, step_name: stepNames[n]});

    mount.scrollIntoView({behavior: 'smooth'});
  }

  // ==========================================================================
  // BENCHMARKS
  // ==========================================================================
  var benchmarks = {
    allgemein:  { qualRate: 35, closeRate: 25, ltvCacGood: 3, ltvCacGreat: 5, paybackGood: 18, paybackGreat: 12, cplGood: 300, cplGreat: 100, budgetPctGood: 5, budgetPctGreat: 7 },
    it:         { qualRate: 30, closeRate: 22, ltvCacGood: 3, ltvCacGreat: 5, paybackGood: 18, paybackGreat: 12, cplGood: 350, cplGreat: 150, budgetPctGood: 6, budgetPctGreat: 9 },
    beratung:   { qualRate: 35, closeRate: 28, ltvCacGood: 3, ltvCacGreat: 5, paybackGood: 15, paybackGreat: 10, cplGood: 250, cplGreat: 100, budgetPctGood: 5, budgetPctGreat: 8 },
    industrie:  { qualRate: 25, closeRate: 20, ltvCacGood: 3, ltvCacGreat: 5, paybackGood: 24, paybackGreat: 15, cplGood: 400, cplGreat: 200, budgetPctGood: 4, budgetPctGreat: 6 },
    saas:       { qualRate: 30, closeRate: 20, ltvCacGood: 3, ltvCacGreat: 5, paybackGood: 18, paybackGreat: 12, cplGood: 200, cplGreat: 80,  budgetPctGood: 8, budgetPctGreat: 12 },
    handwerk:   { qualRate: 40, closeRate: 35, ltvCacGood: 3, ltvCacGreat: 5, paybackGood: 12, paybackGreat: 8,  cplGood: 150, cplGreat: 50,  budgetPctGood: 3, budgetPctGreat: 5 },
    sonstiges:  { qualRate: 35, closeRate: 25, ltvCacGood: 3, ltvCacGreat: 5, paybackGood: 18, paybackGreat: 12, cplGood: 300, cplGreat: 100, budgetPctGood: 5, budgetPctGreat: 7 },
  };

  // ==========================================================================
  // CORE CALCULATION
  // ==========================================================================
  function calculateAndShow() {
    var adBudget = parseInt($('adBudget').value) || 0;
    var agencyCost = parseInt($('agencyCost').value) || 0;
    var otherCost = parseInt($('otherCost').value) || 0;
    var leadsMonth = parseInt($('leadsMonth').value) || 0;
    var qualRate = parseInt($('qualRate').value) / 100;
    var closeRate = parseInt($('closeRate').value) / 100;
    var avgDealSize = parseFloat($('avgDealSize').value) || 0;
    var annualRev = parseFloat($('annualRevPerCustomer').value) || 0;
    var retYears = parseInt($('retentionYears').value) || 1;
    var industry = $('industry').value;
    var annualRevenue = $('annualRevenue').value;

    var revMidpoints = { 'unter1m': 500000, '1-5m': 3000000, '5-15m': 10000000, '15-50m': 30000000, 'ueber50m': 75000000 };
    var companyRev = revMidpoints[annualRevenue] || 3000000;
    var bm = benchmarks[industry] || benchmarks['allgemein'];

    var totalCostMonth = adBudget + agencyCost + otherCost;
    var totalCostYear = totalCostMonth * 12;
    var qualLeads = leadsMonth * qualRate;
    var newCustMonth = qualLeads * closeRate;
    var newCustYear = newCustMonth * 12;

    var cpl = leadsMonth > 0 ? totalCostMonth / leadsMonth : 0;
    var cpql = qualLeads > 0 ? totalCostMonth / qualLeads : 0;
    var cac = newCustMonth > 0 ? totalCostMonth / newCustMonth : 0;

    var clv = avgDealSize + (annualRev * (retYears - 1));
    var clvMargin = clv * 0.4;

    var ltvCac = cac > 0 ? clvMargin / cac : 0;
    var paybackMonths = clvMargin > 0 ? cac / (clvMargin / (retYears * 12)) : 0;
    var marketingROI = totalCostYear > 0 ? ((newCustYear * clvMargin) - totalCostYear) / totalCostYear * 100 : 0;
    var budgetPct = companyRev > 0 ? (totalCostYear / companyRev) * 100 : 0;

    // KPI Cards
    $('r_cpl').textContent = fmtEur(cpl);
    $('r_cac').textContent = fmtEur(cac);
    $('r_roi').textContent = fmtPct(marketingROI);

    // Benchmark Table
    var rows = [
      { label: 'LTV:CAC Ratio', val: fmtRatio(ltvCac), bench: fmtRatio(bm.ltvCacGood) + '+', status: ltvCac >= bm.ltvCacGreat ? 'green' : ltvCac >= bm.ltvCacGood ? 'yellow' : 'red', statusText: ltvCac >= bm.ltvCacGreat ? 'Sehr gut' : ltvCac >= bm.ltvCacGood ? 'Ok' : 'Unter Benchmark' },
      { label: 'CAC Payback', val: fmtMonths(paybackMonths), bench: '< ' + bm.paybackGood + ' Mon.', status: paybackMonths <= bm.paybackGreat ? 'green' : paybackMonths <= bm.paybackGood ? 'yellow' : 'red', statusText: paybackMonths <= bm.paybackGreat ? 'Sehr gut' : paybackMonths <= bm.paybackGood ? 'Ok' : 'Zu lang' },
      { label: 'Cost-per-Lead', val: fmtEur(cpl), bench: fmtEur(bm.cplGreat) + ' \u2013 ' + fmtEur(bm.cplGood), status: cpl <= bm.cplGreat ? 'green' : cpl <= bm.cplGood ? 'yellow' : 'red', statusText: cpl <= bm.cplGreat ? 'Sehr gut' : cpl <= bm.cplGood ? 'Ok' : 'Zu hoch' },
      { label: 'Marketing % vom Umsatz', val: budgetPct.toFixed(1).replace('.', ',') + ' %', bench: bm.budgetPctGood + ' \u2013 ' + bm.budgetPctGreat + ' %', status: budgetPct >= bm.budgetPctGood ? 'green' : budgetPct >= bm.budgetPctGood * 0.6 ? 'yellow' : 'red', statusText: budgetPct >= bm.budgetPctGood ? 'Im Rahmen' : budgetPct >= bm.budgetPctGood * 0.6 ? 'Knapp' : 'Deutlich unter Benchmark' },
    ];

    var tbody = $('benchmarkBody');
    tbody.innerHTML = '';
    rows.forEach(function(r) {
      if (r.val === '\u2014') return;
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + r.label + '</td><td class="val">' + r.val + '</td><td style="color:var(--text-muted)">' + r.bench + '</td><td><span class="status-badge ' + r.status + '"><span class="status-dot ' + r.status + '"></span>' + r.statusText + '</span></td>';
      tbody.appendChild(tr);
    });

    // Optimized Scenario
    var optQualRate = Math.max(qualRate, bm.qualRate / 100);
    var optCloseRate = Math.max(closeRate, bm.closeRate / 100);
    var optQualLeads = leadsMonth * optQualRate;
    var optNewCustMonth = optQualLeads * optCloseRate;
    var optNewCustYear = optNewCustMonth * 12;

    var revNow = newCustYear * clv;
    var dbNow = newCustYear * clvMargin;
    var revOpt = optNewCustYear * clv;
    var dbOpt = optNewCustYear * clvMargin;
    var gap = dbOpt - dbNow;

    $('r_custNow').textContent = fmtNum(Math.round(newCustYear * 10) / 10);
    $('r_revNow').textContent = fmtEur(revNow);
    $('r_dbNow').textContent = fmtEur(dbNow);
    $('r_custOpt').textContent = fmtNum(Math.round(optNewCustYear * 10) / 10);
    $('r_revOpt').textContent = fmtEur(revOpt);
    $('r_dbOpt').textContent = fmtEur(dbOpt);

    // Profile Routing
    var redCount = 0, greenCount = 0, yellowCount = 0, weakestMetric = '';
    rows.forEach(function(r) {
      if (r.val === '\u2014') return;
      if (r.status === 'red') { redCount++; if (!weakestMetric) weakestMetric = r.label; }
      else if (r.status === 'yellow') { yellowCount++; if (!weakestMetric) weakestMetric = r.label; }
      else { greenCount++; }
    });

    ['profile_red', 'profile_mixed', 'profile_good', 'profile_excellent'].forEach(function(id) {
      $(id).classList.add('hidden');
    });

    var articleLinks = {
      'LTV:CAC Ratio': { text: 'Warum LTV:CAC die wichtigste Kennzahl ist', url: '/wissen/ltv-cac-ratio/' },
      'CAC Payback': { text: 'Was Customer Acquisition Cost wirklich bedeutet', url: '/wissen/customer-acquisition-cost/' },
      'Cost-per-Lead': { text: 'So senkst du deinen Cost-per-Lead', url: '/wissen/cost-per-lead-senken/' },
      'Marketing % vom Umsatz': { text: 'Was dein GF \u00FCber Marketing-Invest wissen muss', url: '/wissen/marketing-budget-planung/' },
    };

    var totalScored = redCount + yellowCount + greenCount;
    var profileType = redCount >= 2 ? 'red' : redCount === 1 ? 'mixed' : greenCount < totalScored ? 'good' : 'excellent';

    if (redCount >= 2) {
      $('profile_red').classList.remove('hidden');
      $('r_gap_red').textContent = gap > 0 ? ('+' + fmtEur(gap) + ' / Jahr') : fmtEur(Math.abs(gap)) + ' / Jahr';
    } else if (redCount === 1) {
      $('profile_mixed').classList.remove('hidden');
      $('r_gap_mixed').textContent = gap > 0 ? ('+' + fmtEur(gap) + ' / Jahr') : 'Optimierungspotenzial vorhanden';
      if (weakestMetric && articleLinks[weakestMetric]) {
        var link = $('r_mixed_article');
        link.textContent = articleLinks[weakestMetric].text;
        link.href = 'https://vogler.marketing' + articleLinks[weakestMetric].url;
      }
    } else if (greenCount < totalScored) {
      $('profile_good').classList.remove('hidden');
    } else {
      $('profile_excellent').classList.remove('hidden');
    }

    window._roiResults = {
      totalCostMonth: totalCostMonth, totalCostYear: totalCostYear,
      cpl: cpl, cpql: cpql, cac: cac, clv: clv, clvMargin: clvMargin,
      ltvCac: ltvCac, paybackMonths: paybackMonths, marketingROI: marketingROI,
      newCustYear: newCustYear, optNewCustYear: optNewCustYear,
      revNow: revNow, dbNow: dbNow, revOpt: revOpt, dbOpt: dbOpt, gap: gap,
      industry: industry, budgetPct: budgetPct, profile: profileType,
      redCount: redCount, yellowCount: yellowCount, greenCount: greenCount,
    };

    trackEvent('rechner_result', {
      rechner: 'roi-rechner', profile: profileType, industry: industry,
      cpl: Math.round(cpl), cac: Math.round(cac), marketing_roi: Math.round(marketingROI),
      ltv_cac: parseFloat(ltvCac.toFixed(1)), gap_eur: Math.round(gap),
      red_count: redCount, yellow_count: yellowCount, green_count: greenCount
    });

    goToStep(3);
  }

  // ==========================================================================
  // EXPORT / SHARE
  // ==========================================================================
  function showExportForm() {
    $('exportForm').classList.remove('hidden');
  }

  function submitExport() {
    var name = $('exportName').value.trim();
    var email = $('exportEmail').value.trim();
    if (!name || !email || !email.includes('@')) {
      alert('Bitte Vorname und E-Mail-Adresse eingeben.');
      return;
    }
    trackEvent('rechner_lead_capture', {
      rechner: 'roi-rechner', action: 'pdf_export',
      profile: window._roiResults ? window._roiResults.profile : 'unknown'
    });
    var msg = $('exportMsg');
    msg.textContent = 'Danke, ' + name + '! Der PDF-Report wird an ' + email + ' gesendet. (Hinweis: PDF-Versand ist noch nicht angebunden \u2014 kommt mit Brevo-Integration.)';
    msg.classList.remove('hidden');
  }

  function copyLink(btn) {
    var url = window.location.href.split('?')[0];
    navigator.clipboard.writeText(url).then(function() {
      btn.textContent = 'Link kopiert!';
      setTimeout(function() { btn.textContent = 'Rechner-Link kopieren und teilen'; }, 2000);
    });
    trackEvent('rechner_cta_clicked', {rechner: 'roi-rechner', cta: 'link_teilen'});
  }

})();
