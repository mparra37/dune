// ══════════════════════════════════════════════════════
// ARRAKIS — APRENDE A PROGRAMAR · 10 NIVELES
// ══════════════════════════════════════════════════════
const TILE=40,COLS=16,ROWS=12,W=COLS*TILE,H=ROWS*TILE;
let cv,cx,running=false,af=null,ft=0,lvl=1;
let pl,spice,worms=[],hidden=false,grace=0,GRACE=60,winning=false;
let codeOn=false,cq=[],ct=null;
function resize(){if(!cv)return;const w=document.getElementById('canvas-wrap');if(!w)return;const s=Math.min(w.clientWidth/W,w.clientHeight/H,2);cv.style.width=Math.floor(W*s)+'px';cv.style.height=Math.floor(H*s)+'px'}
window.addEventListener('resize',resize);

// ═══ SFX ═══
let sfx=null;
function initSfx(){if(!sfx)sfx=new(window.AudioContext||window.webkitAudioContext)();if(sfx.state==='suspended')sfx.resume()}
function snd(type){
  initSfx();const t=sfx.currentTime;
  if(type==='step'){const o=sfx.createOscillator(),g=sfx.createGain();o.type='square';o.frequency.value=80+Math.random()*30;g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.07);const f=sfx.createBiquadFilter();f.type='bandpass';f.frequency.value=400;o.connect(f);f.connect(g);g.connect(sfx.destination);o.start(t);o.stop(t+.07)}
  else if(type==='hide'){const o=sfx.createOscillator(),g=sfx.createGain();o.type='sine';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(330,t+.15);g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(sfx.destination);o.start(t);o.stop(t+.3)}
  else if(type==='spice'){[523,659,784].forEach((f,i)=>{const o=sfx.createOscillator(),g=sfx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.1,t+i*.06);g.gain.exponentialRampToValueAtTime(.001,t+i*.06+.18);o.connect(g);g.connect(sfx.destination);o.start(t+i*.06);o.stop(t+i*.06+.18)})}
  else if(type==='win'){[392,494,587,784].forEach((f,i)=>{const o=sfx.createOscillator(),g=sfx.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.08,t+i*.1);g.gain.exponentialRampToValueAtTime(.001,t+i*.1+.35);o.connect(g);g.connect(sfx.destination);o.start(t+i*.1);o.stop(t+i*.1+.35)})}
  else if(type==='die'){const o=sfx.createOscillator(),g=sfx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(30,t+.5);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);const f=sfx.createBiquadFilter();f.type='lowpass';f.frequency.value=200;o.connect(f);f.connect(g);g.connect(sfx.destination);o.start(t);o.stop(t+.5)}
}

// ═══ MUSIC ═══
let ac=null,mp=false,mn=[];
function startMusic(){if(mp)return;if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();mn=[];const m=ac.createGain();m.gain.value=.12;m.connect(ac.destination);function o(t,f,g,ft,ff){const os=ac.createOscillator();os.type=t;os.frequency.value=f;const gn=ac.createGain();gn.gain.value=g;if(ft){const fl=ac.createBiquadFilter();fl.type=ft;fl.frequency.value=ff;os.connect(fl);fl.connect(gn)}else os.connect(gn);gn.connect(m);os.start();mn.push(os);return os}o('sawtooth',55,.25,'lowpass',120);o('sine',27.5,.2);const p=o('sine',220,.035);const lf=ac.createOscillator();lf.type='sine';lf.frequency.value=.12;const lg=ac.createGain();lg.gain.value=8;lf.connect(lg);lg.connect(p.frequency);lf.start();mn.push(lf);const buf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const ws=ac.createBufferSource();ws.buffer=buf;ws.loop=true;const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=500;wf.Q.value=.5;const wg=ac.createGain();wg.gain.value=.04;ws.connect(wf);wf.connect(wg);wg.connect(m);ws.start();mn.push(ws);mp=true;document.getElementById('music-btn').classList.add('active')}
function stopMusic(){mn.forEach(n=>{try{n.stop()}catch(e){}});mn=[];mp=false;document.getElementById('music-btn').classList.remove('active')}
function toggleMusic(){mp?stopMusic():startMusic()}

