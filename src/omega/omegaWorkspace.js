const STORAGE_KEY = 'gev.omega.workspace.v1';
const MAX_CASES = 100;
const MAX_NOTES = 500;

function safeUrl(value) {
  try {
    const url = new URL(String(value).trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function readCases() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.slice(0, MAX_CASES) : [];
  } catch {
    return [];
  }
}

function saveCases(cases) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases.slice(0, MAX_CASES)));
}

function element(tag, attrs = {}, text = '') {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key === 'type' || key === 'placeholder' || key === 'aria-label') node.setAttribute(key, value);
  }
  if (text) node.textContent = text;
  return node;
}

/** A local-first analyst notebook. It stores user-authored notes and public source links only. */
export function initOmegaWorkspace({ dataManager = null } = {}) {
  if (document.getElementById('gev-omega-launcher')) return () => {};
  let cases = readCases();
  let activeId = cases[0]?.id || null;
  const style = element('style');
  style.textContent = `
    #gev-omega-launcher{position:fixed;z-index:10020;right:22px;bottom:22px;border:1px solid #4c7c9b;background:#101923;color:#e7f4ff;border-radius:8px;padding:11px 15px;font:600 12px ui-monospace,monospace;letter-spacing:.08em;cursor:pointer;box-shadow:0 8px 28px #0008}
    #gev-omega-panel{position:fixed;z-index:10019;right:22px;bottom:72px;width:min(390px,calc(100vw - 28px));max-height:min(72vh,720px);overflow:auto;background:#0d151e;color:#e7f4ff;border:1px solid #29465b;border-radius:10px;box-shadow:0 18px 60px #000b;padding:16px;font:13px Inter,system-ui,sans-serif;display:none}
    #gev-omega-panel.open{display:block}#gev-omega-panel h2{font:600 15px ui-monospace,monospace;letter-spacing:.12em;margin:0 0 5px}#gev-omega-panel p{color:#9cb1c2;font-size:11px;line-height:1.5;margin:5px 0 13px}
    #gev-omega-panel input,#gev-omega-panel textarea,#gev-omega-panel select{box-sizing:border-box;width:100%;background:#111e29;color:#e7f4ff;border:1px solid #365064;border-radius:5px;padding:9px;margin:4px 0 9px;font:12px inherit}
    #gev-omega-panel textarea{min-height:88px;resize:vertical}#gev-omega-panel button{background:#17364a;color:#e7f4ff;border:1px solid #3b657d;border-radius:5px;padding:8px 10px;cursor:pointer;font-size:11px;margin:3px 4px 3px 0}
    #gev-omega-panel button:hover{background:#20516a}#gev-omega-panel .muted{color:#8ea6b8;font-size:10px}#gev-omega-panel .case-list{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0 12px}#gev-omega-panel .case-list button[aria-pressed=true]{border-color:#7bc7f2;background:#1d4055}
    #gev-omega-panel .omega-row{display:flex;gap:8px;align-items:center;justify-content:space-between}#gev-omega-panel a{color:#8bd0ff;overflow-wrap:anywhere}
    #gev-omega-panel .omega-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0 13px}
    #gev-omega-panel .omega-stat{background:#132330;border:1px solid #29465b;border-radius:6px;padding:9px;min-width:0}
    #gev-omega-panel .omega-stat strong{display:block;font:600 18px ui-monospace,monospace;color:#b8e4ff}
    #gev-omega-panel .omega-stat span{display:block;color:#8ea6b8;font-size:9px;letter-spacing:.08em;margin-top:3px}
    #gev-omega-panel .omega-latest{border-left:2px solid #477c9a;padding:5px 9px;margin:8px 0 12px;color:#b8cbd8;font-size:11px}
    #gev-omega-panel .omega-health{border-top:1px solid #29465b;margin-top:12px;padding-top:10px}
    #gev-omega-panel .omega-health-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;padding:7px 0;border-bottom:1px solid #1c2d3b}
    #gev-omega-panel .omega-health-name{font-size:11px;color:#d7e9f5;overflow-wrap:anywhere}
    #gev-omega-panel .omega-health-meta{font-size:10px;color:#8ea6b8;margin-top:2px}
    #gev-omega-panel .omega-health-state{font:600 9px ui-monospace,monospace;letter-spacing:.06em;color:#a9c9dc;white-space:nowrap}
    #gev-omega-panel .omega-health-state[data-state=error],#gev-omega-panel .omega-health-state[data-state=unavailable]{color:#ffad9f}
    #gev-omega-panel .omega-health-state[data-state=refreshing],#gev-omega-panel .omega-health-state[data-state=loading]{color:#f0d28b}
  `;
  document.head.append(style);
  const launcher = element('button', { id: 'gev-omega-launcher', type: 'button', 'aria-label': 'Open Omega analyst workspace' }, '◈ OMEGA WORKSPACE');
  const panel = element('section', { id: 'gev-omega-panel', 'aria-label': 'Omega analyst workspace' });
  document.body.append(launcher, panel);

  function activeCase() { return cases.find((item) => item.id === activeId) || null; }
  function persist() { saveCases(cases); render(); }
  function render() {
    panel.replaceChildren();
    const header = element('div', { class: 'omega-row' });
    header.append(element('h2', {}, 'GOD’S EYE / OMEGA'));
    const close = element('button', { type: 'button' }, 'CLOSE');
    close.addEventListener('click', () => panel.classList.remove('open'));
    header.append(close);
    panel.append(header, element('p', {}, 'LOCAL ANALYST NOTEBOOK · Your notes stay in this browser. Record public sources, observations, and confidence; verify claims independently.'));
    const create = element('button', { type: 'button' }, '+ NEW CASE');
    create.addEventListener('click', () => {
      const title = prompt('Case title');
      if (!title?.trim()) return;
      const item = { id: crypto.randomUUID(), title: title.trim().slice(0, 120), createdAt: new Date().toISOString(), notes: '', sources: [], timeline: [] };
      cases.unshift(item); activeId = item.id; persist();
    });
    panel.append(create);
    // Workspace overview is calculated only from analyst-authored local case data.
    const totalSources = cases.reduce((sum, item) => sum + (item.sources || []).length, 0);
    const totalEvents = cases.reduce((sum, item) => sum + (item.timeline || []).length, 0);
    const latestEvent = cases.flatMap((item) => (item.timeline || []).map((event) => ({ ...event, caseTitle: item.title })))
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
    const overview = element('div', { class: 'omega-overview', 'aria-label': 'Workspace summary' });
    for (const [value, labelText] of [[String(cases.length), 'CASES'], [String(totalSources), 'SOURCES'], [String(totalEvents), 'TIMELINE EVENTS']]) {
      const stat = element('div', { class: 'omega-stat' });
      stat.append(element('strong', {}, value), element('span', {}, labelText));
      overview.append(stat);
    }
    panel.append(overview);
    if (latestEvent) {
      const latest = element('div', { class: 'omega-latest' });
      latest.append(element('strong', {}, 'LATEST RECORDED EVENT · ' + latestEvent.caseTitle));
      latest.append(element('div', {}, latestEvent.title + ' · ' + new Date(latestEvent.occurredAt).toLocaleString()));
      panel.append(latest);
    }
    if (dataManager?.getAll) {
      const health = element('section', { class: 'omega-health', 'aria-label': 'Live data source health' });
      health.append(element('strong', {}, 'LIVE DATA LAYER HEALTH'));
      health.append(element('p', {}, 'Status is read from the application’s actual layer lifecycle and provider statistics. Unknown timestamps remain unknown.'));
      const layers = dataManager.getAll();
      const visibleLayers = layers.filter((layer) => layer.enabled || layer.stats?.error || layer.stats?.managerRefreshError || layer.stats?.sourceUnavailable);
      if (!visibleLayers.length) {
        health.append(element('div', { class: 'omega-health-meta' }, 'No data layers are currently enabled.'));
      }
      for (const layer of visibleLayers.slice(0, 16)) {
        const stats = layer.stats || {};
        const state = stats.sourceUnavailable || stats.status === 'unavailable' ? 'unavailable'
          : stats.error || stats.managerRefreshError ? 'error'
          : stats.refreshing ? 'refreshing'
          : stats.loading || layer.lifecycleState === 'enabling' ? 'loading'
          : layer.enabled ? 'active' : 'off';
        const row = element('div', { class: 'omega-health-row' });
        const detail = element('div');
        detail.append(element('div', { class: 'omega-health-name' }, layer.name || layer.id));
        const timestamp = stats.lastUpdate ? new Date(stats.lastUpdate) : null;
        const freshness = timestamp && !Number.isNaN(timestamp.getTime())
          ? 'Last update ' + timestamp.toLocaleString()
          : 'Last update time not reported';
        const count = Number.isFinite(Number(stats.count)) ? ' · ' + Number(stats.count).toLocaleString() + ' records' : '';
        detail.append(element('div', { class: 'omega-health-meta' }, freshness + count));
        const status = element('span', { class: 'omega-health-state' }, state.toUpperCase());
        status.dataset.state = state;
        row.append(detail, status);
        health.append(row);
      }
      if (visibleLayers.length > 16) health.append(element('div', { class: 'omega-health-meta' }, 'Showing 16 of ' + visibleLayers.length + ' enabled or degraded layers.'));
      panel.append(health);
    }
    const list = element('div', { class: 'case-list' });
    for (const item of cases) {
      const choice = element('button', { type: 'button' }, item.title);
      choice.setAttribute('aria-pressed', String(item.id === activeId));
      choice.addEventListener('click', () => { activeId = item.id; render(); });
      list.append(choice);
    }
    panel.append(list);
    const current = activeCase();
    if (!current) {
      panel.append(element('p', {}, 'Create a case to collect notes and source links.'));
      return;
    }
    const title = element('input', { type: 'text', placeholder: 'Case title' });
    title.value = current.title;
    title.addEventListener('change', () => { current.title = title.value.trim().slice(0, 120) || 'Untitled case'; persist(); });
    panel.append(element('label', {}, 'CASE TITLE'), title);
    const notes = element('textarea', { placeholder: 'Observations, hypotheses, timestamps, and questions…' });
    notes.maxLength = MAX_NOTES; notes.value = current.notes || '';
    notes.addEventListener('change', () => { current.notes = notes.value; persist(); });
    panel.append(element('label', {}, 'FIELD NOTES'), notes);
    const url = element('input', { type: 'url', placeholder: 'https://public-source.example/article' });
    const label = element('input', { type: 'text', placeholder: 'Source description (optional)' });
    const add = element('button', { type: 'button' }, 'ADD PUBLIC SOURCE');
    add.addEventListener('click', () => {
      const href = safeUrl(url.value);
      if (!href) { alert('Enter a valid http or https source URL.'); return; }
      current.sources ||= [];
      current.sources.push({ url: href, label: label.value.trim().slice(0, 160), addedAt: new Date().toISOString() });
      url.value = ''; label.value = ''; persist();
    });
    panel.append(element('label', {}, 'SOURCE URL'), url, label, add);
    const sourceList = element('ul');
    for (const source of current.sources || []) {
      const row = element('li');
      const link = element('a', {}, source.label || source.url);
      link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      row.append(link, element('span', { class: 'muted' }, ' · ' + new Date(source.addedAt).toLocaleString()));
      sourceList.append(row);
    }
    panel.append(sourceList);
    // Timestamped case timeline: entries are user-authored and never imply live verification.
    current.timeline ||= [];
    panel.append(element('label', {}, 'EVENT TIMELINE'));
    const eventTitle = element('input', { type: 'text', placeholder: 'Event / observation title' });
    const eventTime = element('input', { type: 'datetime-local' });
    eventTime.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const eventType = element('select');
    for (const [value, labelText] of [['observation', 'Observation'], ['report', 'Public report'], ['analysis', 'Analysis'], ['question', 'Open question']]) {
      const option = element('option', { type: 'text' }, labelText);
      option.value = value;
      eventType.append(option);
    }
    const eventSource = element('select');
    const noSource = element('option', {}, 'No linked source');
    noSource.value = '';
    eventSource.append(noSource);
    for (let i = 0; i < (current.sources || []).length; i += 1) {
      const source = current.sources[i];
      const option = element('option', {}, source.label || source.url);
      option.value = String(i);
      eventSource.append(option);
    }
    const eventDetails = element('textarea', { placeholder: 'What happened? Include uncertainty and context…' });
    eventDetails.maxLength = 1000;
    const addEvent = element('button', { type: 'button' }, 'ADD TIMELINE EVENT');
    addEvent.addEventListener('click', () => {
      const titleText = eventTitle.value.trim();
      if (!titleText) { alert('Enter an event title.'); return; }
      const parsedTime = new Date(eventTime.value);
      if (!eventTime.value || Number.isNaN(parsedTime.getTime())) { alert('Choose a valid event time.'); return; }
      current.timeline.push({
        id: crypto.randomUUID(),
        title: titleText.slice(0, 160),
        type: eventType.value,
        occurredAt: parsedTime.toISOString(),
        details: eventDetails.value.trim().slice(0, 1000),
        sourceIndex: eventSource.value === '' ? null : Number(eventSource.value),
        recordedAt: new Date().toISOString(),
      });
      current.timeline.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
      persist();
    });
    panel.append(eventTitle, eventTime, eventType, eventSource, eventDetails, addEvent);
    const timelineList = element('ol');
    for (const entry of current.timeline) {
      const row = element('li');
      const heading = element('strong', {}, entry.title + ' · ' + (entry.type || 'observation'));
      const when = element('div', { class: 'muted' }, new Date(entry.occurredAt).toLocaleString());
      row.append(heading, when);
      if (entry.details) row.append(element('p', {}, entry.details));
      if (Number.isInteger(entry.sourceIndex) && current.sources[entry.sourceIndex]) {
        const source = current.sources[entry.sourceIndex];
        const link = element('a', {}, '↗ ' + (source.label || source.url));
        link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        row.append(link);
      }
      const removeEvent = element('button', { type: 'button' }, 'REMOVE');
      removeEvent.addEventListener('click', () => {
        current.timeline = current.timeline.filter((item) => item.id !== entry.id);
        persist();
      });
      row.append(removeEvent);
      timelineList.append(row);
    }
    panel.append(timelineList);
    const actions = element('div', { class: 'omega-row' });
    const exportButton = element('button', { type: 'button' }, 'EXPORT CASE JSON');
    exportButton.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
      const href = URL.createObjectURL(blob); const anchor = element('a');
      anchor.href = href; anchor.download = 'omega-case-' + current.id + '.json'; anchor.click();
      URL.revokeObjectURL(href);
    });
    const remove = element('button', { type: 'button' }, 'DELETE CASE');
    remove.addEventListener('click', () => {
      if (!confirm('Delete this local case and its notes?')) return;
      cases = cases.filter((item) => item.id !== current.id); activeId = cases[0]?.id || null; persist();
    });
    actions.append(exportButton, remove); panel.append(actions);
    panel.append(element('p', { class: 'muted' }, 'Sources are user-added links, not verified endorsements. This notebook does not identify or track private individuals.'));
  }
  launcher.addEventListener('click', () => { panel.classList.toggle('open'); render(); });
  const unsubscribeData = dataManager?.subscribe?.(() => { if (panel.classList.contains('open')) render(); });
  render();
  return () => { unsubscribeData?.(); launcher.remove(); panel.remove(); style.remove(); };
}
