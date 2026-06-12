// Build single-file HTML report from 6 vendor-comparison .md files.
// Run: node _build.js
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// Display order = product workflow:
//   점검대상 → 상세 → 점검이력 → 검출목록 → 제외신청 → 조치계획
const PAGES = [
  { id: 'inspection-target',        file: 'inspection-target-vendor-comparison.md',        label: '점검대상',        short: 'inspection-target' },
  { id: 'inspection-target-detail', file: 'inspection-target-detail-vendor-comparison.md', label: '점검대상 상세',   short: 'inspection-target-detail' },
  { id: 'analysis-history',         file: 'analysis-history-vendor-comparison.md',         label: '점검이력',        short: 'analysis-history' },
  { id: 'detection-list',           file: 'detection-list-vendor-comparison.md',           label: '검출목록',        short: 'detection-list' },
  { id: 'exception-request',        file: 'exception-request-vendor-comparison.md',        label: '제외신청관리',    short: 'exception-request' },
  { id: 'action-plan',              file: 'action-plan-vendor-comparison.md',              label: '조치계획관리',    short: 'action-plan' },
];

const markedSrc = fs.readFileSync(path.join(DIR, '_marked.min.js'), 'utf8');

function escapeForScriptBlock(s) {
  // Prevent premature termination of <script type="text/markdown">…</script>.
  return s.replace(/<\/(script|style)/gi, '<\\/$1');
}

function extractOneLineSummary(md) {
  const m = md.match(/\|\s*한 줄 요약\s*\|\s*([^\n|]+(?:\|[^\n|]*)?)/);
  if (!m) return '';
  // Cell text may include additional `|` only if escaped; the table uses single-cell summary, so strip trailing pipe if any.
  return m[1].replace(/\s*\|\s*$/, '').trim();
}

const pageData = PAGES.map(p => {
  const md = fs.readFileSync(path.join(DIR, p.file), 'utf8');
  return {
    id: p.id,
    file: p.file,
    label: p.label,
    summary: extractOneLineSummary(md),
    markdown: md,
  };
});

const generatedAt = new Date().toLocaleString('ko-KR', { hour12: false });