// ══════════════════════════════════════════════════════
// 10 NIVELES PROGRESIVOS
// ══════════════════════════════════════════════════════
const LV={
  1:{name:'Primer Comando',concept:'Comandos Básicos',
    tut:'Escribe <code>derecha(5)</code> para mover al Fremen 5 celdas a la derecha hasta la especia.<span class="tut-new">NUEVO: derecha(n), izquierda(n), arriba(n), abajo(n)</span>',
    hint:'derecha(5)',
    ws:99,wl:0,pp:{x:2,y:5},worms:[],
    sp:[{x:7,y:5}],rk:[],blocks:['move'],winMsg:'¡Aprendiste comandos de movimiento!'},

  2:{name:'Dos Direcciones',concept:'Secuencia',
    tut:'Ahora la especia no está en línea recta. Combina <b>dos comandos</b>, uno tras otro. Primero muévete a la derecha, luego hacia abajo.',
    hint:'derecha(4)\nabajo(3)',
    ws:99,wl:0,pp:{x:1,y:1},worms:[],
    sp:[{x:5,y:4}],rk:[],blocks:['move'],winMsg:'¡Los programas son secuencias de instrucciones!'},

  3:{name:'Camino de Obstáculos',concept:'Planificación',
    tut:'Las montañas ⛰ bloquean el paso (por ahora). Planifica una ruta <b>alrededor</b> de ellas para llegar a las 2 especias. Recoge <b>todas</b>.',
    hint:'derecha(3)\nabajo(4)\nderecha(5)\narriba(2)',
    ws:99,wl:0,pp:{x:1,y:1},worms:[],
    sp:[{x:4,y:5},{x:9,y:3}],
    rk:[{x:4,y:2},{x:4,y:3},{x:4,y:4},{x:7,y:5},{x:7,y:6}],
    blocks:['move'],winMsg:'¡Planificar la ruta es como diseñar un algoritmo!'},

  4:{name:'No Te Repitas',concept:'Bucles — repetir(n)',
    tut:'Escribir muchas líneas iguales es tedioso. Usa <code>repetir(n):</code> para repetir un bloque de código n veces. Termina con <code>fin</code>.<span class="tut-new">NUEVO: repetir(n): ... fin</span>',
    hint:'repetir(4):\n  derecha(2)\n  abajo(1)\nfin',
    ws:99,wl:0,pp:{x:0,y:0},worms:[],
    sp:[{x:2,y:1},{x:4,y:2},{x:6,y:3},{x:8,y:4}],
    rk:[],blocks:['move','loop'],winMsg:'¡Los bucles evitan repetir código!'},

  5:{name:'El Patrón',concept:'Bucles Avanzados',
    tut:'Recoge las 5 especias en zigzag. Usa <code>repetir()</code> con movimientos alternados. Observa el <b>patrón</b> en la posición de las especias.',
    hint:'repetir(5):\n  derecha(3)\n  abajo(1)\n  izquierda(1)\n  abajo(1)\nfin',
    ws:99,wl:0,pp:{x:0,y:0},worms:[],
    sp:[{x:3,y:0},{x:2,y:2},{x:5,y:2},{x:4,y:4},{x:7,y:4}],
    rk:[{x:1,y:1},{x:6,y:1},{x:3,y:3},{x:8,y:3},{x:5,y:5}],
    blocks:['move','loop'],winMsg:'¡Reconocer patrones es clave en programación!'},

  6:{name:'Ojos en la Arena',concept:'Condicionales — si/sino',
    tut:'¡Shai-Hulud aparece! (lento). Usa <code>si_gusano_cerca(n):</code> para detectarlo. Si está cerca, espera en una montaña. Si no, avanza.<span class="tut-new">NUEVO: si_gusano_cerca(n): ... sino: ... fin</span>',
    hint:'derecha(3)\nsi_gusano_cerca(4):\n  abajo(2)\n  esperar(3)\n  arriba(2)\nsino:\n  derecha(3)\nfin\nderecha(3)\nabajo(3)',
    ws:28,wl:4,pp:{x:0,y:2},worms:[{x:12,y:8}],
    sp:[{x:6,y:2},{x:9,y:5},{x:13,y:2}],
    rk:[{x:3,y:4},{x:3,y:5},{x:8,y:3},{x:8,y:4},{x:12,y:5},{x:12,y:6}],
    blocks:['move','loop','logic'],winMsg:'¡Los condicionales permiten tomar decisiones!'},

  7:{name:'Buscador de Especia',concept:'Sensor de Especia',
    tut:'Usa <code>si_especia(dir,n):</code> para "ver" si hay especia en una dirección a n pasos. Combínalo con <code>repetir()</code> para buscar.<span class="tut-new">NUEVO: si_especia(dir,n): ... fin</span>',
    hint:'repetir(8):\n  si_especia(derecha,8):\n    derecha(2)\n  sino:\n    abajo(1)\n  fin\nfin',
    ws:30,wl:4,pp:{x:0,y:0},worms:[{x:14,y:10}],
    sp:[{x:6,y:0},{x:6,y:4},{x:6,y:8},{x:12,y:2}],
    rk:[{x:3,y:2},{x:3,y:3},{x:9,y:4},{x:9,y:5},{x:9,y:6},{x:3,y:7},{x:3,y:8}],
    blocks:['move','loop','logic'],winMsg:'¡Los sensores permiten que el programa "vea" el mundo!'},

  8:{name:'Refugio Estratégico',concept:'Sensor de Ocultamiento',
    tut:'El gusano es más rápido. Puedes <b>entrar en montañas</b> para esconderte. Usa <code>si_oculto():</code> para verificar si estás a salvo y decidir cuándo salir.<span class="tut-new">NUEVO: si_oculto(): ... fin</span>',
    hint:'derecha(3)\nabajo(3)\nsi_gusano_cerca(5):\n  abajo(1)\n  esperar(4)\n  arriba(1)\nfin\nderecha(5)\nabajo(2)\nderecha(3)',
    ws:18,wl:5,pp:{x:0,y:0},worms:[{x:10,y:5}],
    sp:[{x:3,y:3},{x:8,y:5},{x:11,y:2},{x:14,y:8}],
    rk:[{x:3,y:4},{x:3,y:5},{x:7,y:2},{x:7,y:3},{x:11,y:6},{x:11,y:7},{x:14,y:4},{x:14,y:5}],
    blocks:['move','loop','logic'],winMsg:'¡Usar el entorno es parte del algoritmo!'},

  9:{name:'Doble Amenaza',concept:'Lógica Combinada',
    tut:'2 gusanos te persiguen. Combina <b>todos los conceptos</b>: bucles, condicionales, sensores y refugio. Planifica bien tu ruta.',
    hint:'derecha(2)\nabajo(2)\nrepetir(3):\n  si_gusano_cerca(4):\n    esperar(3)\n  sino:\n    derecha(2)\n  fin\n  abajo(1)\nfin\nizquierda(4)\nabajo(2)',
    ws:16,wl:5,pp:{x:0,y:0},worms:[{x:8,y:4},{x:12,y:9}],
    sp:[{x:4,y:2},{x:10,y:1},{x:13,y:6},{x:6,y:9},{x:2,y:7}],
    rk:[{x:3,y:3},{x:3,y:4},{x:7,y:2},{x:7,y:3},{x:11,y:5},{x:11,y:6},{x:5,y:7},{x:5,y:8},{x:9,y:8},{x:9,y:9},{x:14,y:3},{x:14,y:4}],
    blocks:['move','loop','logic'],winMsg:'¡Combinaste múltiples conceptos de programación!'},

  10:{name:'Maestro Fremen',concept:'Desafío Final',
    tut:'Prueba final: 2 gusanos rápidos, 6 especias, terreno complejo. Usa <b>todo lo que aprendiste</b>. ¡Demuestra que eres un maestro programador!',
    hint:'abajo(2)\nderecha(3)\nsi_gusano_cerca(5):\n  abajo(1)\n  esperar(4)\n  arriba(1)\nfin\nderecha(4)\narriba(3)\nderecha(4)\nabajo(4)\nrepetir(3):\n  si_gusano_cerca(4):\n    esperar(2)\n  fin\n  abajo(1)\n  izquierda(2)\nfin',
    ws:12,wl:6,pp:{x:0,y:3},worms:[{x:8,y:2},{x:12,y:10}],
    sp:[{x:3,y:5},{x:7,y:1},{x:11,y:0},{x:14,y:5},{x:10,y:9},{x:3,y:10}],
    rk:[{x:3,y:3},{x:3,y:4},{x:6,y:3},{x:6,y:4},{x:9,y:5},{x:9,y:6},{x:13,y:3},{x:13,y:4},{x:5,y:8},{x:5,y:9},{x:11,y:7},{x:11,y:8},{x:2,y:7},{x:14,y:8}],
    blocks:['move','loop','logic'],winMsg:'¡Eres un Maestro Fremen de la programación!'}
};

