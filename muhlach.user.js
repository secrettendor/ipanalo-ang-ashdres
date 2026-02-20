// ==UserScript==
// @name lPANALO ANG ASHDRES
// @match https://vote-kappa-seven.vercel.app/*
// @grant none
// ==/UserScript==
(() =>{
const w=window,d=document;

// --- 1. LOG BOX ---
const logBox=d.createElement("div");
Object.assign(logBox.style,{
  position:"fixed",
  bottom:"20px",
  right:"20px",
  width:"240px",
  height:"140px",
  background:"rgba(0,0,0,0.85)",
  color:"#fff",
  fontSize:"12px",
  padding:"10px",
  zIndex:"9999",
  overflowY:"auto",
  borderRadius:"8px",
  boxShadow:"0 0 10px #000",
  textAlign:"center",
  fontWeight:"bold"
});
d.body.appendChild(logBox);

const log=(m,c="#fff")=>{
  const l=d.createElement("div");
  l.innerText=m;
  l.style.color=c;
  l.style.fontSize="14px"; // mas malaking font
  logBox.appendChild(l);
  logBox.scrollTop=logBox.scrollHeight;
}

// --- 2. HELPERS ---
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const rw=(m=100,M=300)=>Math.floor(Math.random()*(M-m+1))+m;

function keepAlive(){
  console.log("Running at",new Date().toLocaleTimeString());
  setTimeout(keepAlive,3000);
}
function fakeActivity(){
  w.dispatchEvent(new MouseEvent("mousemove",{bubbles:true}));
  w.dispatchEvent(new KeyboardEvent("keydown",{bubbles:true,key:"Shift"}));
}
setInterval(fakeActivity,1000);

async function qAll(sel,t=5000,i=100){
  const start=Date.now();
  while(true){
    const el=d.querySelectorAll(sel);
    if(el.length>0) return el;
    if(Date.now()-start>t) return null;
    await wait(i);
  }
}

// --- 3. MASTER SEQUENCES ---
const sequences=[
  {
    name:"LOTY",
    category:"LOVETEAM OF THE YEAR",
    participant:"AshDres",
    buttonIndex:3,
    backend:[
      "https://backend.choicely.com/images/Y2hvaWNlbHktZXUvaW1hZ2VzL1d4RWdMZEdVVGs1VFZ2MGxycEhK/serve/",
      "https://backend.choicely.com/images/Y2hvaWNlbHktZXUvaW1hZ2VzL3A4UWVFTGl2am5ZY1VXSmZwZGNl/serve/"
    ]
  },
  {
    name:"FOTY",
    category:"Fandom Of The Year",
    participant:"AshDres",
    buttonIndex:2,
    backend:[
      "https://backend.choicely.com/images/Y2hvaWNlbHktZXUvaW1hZ2VzL1d4RWdMZEdVVGs1VFZ2MGxycEhK/serve/",
      "https://backend.choicely.com/images/Y2hvaWNlbHktZXUvaW1hZ2VzL3A4UWVFTGl2am5ZY1VXSmZwZGNl/serve/"
    ]
  },
  {
    name:"MVOTY",
    category:"Music Video Of The Year",
    participant:"Minamahal — Andres Muhlach & Ashtine Olviga",
    buttonIndex:4, // ✅ Fixed
    backend:[
      "https://backend.choicely.com/images/Y2hvaWNlbHktZXUvaW1hZ2VzL1d4RWdMZEdVVGs1VFZ2MGxycEhK/serve/",
      "https://backend.choicely.com/images/Y2hvaWNlbHktZXUvaW1hZ2VzL2ZjN2NpckFKeG9YOFg0SmJwZVhE/serve/"
    ]
  }
];

// --- STATE MANAGEMENT ---
let currentSeqIndex = parseInt(localStorage.getItem("vp_seq_index") || "0");
if(currentSeqIndex >= sequences.length) currentSeqIndex = 0;
let currentSeq = sequences[currentSeqIndex];

log(`🚀 Simula: ${currentSeq.name} (Hakbang ${currentSeqIndex+1}/${sequences.length})`, "cyan");

// --- 4. FETCH HOOK ---
const oFetch=w.fetch;
w.fetch=async(...a)=>{
  const r=await oFetch.apply(w,a);
  const c=r.clone();
  if(a[0].includes("/vote_messages")){
    c.json().then(j=>{
      if(j.status==="Accepted"){
        // ✅ Custom success log only
        log(`${currentSeq.name} ✓ THANK YOU FOR VOTING KEEPERS (◠‿◕)`, "lightgreen");

        // Auto Reset Logic
        let nextIndex = currentSeqIndex + 1;
        if (nextIndex >= sequences.length) {
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            });
            log(`🔄 Tapos na ang sequence. Magre-reload ang website para magsimula uli...`, "orange");
            setTimeout(()=>location.reload(),1500);
        } else {
            localStorage.setItem("vp_seq_index", nextIndex);
            log(`⏳ Reloading para sa susunod...`, "orange");
            setTimeout(()=>location.reload(),1500);
        }

      } else {
        log(`❌ Vote Failed`, "red");
      }
    }).catch(()=>log("⚠️ Parse Error","orange"));
  }
  return r;
};

// --- 5. MAIN RUNNER ---
async function runSequence(){
  // 1. Click Backend (No log for cleanliness)
  for(const url of currentSeq.backend){
    const img=(await qAll(`img[src="${url}"]`))?.[0];
    if(img) img.click(); // ✅ Removed log
    await wait(rw());
  }

  // 2. Find Category
  const categories = await qAll("h6");
  const categoryElem = Array.from(categories).find(e => e.textContent.trim() === currentSeq.category);

  if(categoryElem){
    categoryElem.scrollIntoView({behavior:"smooth",block:"center"});
    categoryElem.style.border = "2px solid yellow";
    log(`Found category: ${currentSeq.category}`,"cyan");

    const arrowUrl = "https://backend.choicely.com/images/Y2hvaWNlbHktZXUvaW1hZ2VzLzdFTDMweUJIRXVET3Z5VFc0SGdI/serve/";
    const arrowImgs = await qAll(`img[src="${arrowUrl}"]`);
    if(arrowImgs.length > 0){
      for(const img of arrowImgs){
        if(img.closest("div") && img.closest("div").contains(categoryElem)){
          img.click();
          break; // No log
        }
      }
    }
  } else {
    log("Category not found","red");
  }

  await wait(500);

  // 3. Find Participant & Vote
  const titles = await qAll("h6");
  const targetElem = Array.from(titles).find(e => e.textContent.trim() === currentSeq.participant);

  if(targetElem){
    targetElem.scrollIntoView({behavior:"smooth",block:"center"});
    const voteButtons = await qAll(".custom-vote-button-icon");
    if(voteButtons && voteButtons.length > currentSeq.buttonIndex){
      voteButtons[currentSeq.buttonIndex].click();
      log(`Voted for ${currentSeq.participant} (Button #${currentSeq.buttonIndex+1})`,"limegreen");
    } else {
      log("Button not found","red");
    }
  } else {
    log("Participant not found","red");
  }
}

// Start
if(d.readyState==="complete"){runSequence();}
else w.addEventListener("load",()=>runSequence());

keepAlive();
})();