const css = `
:root {
  color-scheme: light;
  --bg: #f6f7fb;
  --panel: #ffffff;
  --ink: #1f2330;
  --ink-soft: #5d6478;
  --ink-mute: #8a90a3;
  --line: #e6e8f0;
  --line-strong: #d4d8e6;
  --accent: #6c4cd6;
  --accent-soft: #efeaff;
  --accent-ink: #4a2dab;
  --shadow: 0 1px 2px rgba(20,24,40,.04), 0 8px 24px rgba(20,24,40,.06);

  --c-match-bg: #e7f5ec;     --c-match-fg: #1a7a3a;
  --c-partial-bg: #fff4e0;   --c-partial-fg: #a85c00;
  --c-change-bg: #fff1d6;    --c-change-fg: #8a4b00;
  --c-missing-bg: #fde7e7;   --c-missing-fg: #b1262c;
  --c-extra-bg: #e6efff;     --c-extra-fg: #1f4cb6;
  --c-high-bg: #fde7e7;      --c-high-fg: #b1262c;
  --c-med-bg: #fff4e0;       --c-med-fg: #a85c00;
  --c-low-bg: #e7f0f7;       --c-low-fg: #34688a;
}
[data-theme="dark"] {
  color-scheme: dark;
  --bg: #14161e;
  --panel: #1c1f2a;
  --ink: #e7e9f3;
  --ink-soft: #aab1c5;
  --ink-mute: #7a8197;
  --line: #2a2e3d;
  --line-strong: #353a4d;
  --accent: #a48dff;
  --accent-soft: #2c2547;
  --accent-ink: #c8b8ff;
  --shadow: 0 1px 2px rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.45);

  --c-match-bg: #143822;     --c-match-fg: #7adc9c;
  --c-partial-bg: #3a2a10;   --c-partial-fg: #ffb766;
  --c-change-bg: #3a2c10;    --c-change-fg: #f1b35b;
  --c-missing-bg: #3a1718;   --c-missing-fg: #ff8a8e;
  --c-extra-bg: #18254a;     --c-extra-fg: #8fb1ff;
  --c-high-bg: #3a1718;      --c-high-fg: #ff8a8e;
  --c-med-bg: #3a2a10;       --c-med-fg: #ffb766;
  --c-low-bg: #18293a;       --c-low-fg: #8fc6ee;
}

* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.65;
  color: var(--ink);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

.app {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  overflow-y: auto;
  padding: 18px 14px 28px;
  border-right: 1px solid var(--line);
  background: var(--panel);
}
.brand {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 8px 14px;
  border-bottom: 1px dashed var(--line);
  margin-bottom: 12px;
}
.brand .logo {
  width: 32px; height: 32px; border-radius: 9px;
  background: linear-gradient(135deg, #8266e8, #5a3ec4);
  color: white; display: grid; place-items: center;
  font-weight: 700; font-size: 13px; letter-spacing: -.02em;
}
.brand .title { font-weight: 700; font-size: 14px; }
.brand .subtitle { color: var(--ink-mute); font-size: 11.5px; margin-top: 2px; }

.search {
  position: relative;
  margin: 8px 6px 14px;
}
.search input {
  width: 100%;
  padding: 9px 32px 9px 32px;
  border-radius: 9px;
  border: 1px solid var(--line-strong);
  background: var(--bg);
  color: var(--ink);
  font: inherit;
  font-size: 13px;
}
.search input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
.search .icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--ink-mute); font-size: 14px; }
.search .clear {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  border: none; background: transparent; cursor: pointer; color: var(--ink-mute);
  padding: 4px 6px; border-radius: 6px;
  display: none;
}
.search .clear:hover { background: var(--bg); color: var(--ink); }
.search.has-value .clear { display: block; }

.nav-list { list-style: none; padding: 0; margin: 0; }
.nav-page {
  border-radius: 10px;
  margin-bottom: 4px;
}
.nav-page > button.page-toggle {
  width: 100%;
  text-align: left;
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px;
  border: none; background: transparent; cursor: pointer;
  border-radius: 10px;
  color: var(--ink);
  font: inherit;
  font-weight: 600;
  font-size: 13.5px;
}
.nav-page > button.page-toggle:hover { background: var(--bg); }
.nav-page.active > button.page-toggle { background: var(--accent-soft); color: var(--accent-ink); }
.nav-page .page-num {
  display: inline-grid; place-items: center;
  width: 22px; height: 22px;
  border-radius: 6px;
  background: var(--bg);
  color: var(--ink-soft);
  font-size: 11.5px; font-weight: 700;
  flex: 0 0 auto;
}
.nav-page.active .page-num { background: var(--accent); color: white; }
.nav-page .chev { margin-left: auto; color: var(--ink-mute); font-size: 11px; transition: transform .15s; }
.nav-page.active .chev { transform: rotate(90deg); color: var(--accent-ink); }

.section-list {
  list-style: none;
  padding: 4px 6px 6px 38px;
  margin: 0;
  display: none;
  border-left: 2px solid var(--line);
  margin-left: 18px;
}
.nav-page.active .section-list { display: block; }
.section-list li > a {
  display: block;
  padding: 5px 8px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--ink-soft);
  font-size: 12.5px;
}
.section-list li > a:hover { background: var(--bg); color: var(--ink); }
.section-list li > a.current { color: var(--accent-ink); background: var(--accent-soft); font-weight: 600; }

.toolbar {
  display: flex; align-items: center; gap: 6px;
  margin: 18px 6px 6px;
  padding-top: 12px;
  border-top: 1px dashed var(--line);
}
.toolbar button, .toolbar a.tool-btn {
  flex: 1;
  border: 1px solid var(--line-strong);
  background: var(--panel);
  color: var(--ink-soft);
  padding: 6px 8px;
  border-radius: 7px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  text-align: center;
  text-decoration: none;
}
.toolbar button:hover, .toolbar a.tool-btn:hover {
  border-color: var(--accent);
  color: var(--accent-ink);
  background: var(--accent-soft);
}

/* Main area */
.main {
  min-width: 0;
  padding: 28px 36px 80px;
  max-width: 1180px;
}
.page-head {
  display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 22px;
}
.page-head h1 {
  margin: 0;
  font-size: 24px;
  letter-spacing: -.02em;
}
.page-head .crumb {
  color: var(--ink-mute);
  font-size: 12px;
  margin-bottom: 4px;
}
.page-head .summary-card {
  flex: 1 1 480px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-left: 4px solid var(--accent);
  padding: 12px 16px;
  border-radius: 10px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.6;
}

/* Markdown body */
.md-body { color: var(--ink); }
.md-body h1 { display: none; } /* H1 is shown in page-head */
.md-body h2 {
  font-size: 18px;
  margin: 32px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--line);
  scroll-margin-top: 16px;
  letter-spacing: -.01em;
}
.md-body h3 {
  font-size: 15px;
  margin: 22px 0 8px;
  scroll-margin-top: 16px;
  color: var(--ink);
}
.md-body h4 { font-size: 14px; margin: 16px 0 6px; }
.md-body p { margin: 8px 0; }
.md-body ul, .md-body ol { padding-left: 22px; margin: 8px 0; }
.md-body li { margin: 3px 0; }
.md-body code {
  background: var(--bg);
  padding: 1px 6px;
  border-radius: 5px;
  font-family: "JetBrains Mono","Cascadia Code", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--accent-ink);
  border: 1px solid var(--line);
}
.md-body pre {
  background: var(--bg);
  padding: 14px;
  border-radius: 10px;
  overflow-x: auto;
  border: 1px solid var(--line);
}
.md-body pre code { background: transparent; border: none; padding: 0; color: var(--ink); }
.md-body blockquote {
  border-left: 3px solid var(--accent);
  background: var(--accent-soft);
  padding: 8px 14px;
  margin: 12px 0;
  border-radius: 0 8px 8px 0;
  color: var(--accent-ink);
}
.md-body hr {
  border: none;
  border-top: 1px dashed var(--line);
  margin: 28px 0;
}
.md-body strong { color: var(--ink); font-weight: 700; }

/* Tables */
.md-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0 18px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  font-size: 13px;
}
.md-body th, .md-body td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
  text-align: left;
}
.md-body tr:last-child td { border-bottom: none; }
.md-body th {
  background: var(--bg);
  font-weight: 700;
  color: var(--ink-soft);
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
  white-space: nowrap;
}
.md-body td:first-child { white-space: nowrap; }

/* Verdict cell color highlight (applied via JS) */
.v-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0;
}
.v-match    { background: var(--c-match-bg);    color: var(--c-match-fg); }
.v-partial  { background: var(--c-partial-bg);  color: var(--c-partial-fg); }
.v-change   { background: var(--c-change-bg);   color: var(--c-change-fg); }
.v-missing  { background: var(--c-missing-bg);  color: var(--c-missing-fg); }
.v-extra    { background: var(--c-extra-bg);    color: var(--c-extra-fg); }
.v-high     { background: var(--c-high-bg);     color: var(--c-high-fg); }
.v-med      { background: var(--c-med-bg);      color: var(--c-med-fg); }
.v-low      { background: var(--c-low-bg);      color: var(--c-low-fg); }

/* Search highlight */
mark.hit {
  background: #fff2a8;
  color: #6c4d00;
  padding: 0 2px;
  border-radius: 3px;
}
[data-theme="dark"] mark.hit { background: #5a4d10; color: #ffe88a; }

.search-summary {
  position: sticky; top: 0;
  z-index: 5;
  margin: -28px -36px 14px;
  padding: 10px 36px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
  font-size: 12.5px;
  color: var(--ink-soft);
  display: none;
}
.search-summary.visible { display: block; }
.search-summary b { color: var(--ink); }
.search-summary a { color: var(--accent-ink); margin-right: 10px; text-decoration: none; }
.search-summary a:hover { text-decoration: underline; }

.page-section { display: none; }
.page-section.active { display: block; }
.print-all .page-section { display: block !important; }
.print-all .page-section + .page-section { margin-top: 60px; padding-top: 28px; border-top: 2px dashed var(--line); }

/* Print */
@media print {
  body { background: white; color: black; }
  .sidebar, .toolbar, .search, .search-summary { display: none !important; }
  .app { display: block; }
  .main { padding: 0; max-width: none; }
  .md-body table { box-shadow: none; }
  .page-section { display: block !important; page-break-after: always; }
  .page-head .summary-card { background: #f5f5f5 !important; border: 1px solid #ccc; }
}

/* Small screens */
@media (max-width: 920px) {
  .app { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; border-right: none; border-bottom: 1px solid var(--line); }
  .main { padding: 18px; }
}
`;

