// Vanguard Brief — Standalone Local Admin & Scheduler Portal
// Runs locally only (http://localhost:4000). Completely separate from the public viewer site.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 4000;
const cfg = JSON.parse(fs.readFileSync('site.config.json', 'utf8'));
const PIN = cfg.schedulerPin || '1921';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

function getLivePosts() {
  const today = new Date().toISOString().slice(0, 10);
  if (!fs.existsSync('posts')) return [];
  return fs.readdirSync('posts')
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join('posts', f), 'utf8').replace(/\r\n/g, '\n');
      const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!m) return null;
      const meta = {};
      m[1].split('\n').forEach(l => {
        const i = l.indexOf(':');
        if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim();
      });
      const date = meta.date || f.slice(0, 10);
      const isScheduled = date > today;
      const isDraft = meta.draft === 'true';
      const tags = (meta.tags || '').split(',').map(s => s.trim()).filter(Boolean);
      const slug = f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
      const words = m[2].split(/\s+/).length;
      return {
        file: f,
        slug,
        title: meta.title || f,
        desc: meta.description || '',
        date,
        tags,
        draft: isDraft,
        scheduled: isScheduled,
        mins: Math.max(1, Math.round(words / 200)),
        previewUrl: `http://localhost:3000/posts/${slug}/`
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function renderHtml() {
  const posts = getLivePosts();
  const today = new Date().toISOString().slice(0, 10);
  const totalPosts = posts.length;
  const livePosts = posts.filter(p => !p.draft && !p.scheduled);
  const schedPosts = posts.filter(p => p.scheduled);
  const draftPosts = posts.filter(p => p.draft);
  const aviationPosts = posts.filter(p => p.tags.some(t => /aviation|aerospace|aircraft|air force/i.test(t)));
  const militaryPosts = posts.filter(p => p.tags.some(t => /military|defence|navy|army|special forces/i.test(t)));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>🛡️ Admin &amp; Scheduler Control Center | Vanguard Brief (Port ${PORT})</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>">
  <style>
    :root {
      --bg: #0d110e;
      --card: #151c14;
      --card-hover: #192318;
      --text: #ecf0e7;
      --mute: #97a390;
      --acc: #c9a84c;
      --line: #222d20;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    header {
      background: rgba(13, 17, 14, 0.95);
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
    }
    .header-inner {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0.9rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .brand-title {
      font-weight: 800;
      font-size: 1.15rem;
      letter-spacing: 0.05em;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .port-badge {
      background: #2a2310;
      color: #f0c642;
      border: 1px solid #b9a44c;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1.25rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1.1rem;
      text-align: center;
    }
    .stat-num {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--acc);
      line-height: 1.2;
    }
    .stat-lbl {
      font-size: 0.78rem;
      color: var(--mute);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }
    .filter-bar {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .filter-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }
    .filter-row:last-child { margin-bottom: 0; }
    .filter-label {
      font-size: 0.8rem;
      color: var(--mute);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      min-width: 80px;
    }
    .filter-btn {
      background: #172016;
      border: 1px solid var(--line);
      color: var(--mute);
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      font-size: 0.82rem;
      cursor: pointer;
      font-weight: 500;
      transition: all .15s ease;
    }
    .filter-btn:hover { color: var(--text); border-color: var(--acc); }
    .filter-btn.active {
      background: var(--acc);
      color: #0d110e;
      border-color: var(--acc);
      font-weight: 700;
    }
    input[type="search"] {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: 6px;
      color: var(--text);
      font-size: 0.92rem;
      outline: none;
    }
    input[type="search"]:focus { border-color: var(--acc); }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th, td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--line);
    }
    th {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--mute);
      background: #111710;
    }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .btn-action {
      background: var(--acc);
      color: #0d110e;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.82rem;
      display: inline-block;
      border: none;
      cursor: pointer;
    }
    .btn-action:hover { background: #dfbe65; }
    .btn-rebuild {
      background: #2a2310;
      border: 1px solid #b9a44c;
      color: #f0c642;
      padding: 0.55rem 1.1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-rebuild:hover { background: #3c3214; }
    #rebuild-status {
      font-size: 0.85rem;
      margin-left: 0.8rem;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- Auth Lock Screen -->
  <div id="auth-lock" style="display:flex;min-height:100vh;align-items:center;justify-content:center;padding:1.5rem">
    <div class="card" style="text-align:center;max-width:440px;width:100%;border-color:var(--acc);padding:2.5rem 2rem">
      <div style="font-size:2.8rem;margin-bottom:0.6rem">🛡️</div>
      <h2 style="margin:0 0 0.4rem;font-size:1.5rem">Vanguard Brief Admin</h2>
      <p style="color:var(--mute);font-size:0.9rem;margin-bottom:1.8rem">Private Author Control Center running on <strong>http://localhost:${PORT}</strong>. Enter your Admin PIN to unlock.</p>
      <input type="password" id="pin-input" placeholder="Enter Admin PIN" style="width:100%;padding:0.85rem;margin-bottom:1rem;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--text);font-size:1.2rem;text-align:center;outline:none">
      <button onclick="checkAdminPin()" style="width:100%;padding:0.85rem;background:var(--acc);color:#0d110e;font-weight:700;font-size:1rem;border:none;border-radius:8px;cursor:pointer">Unlock Dashboard</button>
      <p id="pin-err" style="color:#e53e3e;font-size:0.88rem;display:none;margin-top:0.85rem">Incorrect PIN. Please try again.</p>
    </div>
  </div>

  <!-- Main Admin Interface -->
  <div id="admin-content" style="display:none">
    <header>
      <div class="header-inner">
        <div class="brand-title">
          <span>🛡️ Vanguard Brief</span>
          <span class="port-badge">LOCAL PORT :${PORT}</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem">
          <button class="btn-rebuild" onclick="triggerRebuild()">⚙️ Run Rebuild</button>
          <button onclick="logoutAdmin()" style="background:var(--card);border:1px solid var(--line);color:var(--mute);padding:0.5rem 0.9rem;border-radius:6px;cursor:pointer;font-size:0.82rem;font-weight:600">🔒 Lock &amp; Exit</button>
        </div>
      </div>
    </header>

    <div class="container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 style="margin:0;font-size:1.8rem">Author &amp; Scheduler Dashboard</h1>
          <p style="color:var(--mute);margin:0.25rem 0 0;font-size:0.92rem">All private files and controls live strictly on your local machine. Nothing is exposed on the public site.</p>
        </div>
        <div id="rebuild-banner" style="display:none;padding:0.5rem 1rem;border-radius:6px;background:#1c3d23;border:1px solid #2f855a;color:#68d391;font-size:0.88rem"></div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-num">${totalPosts}</div><div class="stat-lbl">Total Posts</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#68d391">${livePosts.length}</div><div class="stat-lbl">Live on Site</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#f0c642">${schedPosts.length}</div><div class="stat-lbl">Scheduled</div></div>
        <div class="stat-card"><div class="stat-num">${aviationPosts.length}</div><div class="stat-lbl">Aviation &amp; Aero</div></div>
        <div class="stat-card"><div class="stat-num">${militaryPosts.length}</div><div class="stat-lbl">Military &amp; Def</div></div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-row">
          <span class="filter-label">Status:</span>
          <button class="filter-btn active" data-status-filter="all">All (${totalPosts})</button>
          <button class="filter-btn" data-status-filter="live">🟢 Live (${livePosts.length})</button>
          <button class="filter-btn" data-status-filter="scheduled">⏳ Scheduled (${schedPosts.length})</button>
          ${draftPosts.length ? `<button class="filter-btn" data-status-filter="draft">📝 Drafts (${draftPosts.length})</button>` : ''}
        </div>
        <div class="filter-row">
          <span class="filter-label">Subtopic:</span>
          <button class="filter-btn active" data-topic-filter="all">All Subtopics</button>
          <button class="filter-btn" data-topic-filter="military">⚔️ Military &amp; Defence</button>
          <button class="filter-btn" data-topic-filter="aviation">✈️ Aviation &amp; Aerospace</button>
          <button class="filter-btn" data-topic-filter="global">🌐 Global Defence</button>
        </div>
        <div style="margin-top:0.75rem">
          <input type="search" id="admin-search" placeholder="🔍 Search posts by title, tag, or filename...">
        </div>
      </div>

      <!-- Posts & Scheduler Table -->
      <div class="card" style="padding:0;overflow:hidden">
        <table id="admin-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Post Title &amp; Filename</th>
              <th>Target Date</th>
              <th>Read Time</th>
              <th>Subtopics</th>
            </tr>
          </thead>
          <tbody>
          ${posts.map(p => {
            const daysLeft = Math.ceil((new Date(p.date) - new Date(today)) / (1000 * 60 * 60 * 24));
            let statusKey = 'live', badge = '';
            if (p.draft) {
              statusKey = 'draft';
              badge = '<span class="badge" style="background:#333;color:#bbb">Draft</span>';
            } else if (p.scheduled) {
              statusKey = 'scheduled';
              badge = `<span class="badge" style="background:#554415;color:#f0c642;border:1px solid #b9a44c">Scheduled (${daysLeft}d left)</span>`;
            } else {
              statusKey = 'live';
              badge = '<span class="badge" style="background:#1c3d23;color:#68d391">Live</span>';
            }

            const tagsHtml = p.tags.map(t => `<span class="badge" style="background:#1a2217;border:1px solid var(--line);color:var(--mute);margin:0.15rem 0.2rem 0 0">#${esc(t)}</span>`).join('');
            return `<tr class="post-row" data-status="${statusKey}" data-tags="${esc(p.tags.join(',').toLowerCase())}">
              <td>${badge}</td>
              <td>
                <strong style="font-size:0.98rem">${esc(p.title)}</strong><br>
                <small style="color:var(--mute);font-family:monospace">posts/${esc(p.file)}</small>
              </td>
              <td><code>${p.date}</code></td>
              <td>${p.mins} min</td>
              <td>${tagsHtml}</td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>
        <div id="no-match" style="display:none;color:var(--mute);text-align:center;padding:2.5rem 0">No posts match the selected filter.</div>
      </div>

      <!-- Instructions Card -->
      <div class="card" style="background:#121812">
        <h3 style="margin:0 0 0.5rem;color:var(--acc);font-size:1.05rem">Private Author Server Guide</h3>
        <p style="margin:0;font-size:0.88rem;line-height:1.6;color:var(--mute)">
          • <strong>Security:</strong> This portal is completely severed from your GitHub repository dist folder. Visitors browsing your live blog cannot access this dashboard.<br>
          • <strong>Adding a Post:</strong> Create a new <code>.md</code> file in <code>posts/</code> with <code>date: YYYY-MM-DD</code>.<br>
          • <strong>Scheduling:</strong> If the date is set in the future, it is automatically marked Scheduled.<br>
          • <strong>Instant Rebuild:</strong> Click the <strong>"⚙️ Run Rebuild"</strong> button above anytime you make edits to regenerate the public viewer site.
        </p>
      </div>
    </div>
  </div>

  <script>
    let activeStatus = 'all', activeTopic = 'all';
    const rows = document.querySelectorAll('#admin-table tbody tr.post-row');
    const searchInput = document.getElementById('admin-search');
    const noMatch = document.getElementById('no-match');

    function filterTable() {
      const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
      let count = 0;
      rows.forEach(r => {
        const s = r.getAttribute('data-status');
        const tags = r.getAttribute('data-tags') || '';
        const txt = r.innerText.toLowerCase();

        let matchStatus = (activeStatus === 'all') || (s === activeStatus);
        let matchTopic = (activeTopic === 'all');
        if (activeTopic === 'military') matchTopic = tags.includes('military') || tags.includes('defence') || tags.includes('navy');
        if (activeTopic === 'aviation') matchTopic = tags.includes('aviation') || tags.includes('aerospace') || tags.includes('aircraft');
        if (activeTopic === 'global') matchTopic = tags.includes('global') || tags.includes('ranks');

        let matchSearch = !q || txt.includes(q);
        let visible = matchStatus && matchTopic && matchSearch;
        r.style.display = visible ? '' : 'none';
        if (visible) count++;
      });
      if (noMatch) noMatch.style.display = (count === 0) ? 'block' : 'none';
    }

    document.querySelectorAll('[data-status-filter]').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('[data-status-filter]').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        activeStatus = b.getAttribute('data-status-filter');
        filterTable();
      });
    });

    document.querySelectorAll('[data-topic-filter]').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('[data-topic-filter]').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        activeTopic = b.getAttribute('data-topic-filter');
        filterTable();
      });
    });

    if (searchInput) searchInput.addEventListener('input', filterTable);

    function checkAdminPin() {
      const val = document.getElementById('pin-input').value;
      if (val === '${PIN}') {
        document.getElementById('auth-lock').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        sessionStorage.setItem('admin_auth', '1');
      } else {
        document.getElementById('pin-err').style.display = 'block';
      }
    }

    function logoutAdmin() {
      sessionStorage.removeItem('admin_auth');
      location.reload();
    }

    document.getElementById('pin-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkAdminPin();
    });

    if (sessionStorage.getItem('admin_auth') === '1') {
      const lock = document.getElementById('auth-lock');
      const content = document.getElementById('admin-content');
      if (lock) lock.style.display = 'none';
      if (content) content.style.display = 'block';
    }

    async function triggerRebuild() {
      const banner = document.getElementById('rebuild-banner');
      banner.style.display = 'block';
      banner.style.background = '#2a2310';
      banner.style.borderColor = '#b9a44c';
      banner.style.color = '#f0c642';
      banner.innerText = '⚙️ Rebuilding public viewer site...';

      try {
        const res = await fetch('/api/rebuild', { method: 'POST' });
        const data = await res.json();
        if (data.ok) {
          banner.style.background = '#1c3d23';
          banner.style.borderColor = '#2f855a';
          banner.style.color = '#68d391';
          banner.innerText = '✅ ' + data.msg;
          setTimeout(() => { banner.style.display = 'none'; }, 4000);
        } else {
          banner.style.background = '#3b1d1d';
          banner.style.borderColor = '#9b2c2c';
          banner.style.color = '#fc8181';
          banner.innerText = '❌ Rebuild failed: ' + data.msg;
        }
      } catch (err) {
        banner.style.background = '#3b1d1d';
        banner.style.borderColor = '#9b2c2c';
        banner.style.color = '#fc8181';
        banner.innerText = '❌ Request error: ' + err.message;
      }
    }
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/rebuild' && req.method === 'POST') {
    try {
      execSync('node build.js', { stdio: 'pipe' });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, msg: 'Public site rebuilt successfully in dist/!' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, msg: e.message }));
    }
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderHtml());
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n======================================================`);
  console.log(`🛡️ Vanguard Brief Admin Control Center running!`);
  console.log(`🔗 Local Address: http://localhost:${PORT}`);
  console.log(`🔑 Admin PIN    : ${PIN}`);
  console.log(`======================================================\n`);
});
