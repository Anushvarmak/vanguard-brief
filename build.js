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
<link rel="preload" href="/style.css" as="style">
<link rel="stylesheet" href="/style.css">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="shortcut icon" href="/favicon.svg">${ld}</head><body>
<header class="site-header"><div class="header-inner">
  <div class="brand-area"><a class="logo" href="/" aria-label="Vanguard Brief Home">🛡️ ${esc(cfg.name)}</a><span class="brand-badge">CIVILIAN OSINT</span></div>
  <nav class="nav-bar" aria-label="Main Navigation">
    <a class="nav-link ${p==='/'?'active':''}" href="/">Home</a>
    <a class="nav-link ${p==='/author/'?'active':''}" href="/author/">Author</a>
    ${cfg.linkedin?`<a class="nav-link nav-linkedin" href="${cfg.linkedin}" target="_blank" rel="noopener" aria-label="Anush Varma on LinkedIn">LinkedIn ↗</a>`:''}
  </nav>
</div></header>
<main>${body}</main>
<footer>
  <div>© ${new Date().getFullYear()} ${esc(cfg.author)}. Based on open-source information only.</div>
</footer>
${cfg.goatcounter?`<script data-goatcounter="https://${cfg.goatcounter}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`:''}
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

out('404.html',`<!doctype html><html><head><meta charset="utf-8"><title>Redirecting to ${esc(cfg.name)}</title><meta http-equiv="refresh" content="0; url=${base}/"><script>location.replace('${base}/');</script></head><body><p>Redirecting to <a href="${base}/">${esc(cfg.name)}</a>...</p></body></html>`);
out('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">`.replace('sitemap.org','sitemaps.org')+
  ['/','/author/',...posts.map(p=>`/posts/${p.slug}/`),...tags.map(t=>`/tags/${slug(t)}/`)].map(u=>`<url><loc>${abs(u)}</loc></url>`).join('')+'</urlset>');
out('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${abs('/sitemap.xml')}\n`);
console.log(`Built ${posts.length} post(s) into dist/`);
if(DEV)http.createServer((q,r)=>{let f=path.join('dist',decodeURIComponent(q.url.split('?')[0]));
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  fs.readFile(f,(e,d)=>{r.writeHead(e?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.xml':'application/xml','.jpg':'image/jpeg','.png':'image/png'}[path.extname(f)]||'application/octet-stream'});r.end(e?'Not found':d);});
}).listen(3000,()=>console.log('Preview at http://localhost:3000  (Ctrl+C to stop)'));