const js = `
const PAGES = ${JSON.stringify(pageData.map(p => ({ id: p.id, label: p.label, summary: p.summary })))};
const VERDICT_MAP = [
  { test: t => /^조치완료$/.test(t), cls: 'v-match' },
  { test: t => /^일치$/.test(t), cls: 'v-match' },
  { test: t => /^완전 일치$/.test(t), cls: 'v-match' },
  { test: t => /^부분일치$/.test(t) || /^부분 일치$/.test(t) || /^부분$/.test(t), cls: 'v-partial' },
  { test: t => /^변경$/.test(t) || /^변경됨$/.test(t) || /^차이$/.test(t), cls: 'v-change' },
  { test: t => /^누락$/.test(t) || /^없음$/.test(t) || /^미구현$/.test(t) || /^미적용$/.test(t), cls: 'v-missing' },
  { test: t => /^추가$/.test(t) || /^신규$/.test(t), cls: 'v-extra' },
  { test: t => /^High$/i.test(t) || /^🔴/.test(t), cls: 'v-high' },
  { test: t => /^Medium$/i.test(t) || /^🟡/.test(t), cls: 'v-med' },
  { test: t => /^Low$/i.test(t) || /^🟢/.test(t), cls: 'v-low' },
];

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('cmp-theme', t); } catch(e){}
}
function getTheme() {
  try { return localStorage.getItem('cmp-theme') || 'light'; } catch(e){ return 'light'; }
}

function renderAllPages() {
  const renderer = new marked.Renderer();
  marked.use({ gfm: true, breaks: false });

  for (const p of PAGES) {
    const md = document.getElementById('md-' + p.id).textContent;
    const html = marked.parse(md);
    const container = document.getElementById('md-body-' + p.id);
    container.innerHTML = html;

    // Add IDs to h2/h3 for anchor links.
    let idx = 0;
    container.querySelectorAll('h2, h3').forEach(h => {
      const slug = (p.id + '-h-' + (idx++) + '-' + (h.textContent || '').replace(/[^\\w가-힣]+/g, '-')).slice(0, 80);
      h.id = slug;
    });

    // Verdict pill rendering for table cells.
    container.querySelectorAll('td').forEach(td => {
      const text = (td.textContent || '').trim();
      // Don't pill-ify long sentences — only short verdict words.
      if (text.length === 0 || text.length > 12) return;
      for (const v of VERDICT_MAP) {
        if (v.test(text)) {
          td.innerHTML = '<span class="v-pill ' + v.cls + '">' + escapeHtml(text) + '</span>';
          break;
        }
      }
    });
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function buildSidebar() {
  const list = document.getElementById('nav-list');
  list.innerHTML = '';
  PAGES.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'nav-page';
    li.dataset.pageId = p.id;
    li.innerHTML = \`
      <button class="page-toggle" type="button">
        <span class="page-num">\${i+1}</span>
        <span>\${escapeHtml(p.label)}</span>
        <span class="chev">▶</span>
      </button>
      <ul class="section-list" id="sections-\${p.id}"></ul>
    \`;
    li.querySelector('.page-toggle').addEventListener('click', () => activatePage(p.id));
    list.appendChild(li);

    // Build section anchors (h2 within the page body).
    const subList = li.querySelector('.section-list');
    const body = document.getElementById('md-body-' + p.id);
    body.querySelectorAll('h2').forEach(h2 => {
      const a = document.createElement('a');
      a.href = '#' + h2.id;
      a.textContent = h2.textContent;
      a.addEventListener('click', e => { e.preventDefault(); activatePage(p.id); setTimeout(() => { h2.scrollIntoView({behavior:'smooth', block:'start'}); markCurrentSection(h2.id); }, 30); });
      const li2 = document.createElement('li');
      li2.appendChild(a);
      subList.appendChild(li2);
    });
  });
}

function activatePage(pageId) {
  document.querySelectorAll('.nav-page').forEach(el => el.classList.toggle('active', el.dataset.pageId === pageId));
  document.querySelectorAll('.page-section').forEach(el => el.classList.toggle('active', el.dataset.pageId === pageId));
  history.replaceState(null, '', '#' + pageId);
  // reset scroll inside main
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function markCurrentSection(id) {
  document.querySelectorAll('.section-list a').forEach(a => a.classList.toggle('current', a.getAttribute('href') === '#' + id));
}

function setupSearch() {
  const input = document.getElementById('search-input');
  const wrap = document.getElementById('search-wrap');
  const clear = document.getElementById('search-clear');
  const summary = document.getElementById('search-summary');
  let timer = null;

  function clearAll() {
    document.querySelectorAll('mark.hit').forEach(m => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
    summary.classList.remove('visible');
    summary.innerHTML = '';
    wrap.classList.remove('has-value');
  }

  function highlight(term) {
    clearAll();
    if (!term) return;
    wrap.classList.add('has-value');
    const re = new RegExp(term.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'gi');
    const counts = {};
    let total = 0;
    PAGES.forEach(p => {
      const root = document.getElementById('md-body-' + p.id);
      counts[p.id] = walkAndHighlight(root, re);
      total += counts[p.id];
    });
    const summaryItems = PAGES
      .filter(p => counts[p.id] > 0)
      .map(p => \`<a href="#" data-page-id="\${p.id}">\${escapeHtml(p.label)} (\${counts[p.id]})</a>\`)
      .join(' · ');
    if (total === 0) {
      summary.innerHTML = \`<b>"\${escapeHtml(term)}"</b> 검색 결과 없음\`;
    } else {
      summary.innerHTML = \`<b>"\${escapeHtml(term)}"</b> · 총 \${total}건 매칭 — 페이지로 이동: \${summaryItems}\`;
    }
    summary.classList.add('visible');
    summary.querySelectorAll('a[data-page-id]').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); activatePage(a.dataset.pageId); });
    });
  }

  function walkAndHighlight(root, re) {
    let count = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentNode && /^(SCRIPT|STYLE|MARK)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    for (const node of nodes) {
      const txt = node.nodeValue;
      if (!re.test(txt)) { re.lastIndex = 0; continue; }
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0; let m;
      while ((m = re.exec(txt)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.className = 'hit';
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
        count++;
        if (m[0].length === 0) re.lastIndex++;
      }
      if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      node.parentNode.replaceChild(frag, node);
    }
    return count;
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const v = input.value.trim();
    if (!v) { clearAll(); return; }
    timer = setTimeout(() => highlight(v), 120);
  });
  clear.addEventListener('click', () => { input.value = ''; clearAll(); input.focus(); });
}

function setupToolbar() {
  document.getElementById('btn-theme').addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
  document.getElementById('btn-print').addEventListener('click', () => {
    document.body.classList.add('print-all');
    setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove('print-all'), 500); }, 50);
  });
  document.getElementById('btn-expand-all').addEventListener('click', () => {
    document.body.classList.toggle('print-all');
    document.getElementById('btn-expand-all').textContent = document.body.classList.contains('print-all') ? '한 페이지씩 보기' : '모두 펼쳐보기';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTheme(getTheme());
  renderAllPages();
  buildSidebar();
  setupSearch();
  setupToolbar();

  const initial = (location.hash || '').replace('#', '') || PAGES[0].id;
  if (PAGES.some(p => p.id === initial)) activatePage(initial);
  else activatePage(PAGES[0].id);
});
`;