// ─── Textures ───
let sg=[],dw=[];
function genTex(){sg=[];for(let i=0;i<300;i++)sg.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.3,s:Math.random(),o:Math.random()*.12+.03});dw=[];for(let i=0;i<10;i++)dw.push({x:Math.random()*W,y:Math.random()*H,w:Math.random()*180+50,h:Math.random()*14+4,a:Math.random()*.4-.2,s:Math.random()*.06+.02})}

// ═══ LEVEL SELECT ═══
function buildLS(){const g=document.getElementById('ls-grid');g.innerHTML='';for(let i=1;i<=10;i++){const l=LV[i],c=document.createElement('div');c.className='ls-card';c.innerHTML=`<div class="ls-num">${i}</div><div class="ls-tag">${l.concept}</div>`;c.onclick=()=>{closeLevelSelect();lvl=i;startFromLevel()};g.appendChild(c)}}
function selectLevel(){buildLS();document.getElementById('level-select').classList.add('on')}
function closeLevelSelect(){document.getElementById('level-select').classList.remove('on')}

// ═══ INIT ═══
function init(){cv=document.getElementById('c');cx=cv.getContext('2d');cv.width=W;cv.height=H;resize()}

// ═══ FLOW ═══
function startGame(){lvl=1;startFromLevel()}
function startFromLevel(){document.getElementById('start-screen').classList.add('hide');document.getElementById('game').classList.add('on');closeLevelSelect();startMusic();loadLvl(lvl);setTimeout(resize,80)}
function backToMenu(){running=false;if(af)cancelAnimationFrame(af);stopCode();stopMusic();document.getElementById('game').classList.remove('on');document.getElementById('start-screen').classList.remove('hide');hideOv()}

