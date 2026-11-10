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
const posts=fs.readdirSync('posts').filter(f=>f.endsWith('.md')).map(f=>{
  const raw=fs.readFileSync('posts/'+f,'utf8').replace(/\r\n/g,'\n');
  const m=raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!m)throw new Error(f+': missing front matter (--- block at top)');
  const meta={};m[1].split('\n').forEach(l=>{const i=l.indexOf(':');if(i>0)meta[l.slice(0,i).trim()]=l.slice(i+1).trim();});
  return{slug:f.replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/\.md$/,''),title:meta.title||f,desc:meta.description||'',date:meta.date||f.slice(0,10),
    own:!!meta.image,image:meta.image||cfg.defaultImage,draft:meta.draft==='true',
    tags:(meta.tags||'').split(',').map(s=>s.trim()).filter(Boolean),html:md(m[2]),mins:Math.max(1,Math.round(m[2].split(/\s+/).length/200))};
}).filter(p=>!p.draft).sort((a,b)=>b.date.localeCompare(a.date));

function page({title,desc,path:p,image,type='website',body,ld=''}){
  const url=abs(p),img=image.startsWith('http')?image:abs(image);
  const full=p==='/'?cfg.name:`${title} | ${cfg.name}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:site_name" content="${esc(cfg.name)}"><meta property="og:type" content="${type}"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/style.css">${ld}</head><body>
<header><a class="logo" href="/">${esc(cfg.name)}</a><nav><a href="/">Home</a>${cfg.linkedin?`<a href="${cfg.linkedin}">LinkedIn</a>`:''}</nav></header>
<main>${body}</main><footer>© ${new Date().getFullYear()} ${esc(cfg.author)}. Based on open-source information only.</footer>
${cfg.goatcounter?`<script data-goatcounter="https://${cfg.goatcounter}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`:''}
</body></html>`.replace(/(src|href)="\/(?!\/)/g,`$1="${base}/`);
}
const tagLinks=p=>p.tags.map(t=>`<a href="/tags/${slug(t)}/">#${esc(t.replace(/\s+/g,''))}</a>`).join('');
const card=p=>`<div class="card">${p.own?`<img src="${p.image}" alt="" loading="lazy">`:''}<h2><a href="/posts/${p.slug}/">${esc(p.title)}</a></h2><p>${esc(p.desc)}</p><small>${fmt(p.date)} · ${p.mins} min read</small><div class="tags">${tagLinks(p)}</div></div>`;
const out=(p,c)=>{const f=path.join('dist',p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,c);};

fs.rmSync('dist',{recursive:true,force:true});
if(fs.existsSync('static'))fs.cpSync('static','dist',{recursive:true});
out('index.html',page({title:cfg.name,desc:cfg.tagline,path:'/',image:cfg.defaultImage,
  body:`<div class="hero"><h1>${esc(cfg.name)}</h1><p>${esc(cfg.tagline)}</p></div>${posts.map(card).join('')}`}));
for(const p of posts){
  const u=abs(`/posts/${p.slug}/`),q=encodeURIComponent;
  const g=cfg.giscus&&cfg.giscus.repoId?`<script src="https://giscus.app/client.js" data-repo="${cfg.giscus.repo}" data-repo-id="${cfg.giscus.repoId}" data-category="${cfg.giscus.category}" data-category-id="${cfg.giscus.categoryId}" data-mapping="pathname" data-theme="dark" crossorigin="anonymous" async></script>`:'';
  const ld=`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,description:p.desc,datePublished:p.date,author:{'@type':'Person',name:cfg.author},image:abs(p.image),mainEntityOfPage:u})}</script>`;
  out(`posts/${p.slug}/index.html`,page({title:p.title,desc:p.desc,path:`/posts/${p.slug}/`,image:p.image,type:'article',ld,
    body:`<article><h1>${esc(p.title)}</h1><small>${esc(cfg.author)} · ${fmt(p.date)} · ${p.mins} min read</small><div class="tags">${tagLinks(p)}</div>${p.own?`<p><img src="${p.image}" alt="${esc(p.title)}"></p>`:''}${p.html}
<div class="share"><strong>Share:</strong> <a href="https://www.linkedin.com/sharing/share-offsite/?url=${q(u)}">LinkedIn</a><a href="https://wa.me/?text=${q(p.title+' '+u)}">WhatsApp</a><a href="https://twitter.com/intent/tweet?text=${q(p.title)}&url=${q(u)}">X</a></div>${g}</article>`}));
}
const tags=[...new Set(posts.flatMap(p=>p.tags))];
for(const t of tags)out(`tags/${slug(t)}/index.html`,page({title:`#${t}`,desc:`Posts tagged ${t} on ${cfg.name}`,path:`/tags/${slug(t)}/`,image:cfg.defaultImage,
  body:`<h1>#${esc(t)}</h1>${posts.filter(p=>p.tags.includes(t)).map(card).join('')}`}));
out('404.html',page({title:'Page not found',desc:'Not found',path:'/404.html',image:cfg.defaultImage,body:'<h1>Page not found</h1><p><a href="/">Back to home</a></p>'}));
out('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">`.replace('sitemap.org','sitemaps.org')+
  ['/',...posts.map(p=>`/posts/${p.slug}/`),...tags.map(t=>`/tags/${slug(t)}/`)].map(u=>`<url><loc>${abs(u)}</loc></url>`).join('')+'</urlset>');
out('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${abs('/sitemap.xml')}\n`);
console.log(`Built ${posts.length} post(s) into dist/`);
if(DEV)http.createServer((q,r)=>{let f=path.join('dist',decodeURIComponent(q.url.split('?')[0]));
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  fs.readFile(f,(e,d)=>{r.writeHead(e?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.xml':'application/xml','.jpg':'image/jpeg','.png':'image/png'}[path.extname(f)]||'application/octet-stream'});r.end(e?'Not found':d);});
}).listen(3000,()=>console.log('Preview at http://localhost:3000  (Ctrl+C to stop)'));