let mdScripts = '';
let pageSections = '';

for (const p of pageData) {
  const safeMd = escapeForScriptBlock(p.markdown);
  mdScripts += `<script id="md-${p.id}" type="text/markdown">\n${safeMd}\n</script>\n`;
  pageSections += `
<section class="page-section" data-page-id="${p.id}">
  <header class="page-head">
    <div>
      <div class="crumb">D-Guard 비교 보고서 · ${escapeForScriptBlock(p.label)}</div>
      <h1>${escapeForScriptBlock(p.label)}</h1>
    </div>
    <div class="summary-card"><strong>한 줄 요약 ·</strong> ${escapeForScriptBlock(p.summary || '(요약 없음)')}</div>
  </header>
  <div class="md-body" id="md-body-${p.id}"></div>
</section>
`;
}

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>D-Guard Mock vs 외부 구현 비교 보고서</title>
  <style>${css}</style>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">DG</div>
        <div>
          <div class="title">비교 보고서</div>
          <div class="subtitle">Mock 사양 vs 외부 구현<br>${generatedAt} 생성</div>
        </div>
      </div>
      <div class="search" id="search-wrap">
        <span class="icon">🔎</span>
        <input id="search-input" type="search" placeholder="모든 페이지에서 검색…" autocomplete="off">
        <button class="clear" id="search-clear" type="button" title="검색어 지우기">✕</button>
      </div>
      <ul class="nav-list" id="nav-list"></ul>
      <div class="toolbar">
        <button id="btn-theme" type="button" title="라이트/다크 토글">🌓 테마</button>
        <button id="btn-expand-all" type="button" title="모든 페이지를 한 화면에서 보기">📑 모두 펼쳐보기</button>
      </div>
      <div class="toolbar">
        <button id="btn-print" type="button">🖨 인쇄</button>
        <a class="tool-btn" href="https://121.130.177.24:29443/" target="_blank" rel="noopener">↗ 외부 구현 열기</a>
      </div>
    </aside>
    <main class="main">
      <div class="search-summary" id="search-summary"></div>
      ${pageSections}
    </main>
  </div>

  ${mdScripts}

  <script>${markedSrc}</script>
  <script>${js}</script>
</body>
</html>
`;

const out = path.join(DIR, 'index.html');
fs.writeFileSync(out, html, 'utf8');
console.log('Wrote', out, '(' + html.length.toLocaleString() + ' bytes)');
