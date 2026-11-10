(function () {
"use strict";
const data = window.COTCT_CHRONOLOGY || [];
const phases = [
 ["geschichte","Historische Vorgeschichte"],["vorgeschichte","Unmittelbare Vorgeschichte"],
 ["kap1","Kap. 1 · Edge of Anarchy"],["kap2","Kap. 2 · Seven Days to the Grave"],
 ["kap3","Kap. 3 · Escape from Old Korvosa"],["kap4","Kap. 4 · A History of Ashes"],
 ["kap5","Kap. 5 · Skeletons of Scarwall"],["kap6","Kap. 6 · Crown of Fangs"],
 ["nachspiel","Nachspiel"]
];
const threads = {alle:"Alle Handlungsstränge",ursprung:"Thassilon/Sorshen",kazavon:"Kazavon & Scarwall",shoanti:"Shoanti",stadt:"Korvosa & Institutionen",thron:"Ileosa & Krone",seuche:"Blood Veil",gruppe:"Spielergruppe",unterwelt:"Unterwelt/Red Mantis"};
const modes={alle:"Alle Zeittypen",jahr:"Jahresanker",zeitraum:"Zeiträume",ungefähr:"Ungefähre Zeit",relativ:"Relative Ereignisse",flexibel:"Verschiebbare Events",dauer:"Dauervorgaben",frist:"Fristen"};
const esc = (s) => String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const norm = (s) => String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function init() {
  const host=document.getElementById("cotct-timeline");
  if(!host||host.dataset.active||!data.length) return;
  host.dataset.active="1";
  const sel=(items,name)=>'<label>'+name+'<select class="tl-select">'+items.map(([id,label])=>'<option value="'+esc(id)+'">'+esc(label)+'</option>').join("")+'</select></label>';
  host.innerHTML =
    '<div class="tl-tools">'+sel([["alle","Alle Epochen"],...phases],"Epoche / Kapitel")+
    sel(Object.entries(threads),"Handlungsstrang")+sel(Object.entries(modes),"Zeittyp")+
    '<label class="tl-search">Freitextsuche<input id="tl-text" placeholder="z. B. Quarantäne, 4043, Scarwall …" type="search" /></label></div>'+
    '<div class="tl-bar" aria-label="Phasen des Abenteuerpfads">'+phases.filter(x=>x[0].startsWith("kap")).map(p=>'<button type="button" data-phase="'+esc(p[0])+'">'+esc(p[0].replace("kap","Kapitel "))+'</button>').join("")+'</div>'+
    '<div class="tl-summary" aria-live="polite"></div><div class="tl-events"></div>';
  const inputs=host.querySelectorAll("select"),search=host.querySelector("#tl-text"),out=host.querySelector(".tl-events"),summary=host.querySelector(".tl-summary");
  let phase="alle",thread="alle",mode="alle",query="";
  function render() {
    const matches=data.filter(e => (phase==="alle"||e.phase===phase)&&(thread==="alle"||e.thread===thread)&&(mode==="alle"||e.mode===mode)&&(!query||norm([e.title,e.description,e.when,e.source,e.check,e.id].join(" ")).includes(norm(query))));
    const dates=matches.filter(x=>x.mode==="frist"||x.mode==="dauer").length;
    summary.textContent=matches.length+" von "+data.length+" Stationen · "+dates+" harte Fristen/Dauern in dieser Ansicht · Zeitabstände nicht maßstabsgetreu";
    const byPhase=new Map();
    for(const e of matches) { if(!byPhase.has(e.phase))byPhase.set(e.phase,[]);byPhase.get(e.phase).push(e); }
    out.innerHTML=phases.filter(p=>byPhase.has(p[0])).map(([key,title])=>'<section class="tl-section" id="tl-'+esc(key)+'"><h3>'+esc(title)+'</h3><ol class="tl-list">'+byPhase.get(key).map(e=>
      '<li class="tl-event tl-mode-'+esc(e.mode)+'"><article>'+
      '<div class="tl-event-top"><span class="tl-when">'+esc(e.when)+'</span><span class="tl-tag">'+esc(e.mode)+'</span>'+
      (e.campaign==="KANON"?'<span class="tl-tag tl-canon">KANON</span>':'')+'</div>'+
      '<strong class="tl-event-title">'+esc(e.title)+'</strong><p>'+esc(e.description)+'</p>'+
      '<div class="tl-event-meta"><span>'+esc(threads[e.thread]||e.thread)+'</span><span>Quelle: '+esc(e.source)+'</span></div>'+
      (e.check?'<div class="tl-check"><b>Zeitprüfung:</b> '+esc(e.check)+'</div>':'')+
      '</article></li>').join("")+'</ol></section>').join("") || '<div class="tl-none">Keine Ereignisse mit diesen Filtern. Filter zurücksetzen.</div>';
    host.querySelectorAll(".tl-bar button").forEach(b=>b.classList.toggle("is-active",b.dataset.phase===phase));
  }
  inputs[0].addEventListener("change",e=>{phase=e.target.value;render();});
  inputs[1].addEventListener("change",e=>{thread=e.target.value;render();});
  inputs[2].addEventListener("change",e=>{mode=e.target.value;render();});
  search.addEventListener("input",e=>{query=e.target.value;render();});
  host.querySelectorAll(".tl-bar button").forEach(b=>b.addEventListener("click",()=>{phase=phase===b.dataset.phase?"alle":b.dataset.phase;inputs[0].value=phase;render();host.scrollIntoView({behavior:"auto",block:"start"});}));
  render();
}
function initTravel() {
  const host=document.getElementById("cotct-travel");
  if(!host||host.dataset.active)return;
  host.dataset.active="1";
  host.innerHTML='<div class="travel-fields">'+
    '<label>Reisestrecke<select id="td-route"><option value="160">Korvosa → Sunken Queen · ca. 160 Meilen</option><option value="300">Flameford → Scarwall · ca. 300 Meilen</option><option value="custom">Eigene Distanz</option></select></label>'+
    '<label>Meilen<input type="number" id="td-distance" value="160" min="1" max="10000" step="1" /></label>'+
    '<label>Bewegung (Fuß)<select id="td-speed"><option value="15">15 Fuß</option><option value="20">20 Fuß</option><option value="30" selected>30 Fuß</option><option value="40">40 Fuß</option></select></label>'+
    '<label>Gelände<select id="td-terrain"><option value="1">Guter Weg ×1</option><option value=".75">Sumpfpfad ×¾</option><option value=".5" selected>Wegloser Sumpf ×½</option><option value=".25">Dichtes Gelände ×¼</option></select></label>'+
    '<label>Verbleibende Frist (Tage)<input id="td-limit" type="number" value="10" min="1" max="999" step="1" /></label>'+
    '</div><div class="travel-result" aria-live="polite"></div>';
  const route=host.querySelector("#td-route"),distance=host.querySelector("#td-distance"),speed=host.querySelector("#td-speed"),terrain=host.querySelector("#td-terrain"),limit=host.querySelector("#td-limit"),out=host.querySelector(".travel-result");
  route.addEventListener("change",()=>{if(route.value!=="custom")distance.value=route.value;calc();});
  distance.addEventListener("input",()=>{if(route.value!=="custom"&&Number(distance.value)!==Number(route.value))route.value="custom";calc();});
  [speed,terrain,limit].forEach(x=>x.addEventListener("change",calc));
  function calc(){
    const miles=Number(distance.value),f=Number(terrain.value),v=Number(speed.value),daysLimit=Number(limit.value);
    if(!Number.isFinite(miles)||miles<=0||!Number.isFinite(daysLimit)||daysLimit<=0){out.textContent="Bitte gültige positive Werte eingeben.";return;}
    const milePerDay={15:12,20:16,30:24,40:32}[v]*f;
    const raw=miles/milePerDay,days=Math.ceil(raw),rest=daysLimit-days;
    const cls=rest>=0?"travel-ok":"travel-warn";
    out.innerHTML='<div class="travel-calculation '+cls+'"><strong>'+days+' Reisetage</strong><span>'+miles+' Meilen ÷ '+milePerDay+' Meilen/Tag = '+raw.toFixed(1)+' Tage, auf ganze Reisetage aufgerundet.</span><span>'+(rest>=0?rest+' Tage verbleiben gegenüber der angesetzten Frist.':'Frist um mindestens '+Math.abs(rest)+' Tage überschritten, ohne Kämpfe, Umwege oder zusätzliche Ruhe.')+'</span></div>'+
      '<p class="travel-caveat">**Hinweis:** Die Buchentfernung ist nur ungefähr. Keine Reisekarte und kein Zaubereffekt wurden simuliert. Die 10 Tage gelten nicht vor der Schlussphase von Kapitel 6.</p>';
  }
  calc();
}
window.COTCTTimeline={init,initTravel};
})();