(function () {
 "use strict";
 const routes = {
   "Old Korvosa": ["North Point"],
   "North Point": ["Old Korvosa","The Heights","Midland"],
   "The Heights": ["North Point","Midland","Southern Korvosa"],
   "Midland": ["North Point","The Heights","Southern Korvosa","East Shore"],
   "Southern Korvosa": ["The Heights","Midland"],
   "East Shore": ["Midland"]
 };
 function district(r) {
   const m = r.where.match(/^(Old Korvosa|North Point|The Heights|Midland|East Shore|Southern Korvosa|Außenbereich|Jeggare River)(?=;)/);
   return m ? m[1] : "";
 }
 function path(a,b) {
   if(a===b) return [a];
   const q=[[a]], visited=new Set([a]);
   while(q.length) {
     const p=q.shift();
     for(const next of (routes[p[p.length-1]]||[])) {
       if(visited.has(next)) continue;
       const np=[...p,next];
       if(next===b) return np;
       visited.add(next); q.push(np);
     }
   }
   return null;
 }
 function connection(a,b) {
   const k=[a,b].sort().join("|");
   if(k==="North Point|Old Korvosa") return "Brücke über die Narrows";
   if(k==="East Shore|Midland") return "High Bridge";
   return "Stadtstraßen";
 }
 function escape(s) {
   return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
 }
 function init() {
   const host=document.getElementById("route-finder");
   if(!host||host.dataset.ready) return;
   const loc=(window.COTCT_QUICK_INDEX||[]).filter(x=>x.type==="Ort").sort((a,b)=>a.title.localeCompare(b.title,"de"));
   if(!loc.length){host.textContent="Ortsliste nicht geladen.";return;}
   const choices=loc.map(v=>'<option value="'+escape(v.id)+'">'+escape(v.title)+" ("+escape(v.id)+")</option>").join("");
   host.innerHTML='<div class="route-fields"><label>Von<select id="route-from">'+choices+'</select></label><label>Nach<select id="route-to">'+choices+'</select></label></div><p id="route-answer" aria-live="polite"></p><p class="route-notice">Kartenmarker, keine metrische Navigation. Quelle: Anniversary Edition, S. 400–411.</p>';
   host.dataset.ready="1";
   const from=host.querySelector("#route-from"), to=host.querySelector("#route-to"), answer=host.querySelector("#route-answer");
   from.value="G10";to.value="S3";
   function render() {
      const A=loc.find(v=>v.id===from.value),B=loc.find(v=>v.id===to.value);
      if(!A||!B)return;
      const da=district(A), db=district(B), p=path(da,db);
      let msg="<strong>"+escape(A.title)+" ("+escape(A.id)+")</strong> → <strong>"+escape(B.title)+" ("+escape(B.id)+")</strong>. ";
      if(["H17","H18"].includes(A.id)||["H17","H18"].includes(B.id)){
        msg+="<b>Quellenkonflikt:</b> Bei H17/H18 widersprechen sich Stadtkarte und Gazetteer. Die Position auf der Originalkarte prüfen.";
      }else if(!p){
        msg+="Für Flusswracks, Inseln und Außenbereiche ist keine allgemeine Landroute belegt. Zugang gegebenenfalls per Boot oder gesonderte Straßen prüfen.";
      }else if(p.length===1){
        msg+="Beide Orte liegen in <b>"+escape(da)+"</b>. Den Straßenabschnitt auf der Originalkarte anhand der Marker prüfen.";
      }else{
        msg+="Orientierungsfolge: <b>"+p.map(escape).join(" → ")+"</b>. Übergänge: "+p.slice(0,-1).map((x,i)=>escape(x)+" → "+escape(p[i+1])+": "+connection(x,p[i+1])).join("; ")+". Genaue Straßenfolge nicht angegeben.";
      }
      answer.innerHTML=msg+' <a href="#/pages/orte/register.md">Stadtatlas</a>.';
   }
   from.addEventListener("change",render);
   to.addEventListener("change",render);
   render();
 }
 window.COTCTRouteFinder={init};
})();