function loadLvl(n){
  const l=LV[n];if(!l)return;hideOv();stopCode();lvl=n;winning=false;
  pl={x:l.pp.x,y:l.pp.y,sp:0,st:0,alive:true};hidden=false;
  spice=l.sp.map(s=>({...s}));
  worms=l.worms.map(w=>{const seg=[];for(let i=0;i<l.wl;i++)seg.push({x:w.x-i,y:w.y});return{seg,mt:0,mi:l.ws,jo:0,jd:1,wd:null,ws:0,sc:0,hue:0}});
  worms.forEach((w,i)=>w.hue=i);
  genTex();grace=worms.length>0?GRACE:30;

  // UI
  document.getElementById('hud-lvl').textContent=`N${n}`;
  document.getElementById('hud-spice').textContent=`◆ 0/${l.sp.length}`;
  document.getElementById('hud-hidden').style.display='none';

  // Tutorial
  document.getElementById('tut-badge').textContent=`NIVEL ${n}`;
  document.getElementById('tut-concept').textContent=l.concept;
  document.getElementById('tut-body').innerHTML=l.tut;

  // Show/hide block categories
  document.getElementById('bk-move').style.display='flex';
  document.getElementById('bk-loop').style.display=l.blocks.includes('loop')?'flex':'none';
  document.getElementById('bk-logic').style.display=l.blocks.includes('logic')?'flex':'none';

  // Announce
  document.getElementById('ann-lvl').textContent=`NIVEL ${n}`;
  document.getElementById('ann-name').textContent=l.name;
  showOv('ov-lvl');

  clearEditor();
  running=true;if(af)cancelAnimationFrame(af);loop();
  setTimeout(()=>document.getElementById('ov-lvl').classList.remove('on'),1400);
  setTimeout(resize,100);
}
function resetLevel(){hideOv();loadLvl(lvl)}
function nextLevel(){if(lvl>=10){showEnd();return}hideOv();loadLvl(lvl+1)}
function showEnd(){hideOv();showOv('ov-end');running=false}
function showOv(id){document.getElementById(id).classList.add('on')}
function hideOv(){['ov-death','ov-win','ov-end','ov-lvl','ov-grace'].forEach(i=>document.getElementById(i).classList.remove('on'))}

// ═══ BLOCK INSERT ═══
function ins(code){const e=document.getElementById('code');const p=e.selectionStart,v=e.value;const pre=(v.length>0&&!v.endsWith('\n'))?'\n':'';e.value=v.substring(0,p)+pre+code+'\n'+v.substring(e.selectionEnd);const cp=p+pre.length+code.indexOf('\n  ')+3;e.selectionStart=e.selectionEnd=Math.min(cp,e.value.length);e.focus()}
function clearEditor(){document.getElementById('code').value='';const c=document.getElementById('console');c.innerHTML='';c.classList.remove('on');document.getElementById('ed-status').textContent='LISTO'}
function showHint(){document.getElementById('code').value=LV[lvl].hint;logC('💡 Pista cargada — puedes modificarla','i')}

// ═══ LOOP ═══
function loop(){
  if(!running)return;ft++;
  if(grace>0){grace--;const s=Math.ceil(grace/30);const g=document.getElementById('ov-grace');if(grace>0){g.classList.add('on');document.getElementById('grace-num').textContent=s}else g.classList.remove('on');draw();af=requestAnimationFrame(loop);return}
  if(winning){draw();af=requestAnimationFrame(loop);return}
  for(const w of worms){w.jo+=.06*w.jd;if(w.jo>1)w.jd=-1;if(w.jo<0)w.jd=1;w.mt++;if(w.mt>=w.mi){w.mt=0;moveWm(w)}}
  hidden=LV[lvl].rk.some(r=>r.x===pl.x&&r.y===pl.y);
  document.getElementById('hud-hidden').style.display=hidden?'inline':'none';
  draw();af=requestAnimationFrame(loop);
}

