(function () {
  "use strict";
  const data = Array.isArray(window.COTCT_QUICK_INDEX) ? window.COTCT_QUICK_INDEX : [];
  const root = window.location.pathname.replace(/[^/]*$/, "");
  const toggle = document.createElement("button");
  toggle.id = "quick-open";
  toggle.type = "button";
  toggle.title = "Schnellsuche öffnen (Taste /)";
  toggle.setAttribute("aria-label", "Schnellsuche öffnen");
  toggle.textContent = "⌕ Schnellsuche  /";
  document.body.appendChild(toggle);
  const overlay = document.createElement("div");
  overlay.id = "quick-overlay";
  overlay.hidden = true;
  overlay.innerHTML = '<section id="quick-panel" role="dialog" aria-modal="true" aria-label="Wiki-Schnellsuche"><div class="quick-head"><span>⚡ Korvosa · Sofort finden</span><button id="quick-close" type="button" aria-label="Schließen">Esc ×</button></div><input id="quick-input" type="search" autocomplete="off" placeholder="z. B. Eodred Alter, Heilung, Eel’s End, R8 …" aria-label="NPC, Ort oder Fakt suchen"><div id="quick-count"></div><div id="quick-results" role="listbox"></div><footer>Enter: öffnen · ↑/↓: auswählen · Esc: schließen</footer></section>';
  document.body.appendChild(overlay);
  const field = overlay.querySelector("#quick-input");
  const results = overlay.querySelector("#quick-results");
  const count = overlay.querySelector("#quick-count");
  let matches = [];
  let active = 0;
  const normalize = (s) => String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/ß/g,"ss");
  const escape = (s) => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const score = (v, terms) => {
    const name=normalize(v.title), all=normalize([v.title,v.id,v.where,v.summary,v.keywords].join(" "));
    if (!terms.every(t=>all.includes(t))) return -1;
    return terms.reduce((s,t)=>s+(name===t?25:0)+(name.startsWith(t)?10:0)+(normalize(v.id)===t?20:0)+(name.includes(t)?6:0),0);
  };
  function render() {
    const terms = normalize(field.value).split(/\s+/).filter(Boolean);
    matches = data.map(v=>({v,s:score(v,terms)})).filter(o=>o.s>=0).sort((a,b)=>b.s-a.s||a.v.title.localeCompare(b.v.title,"de")).map(o=>o.v).slice(0,25);
    active = Math.min(active,Math.max(0,matches.length-1));
    count.textContent = terms.length ? (matches.length + " Treffer (max. 25)") : "Direktzugriff auf " + data.length + " NPCs, Orte und Werkzeuge";
    results.innerHTML = matches.map((v,i)=>'<a class="quick-result'+(i===active?' quick-active':'')+'" role="option" aria-selected="'+(i===active)+'" href="'+escape(root+"#/"+v.url)+'"><div class="quick-meta"><b>'+escape(v.title)+'</b><span>'+escape((v.id?v.id+" · ":"")+v.type)+'</span></div><p>'+escape(v.where||v.summary)+'</p>'+(v.where?'<small>'+escape(v.summary)+'</small>':'')+'</a>').join("") || '<div class="quick-empty">Keine Einträge. Andere Schreibweise oder Kartencode versuchen.</div>';
    results.querySelectorAll("a").forEach(el=>el.addEventListener("click",close));
  }
  function open() { overlay.hidden = false; field.value = ""; active=0; render(); field.focus(); }
  function close() { overlay.hidden = true; field.value=""; toggle.focus(); }
  toggle.addEventListener("click",open);
  overlay.querySelector("#quick-close").addEventListener("click",close);
  overlay.addEventListener("click",e=>{if(e.target===overlay)close();});
  field.addEventListener("input",()=>{active=0;render();});
  document.addEventListener("keydown",e=>{
    const edit = ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)||document.activeElement?.isContentEditable;
    if(e.key==="/"&&!edit&&overlay.hidden){e.preventDefault();open();return;}
    if(overlay.hidden)return;
    if(e.key==="Escape"){e.preventDefault();close();return;}
    if(e.key==="ArrowDown"){e.preventDefault();active=Math.min(active+1,matches.length-1);render();return;}
    if(e.key==="ArrowUp"){e.preventDefault();active=Math.max(active-1,0);render();return;}
    if(e.key==="Enter"&&matches[active]){e.preventDefault();window.location.href=root+"#/"+matches[active].url;close();}
  });
})();
