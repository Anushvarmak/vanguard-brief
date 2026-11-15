// Vanguard Brief static site builder. No dependencies. Run: node build.js  (preview: node build.js serve)
const fs=require('fs'),path=require('path'),http=require('http');
const cfg=JSON.parse(fs.readFileSync('site.config.json','utf8'));
const DEV=process.argv.includes('serve');
const base=DEV?'':new URL(cfg.url).pathname.replace(/\/$/,'');
const abs=p=>cfg.url+p;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const slug=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const fmt=d=>new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
const inline=s=>esc(s)
  .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1" loading="lazy">')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>')
  .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');
function md(src){
  const out=[];let list=null,para=[],tbl=[],q=null;
  const flush=()=>{if(para.length){out.push('<p>'+inline(para.join(' '))+'</p>');para=[];}};
  const end=()=>{if(list){out.push(`</${list}>`);list=null;}};
  const row=(l,t)=>'<tr>'+l.trim().replace(/^\||\|$/g,'').split('|').map(c=>`<${t}>${inline(c.trim())}</${t}>`).join('')+'</tr>';
  const endTbl=()=>{if(tbl.length){out.push('<div class="tbl"><table>'+row(tbl[0],'th')+tbl.slice(2).map(l=>row(l,'td')).join('')+'</table></div>');tbl=[];}};
  for(const line of src.split('\n')){
    let m;
    if(line.startsWith('|')){flush();end();tbl.push(line);continue;}
    endTbl();
    if(!line.trim()){flush();end();}
    else if(m=line.match(/^Q:\s*(.*)/)){flush();end();q=m[1];}
    else if(q!==null&&(m=line.match(/^A:\s*(.*)/))){out.push(`<details><summary>${inline(q)}</summary><p>${inline(m[1])}</p></details>`);q=null;}
    else if(m=line.match(/^(#{1,4})\s+(.*)/)){flush();end();out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);}
    else if(m=line.match(/^>\s?(.*)/)){flush();end();out.push('<blockquote>'+inline(m[1])+'</blockquote>');}
    else if(m=line.match(/^([-*]|\d+\.)\s+(.*)/)){flush();const t=/\d/.test(m[1])?'ol':'ul';if(list!==t){end();out.push(`<${t}>`);list=t;}out.push('<li>'+inline(m[2])+'</li>');}
    else if(/^---+$/.test(line)){flush();end();out.push('<hr>');}
    else{end();para.push(line);}
  }
  flush();end();endTbl();return out.join('\n');
}
const today=new Date().toISOString().slice(0,10);
const pin=cfg.schedulerPin||'1921';
const allPosts=fs.readdirSync('posts').filter(f=>f.endsWith('.md')).map(f=>{
  const raw=fs.readFileSync('posts/'+f,'utf8').replace(/\r\n/g,'\n');
  const m=raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!m)throw new Error(f+': missing front matter (--- block at top)');
  const meta={};m[1].split('\n').forEach(l=>{const i=l.indexOf(':');if(i>0)meta[l.slice(0,i).trim()]=l.slice(i+1).trim();});
  const date=meta.date||f.slice(0,10);
  const isScheduled=date>today;
  const isDraft=meta.draft==='true';
  return{file:f,slug:f.replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/\.md$/,''),title:meta.title||f,desc:meta.description||'',date,
    own:!!meta.image,image:meta.image||cfg.defaultImage,draft:isDraft,scheduled:isScheduled,
    tags:(meta.tags||'').split(',').map(s=>s.trim()).filter(Boolean),html:md(m[2]),mins:Math.max(1,Math.round(m[2].split(/\s+/).length/200))};
}).sort((a,b)=>b.date.localeCompare(a.date));

// In production, only show published live posts (not draft, and date <= today)
// In local DEV mode, show scheduled posts with badge so author can preview!
const posts=allPosts.filter(p=>!p.draft&&(!p.scheduled||DEV));

function page({title,desc,path:p,image,type='website',body,ld='',isAdmin=false}){
  const url=abs(p),img=image.startsWith('http')?image:abs(image);
  const full=p==='/'?cfg.name:`${title} | ${cfg.name}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:site_name" content="${esc(cfg.name)}"><meta property="og:type" content="${type}"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/style.css">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="shortcut icon" href="/favicon.svg">${ld}</head><body>
<header class="site-header"><div class="header-inner">
  <div class="brand-area"><a class="logo" href="/">🛡️ ${esc(cfg.name)}</a><span class="brand-badge">CIVILIAN OSINT</span></div>
  <nav class="nav-bar">
    <a class="nav-link ${p==='/'?'active':''}" href="/">Home</a>
    <a class="nav-link ${p==='/author/'?'active':''}" href="/author/">Author</a>
    ${cfg.linkedin?`<a class="nav-link nav-linkedin" href="${cfg.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>`:''}
  </nav>
</div></header>
<main>${body}</main>
<footer>
  <div>© ${new Date().getFullYear()} ${esc(cfg.author)}. Based on open-source information only.</div>
  <div><a href="/admin/" class="footer-admin-link">Author Portal 🔒</a></div>
</footer>
${cfg.goatcounter?`<script data-goatcounter="https://${cfg.goatcounter}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`:''}
<script>
(function(){
  var l=document.querySelector('.logo');
  if(l){
    l.addEventListener('dblclick',function(e){
      e.preventDefault();
      location.href='${base}/admin/';
    });
  }
})();
</script>
</body></html>`.replace(/(src|href)="\/(?!\/)/g,`$1="${base}/`);
}
const tagLinks=p=>p.tags.map(t=>`<a href="/tags/${slug(t)}/">#${esc(t.replace(/\s+/g,''))}</a>`).join('');
const card=p=>`<div class="card" data-tags="${esc(p.tags.join(',').toLowerCase())}">${p.own?`<img src="${p.image}" alt="" loading="lazy">`:''}<h2><a href="/posts/${p.slug}/">${esc(p.title)}</a>${p.scheduled?` <span class="badge" style="background:#554415;color:#f0c642;border:1px solid #b9a44c">Scheduled: ${fmt(p.date)}</span>`:''}</h2><p>${esc(p.desc)}</p><small>${fmt(p.date)} · ${p.mins} min read</small><div class="tags">${tagLinks(p)}</div></div>`;
const out=(p,c)=>{const f=path.join('dist',p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,c);};

fs.rmSync('dist',{recursive:true,force:true});
if(fs.existsSync('static'))fs.cpSync('static','dist',{recursive:true});
out('index.html',page({title:cfg.name,desc:cfg.tagline,path:'/',image:cfg.defaultImage,
  body:`<div class="hero"><h1>${esc(cfg.name)}</h1><p>${esc(cfg.tagline)}</p>
<div class="search-box"><input type="search" id="q" placeholder="🔍 Search articles, tags, or topics (e.g. Special Forces, Navy, Aviation, Ranks)..." autocomplete="off"></div>
<div class="topic-filters">
  <button class="topic-btn active" data-filter="all">All Topics</button>
  <button class="topic-btn" data-filter="military">⚔️ Military &amp; Defence</button>
  <button class="topic-btn" data-filter="aviation">✈️ Aviation &amp; Aerospace</button>
  <button class="topic-btn" data-filter="global">🌐 Global Defence</button>
</div>
</div><div id="posts-list">${posts.map(card).join('')}</div><div id="no-res" style="display:none;color:var(--mute);text-align:center;padding:2.5rem 0;font-size:1.05rem">No articles found matching your search.</div><script>
let curFilter='all';
const q=document.getElementById('q');
const cards=document.querySelectorAll('#posts-list .card');
const noRes=document.getElementById('no-res');
const filterBtns=document.querySelectorAll('.topic-btn');

function runFilters(){
  const query=(q?q.value:'').toLowerCase().trim();
  let shown=0;
  cards.forEach(c=>{
    const text=c.innerText.toLowerCase();
    const tags=(c.getAttribute('data-tags')||'').toLowerCase();
    let matchesTopic=true;
    if(curFilter==='military'){
      matchesTopic=tags.includes('military')||tags.includes('defence')||tags.includes('special forces')||tags.includes('navy')||tags.includes('army');
    }else if(curFilter==='aviation'){
      matchesTopic=tags.includes('aviation')||tags.includes('aerospace')||tags.includes('aircraft')||tags.includes('air force');
    }else if(curFilter==='global'){
      matchesTopic=tags.includes('global')||tags.includes('us')||tags.includes('uk')||tags.includes('nato');
    }
    const matchesSearch=!query||text.includes(query);
    const visible=matchesTopic&&matchesSearch;
    c.style.display=visible?'':'none';
    if(visible)shown++;
  });
  if(noRes)noRes.style.display=(shown===0)?'block':'none';
}

filterBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    curFilter=btn.getAttribute('data-filter')||'all';
    runFilters();
  });
});
if(q)q.addEventListener('input',runFilters);
</script>`}));
for(const p of allPosts.filter(p=>!p.draft)){
  const u=abs(`/posts/${p.slug}/`),q=encodeURIComponent;
  const g=cfg.giscus&&cfg.giscus.repoId?`<script src="https://giscus.app/client.js" data-repo="${cfg.giscus.repo}" data-repo-id="${cfg.giscus.repoId}" data-category="${cfg.giscus.category}" data-category-id="${cfg.giscus.categoryId}" data-mapping="pathname" data-theme="dark" crossorigin="anonymous" async></script>`:'';
  const ld=`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,description:p.desc,datePublished:p.date,author:{'@type':'Person',name:cfg.author},image:abs(p.image),mainEntityOfPage:u})}</script>`;
  const schedNotice=p.scheduled?`<div style="background:#2a2310;border:1px solid #b9a44c;color:#f0c642;padding:0.75rem 1rem;border-radius:6px;margin:1rem 0 1.5rem">📅 <strong>Author Preview:</strong> This post is scheduled to publish on <strong>${fmt(p.date)}</strong>. It is not indexed or listed on the public homepage yet.</div>`:'';
  out(`posts/${p.slug}/index.html`,page({title:p.title,desc:p.desc,path:`/posts/${p.slug}/`,image:p.image,type:'article',ld,
    body:`<article>${schedNotice}<h1>${esc(p.title)}</h1><small>${esc(cfg.author)} · ${fmt(p.date)} · ${p.mins} min read</small><div class="tags">${tagLinks(p)}</div>${p.own?`<p><img src="${p.image}" alt="${esc(p.title)}"></p>`:''}${p.html}
<div class="share"><strong>Share:</strong> <a href="https://www.linkedin.com/sharing/share-offsite/?url=${q(u)}">LinkedIn</a><a href="https://wa.me/?text=${q(p.title+' '+u)}">WhatsApp</a><a href="https://twitter.com/intent/tweet?text=${q(p.title)}&url=${q(u)}">X</a></div>${g}</article>`}));
}
const tags=[...new Set(posts.flatMap(p=>p.tags))];
for(const t of tags)out(`tags/${slug(t)}/index.html`,page({title:`#${t}`,desc:`Posts tagged ${t} on ${cfg.name}`,path:`/tags/${slug(t)}/`,image:cfg.defaultImage,
  body:`<h1>#${esc(t)}</h1>${posts.filter(p=>p.tags.includes(t)).map(card).join('')}`}));
const authorImg = cfg.authorImage || '/images/default.png';
out('author/index.html', page({
  title: `About the Author — ${cfg.author}`,
  desc: `Meet ${cfg.author}, civilian writer, IT support engineer and founder of Vanguard Brief.`,
  path: '/author/',
  image: authorImg,
  body: `<article>
<div class="card" style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;margin:1rem 0">
  <img src="${authorImg}" alt="${esc(cfg.author)}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:2px solid var(--acc);margin:0;flex-shrink:0">
  <div>
    <h1 style="margin:0 0 .3rem;font-size:1.8rem">${esc(cfg.author)}</h1>
    <p style="color:var(--mute);margin:0 0 .8rem">Civilian Writer &amp; IT Support Engineer · Founder of Vanguard Brief</p>
    <div class="share" style="margin:0">
      ${cfg.email ? `<a href="mailto:${esc(cfg.email)}">✉ Email</a>` : ''}
      ${cfg.linkedin ? `<a href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
    </div>
  </div>
</div>
<h2>A Note from the Author</h2>
<p>Welcome to <strong>Vanguard Brief</strong>. I started this publication because defence and aerospace topics are often overshadowed by heavy military jargon, unverified rumors, and dramatic headlines. Many curious readers, students, and aviation enthusiasts want to genuinely understand how modern defence systems function, how aerospace technology is engineered, and how armed forces operate globally — without having to decode military acronyms or sift through sensationalism.</p>
<p>By day, I work as an IT support engineer. <strong>I am a civilian writer and independent researcher</strong>, with no employment, affiliation, or official connection to the armed forces, Ministry of Defence, or any defence contractor. This blog is my personal space to study, digest, and explain defence, aerospace, and aviation topics in plain, accessible language using open sources only.</p>
<p><img src="/images/author-full.jpg" alt="Anush Varma with the 155mm/52Cal Mounted Gun System" style="max-height:520px;object-fit:cover;width:auto;margin:1.5rem auto;border-radius:8px;border:1px solid var(--line)"></p>
<small style="display:block;text-align:center;color:var(--mute);margin-top:-0.8rem;margin-bottom:1.5rem">At a defence exhibition with a 155mm/52 Calibre Mounted Gun System (MGS)</small>
<h2>Strict Editorial Standards</h2>
<ul>
  <li><strong>100% Open-Source Intelligence (OSINT):</strong> Every post relies exclusively on publicly verifiable information — official government releases, PIB announcements, parliamentary committee reports, think-tank papers, and reputable journalism.</li>
  <li><strong>Zero Classified or Operational Data:</strong> I do not publish confidential information, tactical positions, troop deployments, or sensitive operational details.</li>
  <li><strong>Calm, Objective &amp; Neutral:</strong> No hyperbole, no political bias, and no cheerleading. Facts are stated plainly, and disputed numbers are clearly identified as estimates.</li>
  <li><strong>Accountability:</strong> Sources are always credited, and factual corrections from readers are actively welcomed.</li>
</ul>
<h2>Topics Covered</h2>
<div class="tbl"><table>
  <tr><th>Focus Area</th><th>What is covered</th></tr>
  <tr><td><strong>Military &amp; Defence</strong></td><td>Structure, doctrines, warships, submarines, armor, and ground systems explained simply.</td></tr>
  <tr><td><strong>Aviation &amp; Aerospace</strong></td><td>Fighter aircraft, commercial airliners, jet engines, avionics, radar, and stealth technology.</td></tr>
  <tr><td><strong>Global Defence &amp; Strategy</strong></td><td>Comparative analysis of international armed forces, allied systems (Quad, NATO), and technological balance.</td></tr>
</table></div>
<h2>Get in Touch &amp; Suggest Topics</h2>
<p>I follow a regular 2-week publishing schedule. If there is a defence system, battle history, or unit you want explained in simple words, or if you spot an error that needs correction, feel free to reach out:</p>
<p>✉ <strong>Email:</strong> <a href="mailto:${esc(cfg.email || '')}">${esc(cfg.email || '')}</a><br>
💼 <strong>LinkedIn:</strong> <a href="${esc(cfg.linkedin || '')}" target="_blank" rel="noopener">${esc(cfg.author)} on LinkedIn</a></p>
</article>`
}));
const totalPosts=allPosts.length;
const livePosts=allPosts.filter(p=>!p.draft&&!p.scheduled);
const schedPosts=allPosts.filter(p=>p.scheduled);
const draftPosts=allPosts.filter(p=>p.draft);
const aviationPosts=allPosts.filter(p=>p.tags.some(t=>/aviation|aerospace|aircraft|air force/i.test(t)));
const militaryPosts=allPosts.filter(p=>p.tags.some(t=>/military|defence|navy|army|special forces/i.test(t)));

out('admin/index.html',page({
  title:'Admin & Post Scheduler Portal',
  desc:'Private editorial and scheduling dashboard for Vanguard Brief.',
  path:'/admin/',
  image:cfg.defaultImage,
  body:`
  <div id="auth-lock">
    <div class="card" style="text-align:center;max-width:440px;margin:3.5rem auto;padding:2.2rem;border-color:var(--acc)">
      <div style="font-size:2.4rem;margin-bottom:.5rem">🛡️</div>
      <h2 style="margin:0 0 .4rem">Vanguard Brief Admin</h2>
      <p style="color:var(--mute);font-size:.92rem;margin-bottom:1.5rem">Private author dashboard. Enter your PIN to manage the post scheduler and draft queue.</p>
      <input type="password" id="pin-input" placeholder="Enter Admin PIN" style="width:100%;padding:.85rem;margin-bottom:1rem;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--text);font-size:1.15rem;text-align:center;outline:none">
      <button onclick="checkAdminPin()" style="width:100%;padding:.85rem;background:var(--acc);color:#0d110e;font-weight:700;font-size:1rem;border:none;border-radius:8px;cursor:pointer">Unlock Dashboard</button>
      <p id="pin-err" style="color:#e53e3e;font-size:.88rem;display:none;margin-top:.85rem">Incorrect PIN. Please try again.</p>
    </div>
  </div>

  <div id="admin-content" style="display:none">
    <article>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;padding-bottom:.75rem;border-bottom:1px solid var(--line)">
        <div>
          <h1 style="margin:0;font-size:1.85rem">🛡️ Author &amp; Admin Dashboard</h1>
          <p style="color:var(--mute);margin:.2rem 0 0;font-size:.9rem">Editorial queue, publication schedule, and topic management.</p>
        </div>
        <button onclick="logoutAdmin()" style="background:var(--card);border:1px solid var(--line);color:var(--mute);padding:.45rem .95rem;border-radius:6px;cursor:pointer;font-size:.85rem;font-weight:600">🔒 Lock &amp; Log Out</button>
      </div>

      <!-- Overview Stats Grid -->
      <div class="admin-stats-grid">
        <div class="admin-stat-card"><div class="admin-stat-num">${totalPosts}</div><div class="admin-stat-lbl">Total Posts</div></div>
        <div class="admin-stat-card"><div class="admin-stat-num" style="color:#68d391">${livePosts.length}</div><div class="admin-stat-lbl">Live on Site</div></div>
        <div class="admin-stat-card"><div class="admin-stat-num" style="color:#f0c642">${schedPosts.length}</div><div class="admin-stat-lbl">Scheduled</div></div>
        <div class="admin-stat-card"><div class="admin-stat-num">${aviationPosts.length}</div><div class="admin-stat-lbl">Aviation &amp; Aero</div></div>
        <div class="admin-stat-card"><div class="admin-stat-num">${militaryPosts.length}</div><div class="admin-stat-lbl">Military &amp; Def</div></div>
      </div>

      <!-- Interactive Subtopic and Status Filter Controls -->
      <div class="admin-filter-bar">
        <div class="admin-filter-row">
          <span class="admin-filter-label">Status:</span>
          <button class="admin-filter-btn active" data-status-filter="all">All (${totalPosts})</button>
          <button class="admin-filter-btn" data-status-filter="live">🟢 Live (${livePosts.length})</button>
          <button class="admin-filter-btn" data-status-filter="scheduled">⏳ Scheduled (${schedPosts.length})</button>
          ${draftPosts.length ? `<button class="admin-filter-btn" data-status-filter="draft">📝 Drafts (${draftPosts.length})</button>` : ''}
        </div>
        <div class="admin-filter-row">
          <span class="admin-filter-label">Subtopic:</span>
          <button class="admin-filter-btn active" data-topic-filter="all">All Subtopics</button>
          <button class="admin-filter-btn" data-topic-filter="military">⚔️ Military &amp; Defence</button>
          <button class="admin-filter-btn" data-topic-filter="aviation">✈️ Aviation &amp; Aerospace</button>
          <button class="admin-filter-btn" data-topic-filter="global">🌐 Global Defence</button>
        </div>
        <div style="margin-top:.25rem">
          <input type="search" id="admin-search" placeholder="🔍 Search posts by title, tag, or filename..." style="width:100%;padding:.65rem .85rem;background:var(--bg);border:1px solid var(--line);border-radius:6px;color:var(--text);font-size:.88rem;outline:none">
        </div>
      </div>

      <!-- Scheduler Table -->
      <div class="tbl"><table id="admin-posts-table">
        <thead><tr><th>Status</th><th>Post Title &amp; Category</th><th>Target Date</th><th>Read</th><th>Action</th></tr></thead>
        <tbody>
        ${allPosts.map(p=>{
          const daysLeft=Math.ceil((new Date(p.date)-new Date(today))/(1000*60*60*24));
          let statusKey='live', badgeHtml='';
          if(p.draft){statusKey='draft'; badgeHtml='<span class="badge" style="background:#333;color:#bbb">Draft</span>';}
          else if(p.scheduled){statusKey='scheduled'; badgeHtml=`<span class="badge" style="background:#554415;color:#f0c642;border:1px solid #b9a44c">Scheduled (${daysLeft}d left)</span>`;}
          else{statusKey='live'; badgeHtml='<span class="badge" style="background:#1c3d23;color:#68d391">Live</span>';}
          
          const tagBadges=p.tags.map(t=>`<span class="badge" style="background:#1a2217;border:1px solid var(--line);color:var(--mute);margin:0.2rem 0.2rem 0 0;font-size:0.7rem">#${esc(t)}</span>`).join('');
          return `<tr class="admin-post-row" data-status="${statusKey}" data-tags="${esc(p.tags.join(',').toLowerCase())}">
            <td>${badgeHtml}</td>
            <td><strong>${esc(p.title)}</strong><br><small style="color:var(--mute)">posts/${esc(p.file)}</small><div style="margin-top:0.35rem">${tagBadges}</div></td>
            <td><code>${p.date}</code></td>
            <td>${p.mins} min</td>
            <td><a href="/posts/${p.slug}/" style="font-weight:600">Preview →</a></td>
          </tr>`;
        }).join('')}
        </tbody>
      </table></div>
      <div id="admin-no-match" style="display:none;color:var(--mute);text-align:center;padding:2rem 0">No posts match the selected filter.</div>

      <!-- Automation Info Card -->
      <div class="card" style="border:1px solid var(--line);background:#131912;margin:2rem 0 0">
        <h3 style="margin:0 0 .5rem;color:var(--acc);font-size:1.05rem">How the Automated Scheduler Works</h3>
        <p style="margin:0;font-size:.9rem;line-height:1.6;color:var(--mute)">
          • <strong>To schedule a post:</strong> Set <code>date: YYYY-MM-DD</code> in the top frontmatter of any post in <code>posts/</code>.<br>
          • <strong>Protection:</strong> Posts with future dates are automatically hidden from regular visitors on the public homepage.<br>
          • <strong>Automatic Daily Release:</strong> GitHub Actions runs every midnight UTC, detects when the target date arrives, and automatically publishes the post live to your visitors.
        </p>
      </div>
    </article>
  </div>

  <script>
  let activeStatus='all', activeTopic='all';
  const tableRows=document.querySelectorAll('#admin-posts-table tbody tr.admin-post-row');
  const searchInput=document.getElementById('admin-search');
  const noMatch=document.getElementById('admin-no-match');

  function filterAdminTable(){
    const query=(searchInput?searchInput.value:'').toLowerCase().trim();
    let shown=0;
    tableRows.forEach(row=>{
      const status=row.getAttribute('data-status');
      const tags=row.getAttribute('data-tags')||'';
      const text=row.innerText.toLowerCase();

      let matchStatus = (activeStatus==='all') || (status===activeStatus);
      let matchTopic = (activeTopic==='all');
      if(activeTopic==='military') matchTopic = tags.includes('military')||tags.includes('defence')||tags.includes('navy');
      if(activeTopic==='aviation') matchTopic = tags.includes('aviation')||tags.includes('aerospace')||tags.includes('aircraft');
      if(activeTopic==='global') matchTopic = tags.includes('global')||tags.includes('ranks');

      let matchSearch = !query || text.includes(query);
      let visible = matchStatus && matchTopic && matchSearch;
      row.style.display = visible ? '' : 'none';
      if(visible) shown++;
    });
    if(noMatch) noMatch.style.display = (shown===0)?'block':'none';
  }

  document.querySelectorAll('[data-status-filter]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-status-filter]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.getAttribute('data-status-filter');
      filterAdminTable();
    });
  });

  document.querySelectorAll('[data-topic-filter]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-topic-filter]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      activeTopic = btn.getAttribute('data-topic-filter');
      filterAdminTable();
    });
  });

  if(searchInput) searchInput.addEventListener('input', filterAdminTable);

  function checkAdminPin(){
    const val=document.getElementById('pin-input').value;
    if(val==='${pin}'){
      document.getElementById('auth-lock').style.display='none';
      document.getElementById('admin-content').style.display='block';
      localStorage.setItem('vg_auth','1');
    }else{
      document.getElementById('pin-err').style.display='block';
    }
  }

  function logoutAdmin(){
    localStorage.removeItem('vg_auth');
    location.reload();
  }

  document.getElementById('pin-input')?.addEventListener('keydown',e=>{if(e.key==='Enter')checkAdminPin();});
  if(localStorage.getItem('vg_auth')==='1'){
    const lock=document.getElementById('auth-lock');
    const content=document.getElementById('admin-content');
    if(lock) lock.style.display='none';
    if(content) content.style.display='block';
  }
  </script>`
}));

// Forward /scheduler/ to /admin/ seamlessly
out('scheduler/index.html',`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${base}/admin/"><script>location.replace('${base}/admin/');</script></head><body><p>Redirecting to <a href="${base}/admin/">Admin Portal</a>...</p></body></html>`);
out('404.html',`<!doctype html><html><head><meta charset="utf-8"><title>Redirecting to ${esc(cfg.name)}</title><meta http-equiv="refresh" content="0; url=${base}/"><script>location.replace('${base}/');</script></head><body><p>Redirecting to <a href="${base}/">${esc(cfg.name)}</a>...</p></body></html>`);
out('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">`.replace('sitemap.org','sitemaps.org')+
  ['/','/author/',...posts.map(p=>`/posts/${p.slug}/`),...tags.map(t=>`/tags/${slug(t)}/`)].map(u=>`<url><loc>${abs(u)}</loc></url>`).join('')+'</urlset>');
out('robots.txt',`User-agent: *\nDisallow: /admin/\nDisallow: /scheduler/\nAllow: /\nSitemap: ${abs('/sitemap.xml')}\n`);
console.log(`Built ${posts.length} post(s) into dist/`);
if(DEV)http.createServer((q,r)=>{let f=path.join('dist',decodeURIComponent(q.url.split('?')[0]));
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  fs.readFile(f,(e,d)=>{r.writeHead(e?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.xml':'application/xml','.jpg':'image/jpeg','.png':'image/png'}[path.extname(f)]||'application/octet-stream'});r.end(e?'Not found':d);});
}).listen(3000,()=>console.log('Preview at http://localhost:3000  (Ctrl+C to stop)'));