// ═══ WORM AI ═══
function moveWm(w){
  if(!pl.alive)return;const l=LV[lvl],h=w.seg[0];
  const dirs=[{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
  function ok(p){if(p.x<0||p.x>=COLS||p.y<0||p.y>=ROWS)return false;if(l.rk.some(r=>r.x===p.x&&r.y===p.y))return false;const cl=Math.max(1,w.seg.length-3);for(let i=0;i<cl;i++)if(w.seg[i].x===p.x&&w.seg[i].y===p.y)return false;for(const ow of worms){if(ow===w)continue;if(ow.seg[0].x===p.x&&ow.seg[0].y===p.y)return false}return true}
  let nx=h.x,ny=h.y,mv=false;
  if(hidden){if(w.ws<=0){w.wd=dirs[Math.floor(Math.random()*4)];w.ws=Math.floor(Math.random()*5)+2}const t={x:h.x+w.wd.x,y:h.y+w.wd.y};if(ok(t)){nx=t.x;ny=t.y;mv=true}else w.ws=0;w.ws--}
  else{const dx=pl.x-h.x,dy=pl.y-h.y;let cs=[];if(Math.abs(dx)>=Math.abs(dy)){if(dx)cs.push({x:h.x+Math.sign(dx),y:h.y});if(dy)cs.push({x:h.x,y:h.y+Math.sign(dy)})}else{if(dy)cs.push({x:h.x,y:h.y+Math.sign(dy)});if(dx)cs.push({x:h.x+Math.sign(dx),y:h.y})}for(const d of dirs){const p={x:h.x+d.x,y:h.y+d.y};if(!cs.some(c=>c.x===p.x&&c.y===p.y))cs.push(p)}for(const c of cs)if(ok(c)){nx=c.x;ny=c.y;mv=true;break}}
  if(mv){w.sc=0;for(let i=w.seg.length-1;i>0;i--)w.seg[i]={...w.seg[i-1]};w.seg[0]={x:nx,y:ny}}
  else{w.sc++;if(w.sc>3&&w.seg.length>3){w.seg.pop();w.sc=0}}
  if(w.seg.length<LV[lvl].wl&&w.sc===0&&Math.random()<.08)w.seg.push({...w.seg[w.seg.length-1]});
  if(!hidden&&pl.alive)for(const s of w.seg)if(s.x===pl.x&&s.y===pl.y){die();return}
}

// ═══ PLAYER ═══
function movePl(dx,dy){
  if(!pl.alive||!running||winning)return false;
  const nx=pl.x+dx,ny=pl.y+dy;if(nx<0||nx>=COLS||ny<0||ny>=ROWS)return false;
  if(LV[lvl].rk.some(r=>r.x===nx&&r.y===ny)&&worms.length===0)return false; // In early levels rocks block
  pl.x=nx;pl.y=ny;pl.st++;
  const wasH=hidden;hidden=LV[lvl].rk.some(r=>r.x===pl.x&&r.y===pl.y);
  if(hidden&&!wasH)snd('hide');else snd('step');
  const si=spice.findIndex(s=>s.x===nx&&s.y===ny);if(si>=0){spice.splice(si,1);pl.sp++;snd('spice')}
  document.getElementById('hud-spice').textContent=`◆ ${pl.sp}/${LV[lvl].sp.length}`;
  if(!hidden)for(const w of worms)for(const s of w.seg)if(s.x===pl.x&&s.y===pl.y){die();return true}
  if(spice.length===0&&pl.alive){winning=true;setTimeout(()=>winLvl(),500)}
  return true;
}
function die(){pl.alive=false;running=false;if(af)cancelAnimationFrame(af);stopCode();snd('die');document.getElementById('canvas-wrap').classList.add('shake');setTimeout(()=>document.getElementById('canvas-wrap').classList.remove('shake'),400);setTimeout(()=>showOv('ov-death'),350)}
function winLvl(){
  running=false;if(af)cancelAnimationFrame(af);stopCode();winning=false;snd('win');
  if(lvl>=10){setTimeout(showEnd,400);return}
  document.getElementById('win-t').textContent=`¡NIVEL ${lvl} COMPLETADO!`;
  document.getElementById('win-m').textContent=`${pl.st} pasos`;
  document.getElementById('win-concept').textContent=LV[lvl].winMsg;
  showOv('ov-win');
}

// ═══ PROGRAMMING ENGINE ═══
function dtw(){if(worms.length===0)return 999;let m=999;for(const w of worms){const h=w.seg[0],d=Math.abs(pl.x-h.x)+Math.abs(pl.y-h.y);if(d<m)m=d}return m}
function sid(dir,md){const dl={arriba:{x:0,y:-1},abajo:{x:0,y:1},izquierda:{x:-1,y:0},derecha:{x:1,y:0}};const d=dl[dir];if(!d)return false;for(let i=1;i<=md;i++){const x=pl.x+d.x*i,y=pl.y+d.y*i;if(x<0||x>=COLS||y<0||y>=ROWS)break;if(spice.some(s=>s.x===x&&s.y===y))return true}return false}

function parse(src){
  const ls=src.split('\n').map(l=>l.trimEnd());let p=0;
  function pb(ind){const c=[];while(p<ls.length){const r=ls[p],t=r.trim();if(!t||t.startsWith('//')){p++;continue}const ci=r.length-r.trimStart().length;if(ci<ind&&t!=='fin'&&t!=='sino:')break;if(t==='fin'){p++;break}if(t==='sino:')break;
  const mv=t.match(/^(arriba|abajo|izquierda|derecha|esperar)\s*\(\s*(\d+)\s*\)$/i);if(mv){c.push({t:'m',c:mv[1].toLowerCase(),n:parseInt(mv[2])});p++;continue}
  const rp=t.match(/^repetir\s*\(\s*(\d+)\s*\)\s*:?$/i);if(rp){p++;c.push({t:'r',n:parseInt(rp[1]),b:pb(ci+1)});continue}
  const wm=t.match(/^si_gusano_cerca\s*\(\s*(\d+)\s*\)\s*:?$/i);if(wm){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'w',d:parseInt(wm[1]),th,el});continue}
  const sp=t.match(/^si_especia\s*\(\s*(arriba|abajo|izquierda|derecha)\s*,\s*(\d+)\s*\)\s*:?$/i);if(sp){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'s',dr:sp[1].toLowerCase(),d:parseInt(sp[2]),th,el});continue}
  const hd=t.match(/^si_oculto\s*\(\s*\)\s*:?$/i);if(hd){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'h',th,el});continue}
  c.push({t:'e',l:t});p++}return c}return pb(0)}

function flat(ast){const q=[];function w(ns){for(const n of ns){if(n.t==='e'){q.push(n);return}if(n.t==='m')for(let i=0;i<n.n;i++)q.push({t:'m',c:n.c});if(n.t==='r')for(let i=0;i<n.n;i++)w(n.b);if('th'in n)q.push(n)}}w(ast);return q}

function runCode(){
  if(codeOn)return;const r=document.getElementById('code').value.trim();if(!r)return;
  const con=document.getElementById('console');con.classList.add('on');con.innerHTML='';
  const ast=parse(r);let er=[];(function f(ns){for(const n of ns){if(n.t==='e')er.push(n.l);if(n.th)f(n.th);if(n.el)f(n.el);if(n.b)f(n.b)}})(ast);
  if(er.length){logC(`✗ Error: "${er[0]}"`,'e');logC('Revisa la sintaxis','e');return}
  cq=flat(ast);logC('▶ Ejecutando...','s');document.getElementById('ed-status').textContent='EJECUTANDO';codeOn=true;exN();
}
function exN(){
  if(!codeOn||cq.length===0){codeOn=false;if(pl.alive&&(running||winning)){logC('✓ Programa terminado','s');if(spice.length>0&&!winning)logC(`⚠ Faltan ${spice.length} especias`,'e');document.getElementById('ed-status').textContent='COMPLETO'}return}
  if(grace>0){ct=setTimeout(exN,100);return}
  const i=cq.shift();
  if(i.t==='m'){let ok=true;switch(i.c){case'arriba':ok=movePl(0,-1);break;case'abajo':ok=movePl(0,1);break;case'izquierda':ok=movePl(-1,0);break;case'derecha':ok=movePl(1,0);break;case'esperar':break}if(!ok){logC(`✗ Bloqueado: ${i.c}`,'e');codeOn=false;document.getElementById('ed-status').textContent='BLOQUEADO';return}}
  if(i.t==='w'){const d=dtw();const br=d<=i.d?i.th:i.el;logC(`  gusano a ${d} → ${d<=i.d?'SÍ':'NO'}`,'i');cq=flat(br).concat(cq)}
  if(i.t==='s'){const f=sid(i.dr,i.d);const br=f?i.th:i.el;logC(`  especia ${i.dr}? ${f?'SÍ':'NO'}`,'i');cq=flat(br).concat(cq)}
  if(i.t==='h'){const br=hidden?i.th:i.el;logC(`  oculto? ${hidden?'SÍ':'NO'}`,'i');cq=flat(br).concat(cq)}
  if(!pl.alive||(!running&&!winning)){codeOn=false;document.getElementById('ed-status').textContent='DETENIDO';return}
  ct=setTimeout(exN,200);
}
function stopCode(){codeOn=false;cq=[];if(ct)clearTimeout(ct);document.getElementById('ed-status').textContent='LISTO'}
function logC(m,t=''){const e=document.getElementById('console'),l=document.createElement('div');l.className='log '+t;l.textContent=m;e.appendChild(l);e.scrollTop=e.scrollHeight}

// ══════════════════════════════════════════════════════
// RENDERING — same Dune style
// ══════════════════════════════════════════════════════
function draw(){cx.clearRect(0,0,W,H);drDesert();drGrid();drMtns();drSpice();for(const w of worms){drWmTrail(w);drWm(w)}if(pl.alive)drPl();drHud();drTremor();if(grace>0)drShield()}

function drDesert(){
  const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#c9952a');g.addColorStop(1,'#8b6914');cx.fillStyle=g;cx.fillRect(0,0,W,H);
  cx.save();cx.globalAlpha=.15;for(let i=0;i<2000;i++){const x=((Math.sin(i)*13.7*W)%W+W)%W,y=((Math.cos(i)*17.3*H)%H+H)%H;cx.fillStyle=i%2===0?'#fff':'#000';cx.fillRect(x,y,1,1)}cx.restore();
  dw.forEach(d=>{cx.save();cx.translate(d.x,d.y);cx.rotate(d.a);const dg=cx.createLinearGradient(0,-d.h,0,d.h);dg.addColorStop(0,'rgba(0,0,0,0.2)');dg.addColorStop(1,'transparent');cx.fillStyle=dg;cx.beginPath();cx.ellipse(0,0,d.w,d.h,0,0,Math.PI*2);cx.fill();cx.restore()});
  cx.globalAlpha=.015;cx.fillStyle='#fff';for(let y=0;y<H;y+=20)cx.fillRect(Math.sin((y+ft*.4)*.05)*5,y,W,1);cx.globalAlpha=1;
}
function drGrid(){cx.strokeStyle='rgba(0,0,0,.03)';cx.lineWidth=.5;for(let x=0;x<=W;x+=TILE){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke()}for(let y=0;y<=H;y+=TILE){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()}}

function drMtns(){
  const l=LV[lvl];for(const r of l.rk){
    const x=r.x*TILE,y=r.y*TILE,mx=x+TILE/2,my=y+TILE/2,here=pl.x===r.x&&pl.y===r.y;
    cx.globalAlpha=.2;cx.fillStyle='#1a0a00';cx.beginPath();cx.ellipse(mx+3,my+7,18,7,0,0,Math.PI*2);cx.fill();cx.globalAlpha=1;
    cx.fillStyle=here?'#3d4f60':'#4a3c2a';cx.beginPath();cx.moveTo(x-3,y+TILE);cx.lineTo(x+5,y+10);cx.lineTo(mx-1,y-3);cx.lineTo(mx+4,y+4);cx.lineTo(x+TILE-3,y-5);cx.lineTo(x+TILE+3,y+9);cx.lineTo(x+TILE+3,y+TILE);cx.closePath();cx.fill();
    cx.fillStyle=here?'#506878':'#6d5a3a';cx.beginPath();cx.moveTo(mx-1,y-3);cx.lineTo(mx+4,y+4);cx.lineTo(x+TILE-3,y-5);cx.lineTo(x+TILE+3,y+9);cx.lineTo(x+TILE+3,y+TILE);cx.lineTo(mx,y+TILE);cx.closePath();cx.fill();
    cx.fillStyle='#c8b8a8';cx.globalAlpha=.5;cx.beginPath();cx.moveTo(mx-1,y-3);cx.lineTo(mx+3,y+3);cx.lineTo(mx-5,y+5);cx.closePath();cx.fill();cx.beginPath();cx.moveTo(x+TILE-3,y-5);cx.lineTo(x+TILE+1,y+2);cx.lineTo(x+TILE-7,y+3);cx.closePath();cx.fill();cx.globalAlpha=1;
    if(here){cx.globalAlpha=.12+Math.sin(ft*.06)*.06;cx.strokeStyle='#4fc3f7';cx.lineWidth=2;cx.setLineDash([4,3]);cx.beginPath();cx.arc(mx,my,22,0,Math.PI*2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1}
    else if(worms.length>0&&Math.abs(pl.x-r.x)<=2&&Math.abs(pl.y-r.y)<=2){cx.globalAlpha=.18;cx.fillStyle='#4fc3f7';cx.font='9px Rajdhani';cx.textAlign='center';cx.fillText('⛰',mx,y+TILE+9);cx.globalAlpha=1}
  }
}
function drSpice(){for(const s of spice){const x=s.x*TILE+TILE/2,y=s.y*TILE+TILE/2,p=Math.sin(ft*.07+s.x)*.3+.7,gl=Math.sin(ft*.05+s.y)*3+13;cx.globalAlpha=.12*p;const g=cx.createRadialGradient(x,y,1,x,y,gl);g.addColorStop(0,'#ff9f43');g.addColorStop(1,'transparent');cx.fillStyle=g;cx.fillRect(x-gl,y-gl,gl*2,gl*2);cx.globalAlpha=.92;cx.fillStyle='#e85d10';cx.beginPath();cx.moveTo(x,y-9);cx.lineTo(x+7,y);cx.lineTo(x,y+9);cx.lineTo(x-7,y);cx.closePath();cx.fill();cx.fillStyle='#ffcc02';cx.beginPath();cx.moveTo(x,y-5);cx.lineTo(x+4,y);cx.lineTo(x,y+5);cx.lineTo(x-4,y);cx.closePath();cx.fill();cx.fillStyle='#fff';cx.globalAlpha=p*.5;cx.beginPath();cx.arc(x-2,y-3,1.2,0,Math.PI*2);cx.fill();cx.globalAlpha=1}}
function drWmTrail(w){cx.globalAlpha=.04;cx.fillStyle='#3e2723';for(const s of w.seg){cx.beginPath();cx.ellipse(s.x*TILE+TILE/2+2,s.y*TILE+TILE/2+3,14,6,0,0,Math.PI*2);cx.fill()}cx.globalAlpha=1}
function drWm(w){
  const cols=[['#5d4037','#4e342e','#6d4c41','#8d6e63'],['#4a148c','#38006b','#6a1b9a','#9c27b0']][w.hue%2];
  const ss=w.seg;for(let i=ss.length-1;i>=0;i--){const s=ss[i],x=s.x*TILE+TILE/2,y=s.y*TILE+TILE/2,wb=Math.sin(ft*.08+i*.8)*2,t=i/(ss.length-1),r=16-t*7;
  if(i===0){const j=w.jo*.3;cx.fillStyle=cols[1];cx.beginPath();cx.arc(x+wb,y,r+2,0,Math.PI*2);cx.fill();cx.fillStyle=cols[0];cx.beginPath();cx.arc(x+wb,y,r,0,Math.PI*2);cx.fill();cx.fillStyle=cols[1];cx.beginPath();cx.arc(x+wb,y-j*10,r-2,Math.PI+.3,-.3);cx.closePath();cx.fill();cx.beginPath();cx.arc(x+wb,y+j*10,r-2,.3,Math.PI-.3);cx.closePath();cx.fill();if(w.jo>.2){cx.fillStyle='#b71c1c';cx.globalAlpha=w.jo;cx.beginPath();cx.ellipse(x+wb,y,r-4,j*8,0,0,Math.PI*2);cx.fill();cx.globalAlpha=1}cx.fillStyle='#ffecb3';for(let t=0;t<4;t++){const a=(t/4)*Math.PI-Math.PI/2,tx=x+wb+Math.cos(a)*(r-3),ty=y-j*8+Math.sin(a)*3;cx.beginPath();cx.moveTo(tx-1.5,ty);cx.lineTo(tx,ty+4+j*3);cx.lineTo(tx+1.5,ty);cx.fill()}for(let t=0;t<4;t++){const a=(t/4)*Math.PI+Math.PI/2,tx=x+wb+Math.cos(a)*(r-3),ty=y+j*8+Math.sin(a)*3;cx.beginPath();cx.moveTo(tx-1.5,ty);cx.lineTo(tx,ty-4-j*3);cx.lineTo(tx+1.5,ty);cx.fill()}const eg=Math.sin(ft*.1)*.3+.7;cx.globalAlpha=.35*eg;cx.fillStyle='#ff1744';cx.beginPath();cx.arc(x+wb-5,y-6,5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(x+wb+5,y-6,5,0,Math.PI*2);cx.fill();cx.globalAlpha=1;cx.fillStyle='#ff1744';cx.beginPath();cx.arc(x+wb-5,y-6,3.5,0,Math.PI*2);cx.fill();cx.fillStyle='#b71c1c';cx.beginPath();cx.arc(x+wb-5,y-6,1.8,0,Math.PI*2);cx.fill();cx.fillStyle='#ff1744';cx.beginPath();cx.arc(x+wb+5,y-6,3.5,0,Math.PI*2);cx.fill();cx.fillStyle='#b71c1c';cx.beginPath();cx.arc(x+wb+5,y-6,1.8,0,Math.PI*2);cx.fill()}
  else{cx.fillStyle=t<.5?cols[2]:cols[3];cx.beginPath();cx.arc(x+wb,y,r,0,Math.PI*2);cx.fill();cx.strokeStyle=t<.5?cols[0]:cols[2];cx.lineWidth=1;cx.beginPath();cx.arc(x+wb,y,r-2,0,Math.PI*2);cx.stroke()}}
}

function drPl(){
  const x=pl.x*TILE+TILE/2,y=pl.y*TILE+TILE/2,hover=Math.sin(ft*.1)*2;
  if(hidden){cx.globalAlpha=.15+Math.sin(ft*.06)*.06;cx.strokeStyle='#4fc3f7';cx.lineWidth=1.5;cx.setLineDash([3,3]);cx.beginPath();cx.arc(x,y,18,0,Math.PI*2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1}
  cx.globalAlpha=hidden?.05:.12;cx.fillStyle='#1a0e00';cx.beginPath();cx.ellipse(x,y+16,10,4,0,0,Math.PI*2);cx.fill();
  cx.globalAlpha=hidden?.4:1;
  cx.fillStyle='#5d4037';cx.beginPath();cx.moveTo(x-10,y+15);cx.quadraticCurveTo(x+Math.sin(ft*.05)*10,y+20,x+10,y+15);cx.lineTo(x,y-5);cx.closePath();cx.fill();
  cx.fillStyle='#333';cx.beginPath();cx.arc(x,y-8+hover,7,0,Math.PI*2);cx.fill();
  cx.fillStyle='#00f2ff';cx.shadowBlur=8;cx.shadowColor='#00f2ff';cx.fillRect(x-4,y-10+hover,3,2);cx.fillRect(x+1,y-10+hover,3,2);cx.shadowBlur=0;
  cx.globalAlpha=1;
}

function drHud(){const rm=spice.length;cx.globalAlpha=.6;cx.fillStyle='#1a0e00';cx.fillRect(W/2-75,4,150,18);cx.globalAlpha=1;cx.font='bold 11px Rajdhani';cx.textAlign='center';if(rm>0){cx.fillStyle=rm<=1?'#00e676':'#ff9f43';cx.fillText(`◆ ${rm} especia${rm>1?'s':''} restante${rm>1?'s':''}`,W/2,17)}else{cx.fillStyle='#00e676';cx.fillText('✓ ¡Especia recogida!',W/2,17)}if(hidden){cx.globalAlpha=.7;cx.fillStyle='#0d47a1';cx.fillRect(W/2-40,24,80,14);cx.globalAlpha=1;cx.fillStyle='#4fc3f7';cx.font='bold 9px Rajdhani';cx.fillText('⛰ OCULTO',W/2,34)}}

function drTremor(){let minD=999;for(const w of worms){const h=w.seg[0],d=Math.sqrt((pl.x-h.x)**2+(pl.y-h.y)**2);if(d<minD)minD=d}const tr=minD<5&&!hidden?(5-minD)/5:0;if(tr<=0){cv.style.transform='';return}cx.globalAlpha=tr*.06;cx.fillStyle='#ff1744';cx.fillRect(0,0,W,H);cx.globalAlpha=1;if(tr>.5)cv.style.transform=`translate(${(Math.random()-.5)*tr*2}px,${(Math.random()-.5)*tr*2}px)`;else cv.style.transform=''}
function drShield(){const x=pl.x*TILE+TILE/2,y=pl.y*TILE+TILE/2;cx.globalAlpha=Math.sin(ft*.15)*.1+.18;cx.strokeStyle='#4fc3f7';cx.lineWidth=1.5;cx.setLineDash([5,3]);cx.beginPath();cx.arc(x,y,20,0,Math.PI*2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1}

init();
