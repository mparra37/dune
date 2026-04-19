// ══════════════════════════════════════════════════════
// ARRAKIS — APRENDE A PROGRAMAR v2
// ══════════════════════════════════════════════════════
const TILE=40,COLS=16,ROWS=12,W=COLS*TILE,H=ROWS*TILE;
let cv,cx,running=false,af=null,ft=0,lvl=1;
let pl,spice,worms=[],hidden=false,grace=0,GRACE=50,winning=false;
let codeOn=false,cq=[],ct=null;
let wormActive=false; // worms only move after code runs
let totalScore=0;
function resize(){if(!cv)return;const w=document.getElementById('canvas-wrap');if(!w)return;const s=Math.min(w.clientWidth/W,w.clientHeight/H,2);cv.style.width=Math.floor(W*s)+'px';cv.style.height=Math.floor(H*s)+'px'}
window.addEventListener('resize',resize);

// ═══ SFX ═══
let sfxC=null;
function initSfx(){if(!sfxC)sfxC=new(window.AudioContext||window.webkitAudioContext)();if(sfxC.state==='suspended')sfxC.resume()}
function snd(type){initSfx();const t=sfxC.currentTime;
if(type==='step'){const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='square';o.frequency.value=80+Math.random()*30;g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.07);const f=sfxC.createBiquadFilter();f.type='bandpass';f.frequency.value=400;o.connect(f);f.connect(g);g.connect(sfxC.destination);o.start(t);o.stop(t+.07)}
else if(type==='hide'){const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='sine';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(330,t+.15);g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(sfxC.destination);o.start(t);o.stop(t+.3)}
else if(type==='spice'){[523,659,784].forEach((f,i)=>{const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.1,t+i*.06);g.gain.exponentialRampToValueAtTime(.001,t+i*.06+.18);o.connect(g);g.connect(sfxC.destination);o.start(t+i*.06);o.stop(t+i*.06+.18)})}
else if(type==='win'){[392,494,587,784].forEach((f,i)=>{const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.08,t+i*.1);g.gain.exponentialRampToValueAtTime(.001,t+i*.1+.3);o.connect(g);g.connect(sfxC.destination);o.start(t+i*.1);o.stop(t+i*.1+.3)})}
else if(type==='die'){const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(30,t+.5);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);const f=sfxC.createBiquadFilter();f.type='lowpass';f.frequency.value=200;o.connect(f);f.connect(g);g.connect(sfxC.destination);o.start(t);o.stop(t+.5)}
else if(type==='fail'){const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='triangle';o.frequency.setValueAtTime(300,t);o.frequency.exponentialRampToValueAtTime(150,t+.3);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(sfxC.destination);o.start(t);o.stop(t+.3)}
}

// ═══ MUSIC ═══
let ac=null,mp=false,mn=[];
function startMusic(){if(mp)return;if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();mn=[];const m=ac.createGain();m.gain.value=.12;m.connect(ac.destination);function o(t,f,g,ft,ff){const os=ac.createOscillator();os.type=t;os.frequency.value=f;const gn=ac.createGain();gn.gain.value=g;if(ft){const fl=ac.createBiquadFilter();fl.type=ft;fl.frequency.value=ff;os.connect(fl);fl.connect(gn)}else os.connect(gn);gn.connect(m);os.start();mn.push(os);return os}o('sawtooth',55,.25,'lowpass',120);o('sine',27.5,.2);const p=o('sine',220,.035);const lf=ac.createOscillator();lf.type='sine';lf.frequency.value=.12;const lg=ac.createGain();lg.gain.value=8;lf.connect(lg);lg.connect(p.frequency);lf.start();mn.push(lf);const buf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const ws=ac.createBufferSource();ws.buffer=buf;ws.loop=true;const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=500;wf.Q.value=.5;const wg=ac.createGain();wg.gain.value=.04;ws.connect(wf);wf.connect(wg);wg.connect(m);ws.start();mn.push(ws);mp=true;document.getElementById('music-btn').classList.add('active')}
function stopMusic(){mn.forEach(n=>{try{n.stop()}catch(e){}});mn=[];mp=false;document.getElementById('music-btn').classList.remove('active')}
function toggleMusic(){mp?stopMusic():startMusic()}

// ══════════════════════════════════════════════════════
// LEVELS — par = optimal steps for scoring
// ══════════════════════════════════════════════════════
const LV={
1:{name:'Primer Comando',concept:'Comandos Básicos',par:5,
  tut:'Escribe <code>derecha(5)</code> para mover al Fremen hasta la especia. El número indica cuántas celdas avanzar.<span class="tut-new">NUEVO: derecha(n), izquierda(n), arriba(n), abajo(n)</span>',
  hint:'La especia está 5 celdas a tu derecha. Usa un solo comando con el número 5.',
  ws:99,wl:0,pp:{x:2,y:5},worms:[],sp:[{x:7,y:5}],rk:[],blocks:['move'],winMsg:'¡Aprendiste comandos de movimiento!'},
2:{name:'Dos Direcciones',concept:'Secuencia',par:7,
  tut:'Ahora combina <b>dos comandos</b> en secuencia. Primero una dirección, luego otra.',
  hint:'Cuenta las celdas: ¿cuántas a la derecha y cuántas hacia abajo necesitas para llegar?',
  ws:99,wl:0,pp:{x:1,y:1},worms:[],sp:[{x:5,y:4}],rk:[],blocks:['move'],winMsg:'¡Los programas son secuencias de instrucciones!'},
3:{name:'Rodear Obstáculos',concept:'Planificación',par:14,
  tut:'Las montañas ⛰ bloquean tu camino. Planifica una ruta <b>alrededor</b> de ellas. Debes recoger <b>todas</b> las especias.',
  hint:'Primero baja para rodear las montañas de la izquierda, recoge la especia de abajo, luego sube hacia la derecha.',
  ws:99,wl:0,pp:{x:1,y:1},worms:[],sp:[{x:4,y:5},{x:9,y:3}],
  rk:[{x:4,y:2},{x:4,y:3},{x:4,y:4},{x:7,y:5},{x:7,y:6}],
  blocks:['move'],winMsg:'¡Planificar la ruta es diseñar un algoritmo!'},
4:{name:'No Te Repitas',concept:'Bucles — repetir()',par:8,
  tut:'Las especias siguen un patrón: cada una está 2→ y 1↓ de la anterior. En vez de escribir lo mismo 4 veces, usa <code>repetir(4):</code> con las instrucciones adentro y termina con <code>fin</code>.<span class="tut-new">NUEVO: repetir(n): ... fin</span>',
  hint:'El patrón se repite 4 veces: derecha(2) y abajo(1). Ponlos dentro de un repetir(4): ... fin',
  ws:99,wl:0,pp:{x:0,y:0},worms:[],sp:[{x:2,y:1},{x:4,y:2},{x:6,y:3},{x:8,y:4}],rk:[],
  blocks:['move','loop'],winMsg:'¡Los bucles evitan repetir código!'},
5:{name:'Zigzag',concept:'Patrones con Bucles',par:16,
  tut:'Las especias forman un zigzag. Observa el patrón: derecha, abajo, izquierda, abajo... Usa <code>repetir()</code> para automatizarlo.',
  hint:'El patrón base es: derecha(3), abajo(2), izquierda(3), abajo(2). Se repite varias veces. ¿Cuántas?',
  ws:99,wl:0,pp:{x:0,y:0},worms:[],sp:[{x:3,y:0},{x:0,y:2},{x:3,y:4},{x:0,y:6}],
  rk:[{x:1,y:1},{x:2,y:1},{x:1,y:3},{x:2,y:3},{x:1,y:5},{x:2,y:5}],
  blocks:['move','loop'],winMsg:'¡Reconocer patrones es clave en programación!'},
6:{name:'Ojos en la Arena',concept:'Sensor Direccional',par:12,
  tut:'¡Shai-Hulud aparece! Pero no se mueve hasta que ejecutes tu código. Usa <code>si_gusano(dirección,n):</code> para detectar si viene <b>desde una dirección</b> a n celdas. También puedes detectar bordes con <code>si_borde(dir,n):</code> y montañas con <code>si_duna(dir,n):</code><span class="tut-new">NUEVO: si_gusano(dir,n), si_borde(dir,n), si_duna(dir,n)</span>',
  hint:'El gusano viene desde la derecha. Usa si_gusano(derecha,6): para detectarlo. Si lo detectas, ve primero a la montaña de abajo para esconderte y esperar.',
  ws:26,wl:4,pp:{x:0,y:2},worms:[{x:13,y:5}],
  sp:[{x:5,y:2},{x:10,y:2},{x:13,y:8}],
  rk:[{x:3,y:4},{x:3,y:5},{x:8,y:4},{x:8,y:5},{x:12,y:6},{x:12,y:7}],
  blocks:['move','loop','logic'],winMsg:'¡Los condicionales permiten tomar decisiones!'},
7:{name:'Buscador de Especia',concept:'Sensor de Especia',par:14,
  tut:'Usa <code>si_especia(dir,n):</code> para "ver" si hay especia en una dirección. Combínalo con <code>repetir()</code> para buscar automáticamente.',
  hint:'Usa repetir() y dentro pregunta si_especia(derecha,8): para avanzar hacia ella. Si no hay, intenta si_especia(abajo,8): para bajar.',
  ws:28,wl:4,pp:{x:0,y:0},worms:[{x:14,y:10}],
  sp:[{x:6,y:0},{x:6,y:4},{x:6,y:8},{x:12,y:2}],
  rk:[{x:3,y:2},{x:3,y:3},{x:9,y:4},{x:9,y:5},{x:9,y:6},{x:3,y:7},{x:3,y:8}],
  blocks:['move','loop','logic'],winMsg:'¡Los sensores permiten que el programa "vea"!'},
8:{name:'Refugio Estratégico',concept:'Detector de Montañas',par:16,
  tut:'Gusano más rápido. Usa <code>si_duna(dir,n):</code> para encontrar montañas cercanas y esconderte. Cuando estás en una montaña, el gusano pierde tu rastro.',
  hint:'Avanza recogiendo especia, y cuando si_gusano(derecha,5) sea verdadero, busca una montaña con si_duna(abajo,3): y escóndete con esperar(4).',
  ws:18,wl:5,pp:{x:0,y:0},worms:[{x:10,y:5}],
  sp:[{x:3,y:3},{x:8,y:1},{x:11,y:3},{x:14,y:8}],
  rk:[{x:3,y:4},{x:3,y:5},{x:7,y:3},{x:7,y:4},{x:11,y:6},{x:11,y:7},{x:14,y:5},{x:14,y:6}],
  blocks:['move','loop','logic'],winMsg:'¡Usar el entorno es parte del algoritmo!'},
9:{name:'Doble Amenaza',concept:'Lógica Combinada',par:20,
  tut:'2 gusanos te persiguen desde distintas direcciones. Usa sensores direccionales: <code>si_gusano(izquierda,4):</code> y <code>si_gusano(abajo,4):</code> para saber de dónde vienen y escapar al lado contrario.',
  hint:'Usa si_gusano(derecha,5): para detectar el gusano de la derecha y si_gusano(abajo,5): para el de abajo. Cuando uno se acerque, ve al lado opuesto o busca una montaña.',
  ws:16,wl:5,pp:{x:0,y:0},worms:[{x:8,y:4},{x:12,y:9}],
  sp:[{x:4,y:2},{x:10,y:1},{x:13,y:6},{x:6,y:9},{x:2,y:7}],
  rk:[{x:3,y:3},{x:3,y:4},{x:7,y:2},{x:7,y:3},{x:11,y:5},{x:11,y:6},{x:5,y:7},{x:5,y:8},{x:9,y:8},{x:9,y:9},{x:14,y:3},{x:14,y:4}],
  blocks:['move','loop','logic'],winMsg:'¡Combinaste múltiples conceptos!'},
10:{name:'Maestro Fremen',concept:'Desafío Final',par:24,
  tut:'Prueba final: 2 gusanos rápidos, 6 especias, terreno complejo. Usa <b>todo</b>: bucles, condicionales, sensores de gusano, especia, dunas y bordes.',
  hint:'Planifica primero tu ruta en papel. Identifica dónde están las montañas-refugio. Recoge las especias más cercanas primero y usa si_gusano(dir,4): antes de cada movimiento largo.',
  ws:12,wl:6,pp:{x:0,y:5},worms:[{x:8,y:2},{x:12,y:10}],
  sp:[{x:3,y:1},{x:7,y:0},{x:13,y:3},{x:14,y:8},{x:8,y:10},{x:2,y:9}],
  rk:[{x:3,y:3},{x:3,y:4},{x:6,y:3},{x:6,y:4},{x:10,y:5},{x:10,y:6},{x:13,y:5},{x:13,y:6},{x:5,y:8},{x:5,y:9},{x:11,y:8},{x:11,y:9}],
  blocks:['move','loop','logic'],winMsg:'¡Eres un Maestro Fremen de la programación!'}
};

let sg=[],dw=[];
function genTex(){sg=[];for(let i=0;i<300;i++)sg.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.3,s:Math.random(),o:Math.random()*.12+.03});dw=[];for(let i=0;i<10;i++)dw.push({x:Math.random()*W,y:Math.random()*H,w:Math.random()*180+50,h:Math.random()*14+4,a:Math.random()*.4-.2,s:Math.random()*.06+.02})}

function buildLS(){const g=document.getElementById('ls-grid');g.innerHTML='';for(let i=1;i<=10;i++){const l=LV[i],c=document.createElement('div');c.className='ls-card';c.innerHTML=`<div class="ls-num">${i}</div><div class="ls-tag">${l.concept}</div>`;c.onclick=()=>{closeLevelSelect();lvl=i;startFromLevel()};g.appendChild(c)}}
function selectLevel(){buildLS();document.getElementById('level-select').classList.add('on')}
function closeLevelSelect(){document.getElementById('level-select').classList.remove('on')}

function init(){cv=document.getElementById('c');cx=cv.getContext('2d');cv.width=W;cv.height=H;resize()}

function startGame(){lvl=1;totalScore=0;startFromLevel()}
function startFromLevel(){document.getElementById('start-screen').classList.add('hide');document.getElementById('game').classList.add('on');closeLevelSelect();startMusic();loadLvl(lvl);setTimeout(resize,80)}
function backToMenu(){running=false;if(af)cancelAnimationFrame(af);stopCode();stopMusic();document.getElementById('game').classList.remove('on');document.getElementById('start-screen').classList.remove('hide');hideOv()}

function loadLvl(n){
  const l=LV[n];if(!l)return;hideOv();stopCode();closeHint();lvl=n;winning=false;wormActive=false;
  pl={x:l.pp.x,y:l.pp.y,sp:0,st:0,alive:true};hidden=false;
  spice=l.sp.map(s=>({...s}));
  worms=l.worms.map((w,i)=>{const seg=[];for(let j=0;j<l.wl;j++)seg.push({x:w.x-j,y:w.y});return{seg,mt:0,mi:l.ws,jo:0,jd:1,wd:null,ws:0,sc:0,hue:i}});
  genTex();grace=worms.length>0?GRACE:20;
  document.getElementById('hud-lvl').textContent=`N${n}`;
  document.getElementById('hud-spice').textContent=`◆ 0/${l.sp.length}`;
  document.getElementById('hud-steps').textContent='↦ 0';
  document.getElementById('hud-score').textContent=`★ ${totalScore}`;
  document.getElementById('hud-hidden').style.display='none';
  document.getElementById('tut-badge').textContent=`NIVEL ${n}`;
  document.getElementById('tut-concept').textContent=l.concept;
  document.getElementById('tut-body').innerHTML=l.tut;
  document.getElementById('bk-move').style.display='flex';
  document.getElementById('bk-loop').style.display=l.blocks.includes('loop')?'flex':'none';
  document.getElementById('bk-logic').style.display=l.blocks.includes('logic')?'flex':'none';
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
function showEnd(){hideOv();document.getElementById('final-score').textContent=totalScore;showOv('ov-end');running=false}
function showOv(id){document.getElementById(id).classList.add('on')}
function hideOv(){['ov-death','ov-win','ov-end','ov-lvl','ov-grace','ov-fail','level-select'].forEach(i=>document.getElementById(i).classList.remove('on'))}

function ins(code){const e=document.getElementById('code');const p=e.selectionStart,v=e.value;const pre=(v.length>0&&!v.endsWith('\n'))?'\n':'';e.value=v.substring(0,p)+pre+code+'\n'+v.substring(e.selectionEnd);const cp=p+pre.length+code.indexOf('\n  ')+3;e.selectionStart=e.selectionEnd=Math.min(cp,e.value.length);e.focus()}
function clearEditor(){document.getElementById('code').value='';const c=document.getElementById('console');c.innerHTML='';c.classList.remove('on');document.getElementById('ed-status').textContent='LISTO'}
function showHint(){document.getElementById('hint-text').innerHTML=LV[lvl].hint;document.getElementById('hint-box').classList.add('on')}
function closeHint(){document.getElementById('hint-box').classList.remove('on')}

// ═══ LOOP ═══
function loop(){
  if(!running)return;ft++;
  if(grace>0){grace--;const s=Math.ceil(grace/30);const g=document.getElementById('ov-grace');if(grace>0){g.classList.add('on');document.getElementById('grace-num').textContent=s}else g.classList.remove('on');draw();af=requestAnimationFrame(loop);return}
  if(winning){draw();af=requestAnimationFrame(loop);return}
  // Worms only move when code is running
  if(wormActive){for(const w of worms){w.jo+=.06*w.jd;if(w.jo>1)w.jd=-1;if(w.jo<0)w.jd=1;w.mt++;if(w.mt>=w.mi){w.mt=0;moveWm(w)}}}
  else{for(const w of worms){w.jo+=.04*w.jd;if(w.jo>1)w.jd=-1;if(w.jo<0)w.jd=1}} // idle jaw animation
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
  // Early levels: rocks block. Later: rocks = shelter
  if(worms.length===0&&LV[lvl].rk.some(r=>r.x===nx&&r.y===ny))return false;
  pl.x=nx;pl.y=ny;pl.st++;
  const wasH=hidden;hidden=LV[lvl].rk.some(r=>r.x===pl.x&&r.y===pl.y);
  if(hidden&&!wasH)snd('hide');else snd('step');
  const si=spice.findIndex(s=>s.x===nx&&s.y===ny);if(si>=0){spice.splice(si,1);pl.sp++;snd('spice')}
  document.getElementById('hud-spice').textContent=`◆ ${pl.sp}/${LV[lvl].sp.length}`;
  document.getElementById('hud-steps').textContent=`↦ ${pl.st}`;
  if(!hidden)for(const w of worms)for(const s of w.seg)if(s.x===pl.x&&s.y===pl.y){die();return true}
  if(spice.length===0&&pl.alive){winning=true;setTimeout(()=>winLvl(),500)}
  return true;
}
function die(){pl.alive=false;running=false;if(af)cancelAnimationFrame(af);stopCode();snd('die');document.getElementById('canvas-wrap').classList.add('shake');setTimeout(()=>document.getElementById('canvas-wrap').classList.remove('shake'),400);setTimeout(()=>showOv('ov-death'),350)}
function codeFail(){
  // Code finished but spice remains
  snd('fail');
  document.getElementById('fail-msg').textContent=`Tu código terminó pero faltaron ${spice.length} especia${spice.length>1?'s':''}. Modifica tu código y vuelve a intentar.`;
  setTimeout(()=>showOv('ov-fail'),300);
}
function winLvl(){
  running=false;if(af)cancelAnimationFrame(af);stopCode();winning=false;snd('win');
  const l=LV[lvl];
  const stars=pl.st<=l.par?3:pl.st<=l.par*1.5?2:1;
  const lvlScore=stars*100+Math.max(0,(l.par*3-pl.st)*5);
  totalScore+=lvlScore;
  document.getElementById('hud-score').textContent=`★ ${totalScore}`;
  if(lvl>=10){setTimeout(showEnd,400);return}
  document.getElementById('win-t').textContent=`¡NIVEL ${lvl} COMPLETADO!`;
  document.getElementById('win-m').textContent=`${pl.st} pasos (óptimo: ${l.par}) · +${lvlScore} pts`;
  document.getElementById('win-stars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  document.getElementById('win-concept').textContent=l.winMsg;
  showOv('ov-win');
}

// ══════════════════════════════════════════════════════
// SENSORS — directional
// ══════════════════════════════════════════════════════
const DIRS={arriba:{x:0,y:-1},abajo:{x:0,y:1},izquierda:{x:-1,y:0},derecha:{x:1,y:0}};

function senseGusanoDir(dir,maxD){
  const d=DIRS[dir];if(!d)return false;
  for(let i=1;i<=maxD;i++){
    const cx=pl.x+d.x*i,cy=pl.y+d.y*i;
    if(cx<0||cx>=COLS||cy<0||cy>=ROWS)break;
    for(const w of worms)for(const s of w.seg)if(s.x===cx&&s.y===cy)return true;
  }
  return false;
}
function senseEspecia(dir,maxD){
  const d=DIRS[dir];if(!d)return false;
  for(let i=1;i<=maxD;i++){const cx=pl.x+d.x*i,cy=pl.y+d.y*i;if(cx<0||cx>=COLS||cy<0||cy>=ROWS)break;if(spice.some(s=>s.x===cx&&s.y===cy))return true}
  return false;
}
function senseDuna(dir,maxD){
  const d=DIRS[dir];if(!d)return false;
  for(let i=1;i<=maxD;i++){const cx=pl.x+d.x*i,cy=pl.y+d.y*i;if(cx<0||cx>=COLS||cy<0||cy>=ROWS)break;if(LV[lvl].rk.some(r=>r.x===cx&&r.y===cy))return true}
  return false;
}
function senseBorde(dir,maxD){
  const d=DIRS[dir];if(!d)return false;
  for(let i=1;i<=maxD;i++){const cx=pl.x+d.x*i,cy=pl.y+d.y*i;if(cx<0||cx>=COLS||cy<0||cy>=ROWS)return true}
  return false;
}

// ══════════════════════════════════════════════════════
// PROGRAMMING ENGINE
// ══════════════════════════════════════════════════════
function parse(src){
  const ls=src.split('\n').map(l=>l.trimEnd());let p=0;
  function pb(ind){const c=[];while(p<ls.length){const r=ls[p],t=r.trim();if(!t||t.startsWith('//')){p++;continue}const ci=r.length-r.trimStart().length;if(ci<ind&&t!=='fin'&&t!=='sino:')break;if(t==='fin'){p++;break}if(t==='sino:')break;
  const mv=t.match(/^(arriba|abajo|izquierda|derecha|esperar)\s*\(\s*(\d+)\s*\)$/i);if(mv){c.push({t:'m',c:mv[1].toLowerCase(),n:parseInt(mv[2])});p++;continue}
  const rp=t.match(/^repetir\s*\(\s*(\d+)\s*\)\s*:?$/i);if(rp){p++;c.push({t:'r',n:parseInt(rp[1]),b:pb(ci+1)});continue}
  // si_gusano(dir,n):
  const gd=t.match(/^si_gusano\s*\(\s*(arriba|abajo|izquierda|derecha)\s*,\s*(\d+)\s*\)\s*:?$/i);
  if(gd){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'gd',dir:gd[1].toLowerCase(),d:parseInt(gd[2]),th,el});continue}
  // si_especia(dir,n):
  const sp=t.match(/^si_especia\s*\(\s*(arriba|abajo|izquierda|derecha)\s*,\s*(\d+)\s*\)\s*:?$/i);
  if(sp){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'se',dir:sp[1].toLowerCase(),d:parseInt(sp[2]),th,el});continue}
  // si_duna(dir,n):
  const dn=t.match(/^si_duna\s*\(\s*(arriba|abajo|izquierda|derecha)\s*,\s*(\d+)\s*\)\s*:?$/i);
  if(dn){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'sd',dir:dn[1].toLowerCase(),d:parseInt(dn[2]),th,el});continue}
  // si_borde(dir,n):
  const bd=t.match(/^si_borde\s*\(\s*(arriba|abajo|izquierda|derecha)\s*,\s*(\d+)\s*\)\s*:?$/i);
  if(bd){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'sb',dir:bd[1].toLowerCase(),d:parseInt(bd[2]),th,el});continue}
  // si_oculto():
  const hd=t.match(/^si_oculto\s*\(\s*\)\s*:?$/i);
  if(hd){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'sh',th,el});continue}
  // legacy si_gusano_cerca(n):
  const gc=t.match(/^si_gusano_cerca\s*\(\s*(\d+)\s*\)\s*:?$/i);
  if(gc){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'gc',d:parseInt(gc[1]),th,el});continue}
  c.push({t:'e',l:t});p++}return c}return pb(0)}

function flat(ast){const q=[];function w(ns){for(const n of ns){if(n.t==='e'){q.push(n);return}if(n.t==='m')for(let i=0;i<n.n;i++)q.push({t:'m',c:n.c});if(n.t==='r')for(let i=0;i<n.n;i++)w(n.b);if('th'in n)q.push(n)}}w(ast);return q}

function runCode(){
  if(codeOn)return;
  // Reset player to start position on each run
  const l=LV[lvl];
  pl.x=l.pp.x;pl.y=l.pp.y;pl.sp=0;pl.st=0;pl.alive=true;hidden=false;winning=false;
  spice=l.sp.map(s=>({...s}));
  // Reset worms to start
  worms.forEach((w,i)=>{const wp=l.worms[i];w.seg=[];for(let j=0;j<l.wl;j++)w.seg.push({x:wp.x-j,y:wp.y});w.mt=0;w.sc=0;w.ws=0});
  document.getElementById('hud-spice').textContent=`◆ 0/${l.sp.length}`;
  document.getElementById('hud-steps').textContent='↦ 0';
  hideOv();

  const r=document.getElementById('code').value.trim();if(!r)return;
  const con=document.getElementById('console');con.classList.add('on');con.innerHTML='';
  const ast=parse(r);let er=[];(function f(ns){for(const n of ns){if(n.t==='e')er.push(n.l);if(n.th)f(n.th);if(n.el)f(n.el);if(n.b)f(n.b)}})(ast);
  if(er.length){logC(`✗ Error: "${er[0]}"`,'e');logC('Revisa la sintaxis','e');return}
  cq=flat(ast);
  logC('▶ Ejecutando...','s');
  document.getElementById('ed-status').textContent='EJECUTANDO';
  wormActive=true; // now worms start chasing
  if(!running){running=true;loop()}
  codeOn=true;exN();
}

function exN(){
  if(!codeOn||cq.length===0){
    codeOn=false;wormActive=false;
    if(pl.alive&&!winning){
      if(spice.length>0){
        logC(`✗ Faltan ${spice.length} especia${spice.length>1?'s':''}`,'e');
        logC('Modifica tu código y vuelve a ejecutar','e');
        document.getElementById('ed-status').textContent='INCOMPLETO';
        codeFail();
      }else{
        logC('✓ ¡Completado!','s');
        document.getElementById('ed-status').textContent='COMPLETO';
      }
    }
    return;
  }
  if(grace>0){ct=setTimeout(exN,100);return}
  const i=cq.shift();
  if(i.t==='m'){let ok=true;switch(i.c){case'arriba':ok=movePl(0,-1);break;case'abajo':ok=movePl(0,1);break;case'izquierda':ok=movePl(-1,0);break;case'derecha':ok=movePl(1,0);break;case'esperar':break}if(!ok){logC(`✗ Bloqueado: ${i.c}`,'e');codeOn=false;wormActive=false;document.getElementById('ed-status').textContent='BLOQUEADO';return}}
  // Directional sensors
  if(i.t==='gd'){const f=senseGusanoDir(i.dir,i.d);const br=f?i.th:i.el;logC(`  gusano ${i.dir}(${i.d})? ${f?'SÍ ⚠':'NO'}`,'i');cq=flat(br).concat(cq)}
  if(i.t==='gc'){let m=999;for(const w of worms){const h=w.seg[0];m=Math.min(m,Math.abs(pl.x-h.x)+Math.abs(pl.y-h.y))}const f=m<=i.d;const br=f?i.th:i.el;logC(`  gusano_cerca(${i.d})? dist=${m} ${f?'SÍ':'NO'}`,'i');cq=flat(br).concat(cq)}
  if(i.t==='se'){const f=senseEspecia(i.dir,i.d);const br=f?i.th:i.el;logC(`  especia ${i.dir}? ${f?'SÍ ◆':'NO'}`,'i');cq=flat(br).concat(cq)}
  if(i.t==='sd'){const f=senseDuna(i.dir,i.d);const br=f?i.th:i.el;logC(`  duna ${i.dir}? ${f?'SÍ ⛰':'NO'}`,'i');cq=flat(br).concat(cq)}
  if(i.t==='sb'){const f=senseBorde(i.dir,i.d);const br=f?i.th:i.el;logC(`  borde ${i.dir}(${i.d})? ${f?'SÍ ▧':'NO'}`,'i');cq=flat(br).concat(cq)}
  if(i.t==='sh'){const br=hidden?i.th:i.el;logC(`  oculto? ${hidden?'SÍ':'NO'}`,'i');cq=flat(br).concat(cq)}
  if(!pl.alive||(!running&&!winning)){codeOn=false;wormActive=false;document.getElementById('ed-status').textContent='DETENIDO';return}
  ct=setTimeout(exN,200);
}
function stopCode(){codeOn=false;wormActive=false;cq=[];if(ct)clearTimeout(ct);document.getElementById('ed-status').textContent='LISTO'}
function logC(m,t=''){const e=document.getElementById('console'),l=document.createElement('div');l.className='log '+t;l.textContent=m;e.appendChild(l);e.scrollTop=e.scrollHeight}

// ══════════════════════════════════════════════════════
// RENDERING
// ══════════════════════════════════════════════════════
function draw(){cx.clearRect(0,0,W,H);drDesert();drGrid();drMtns();drSpice();for(const w of worms){drWmTrail(w);drWm(w)}if(pl.alive)drPl();drHud();drTremor();if(grace>0)drShield()}

function drDesert(){const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#c9952a');g.addColorStop(1,'#8b6914');cx.fillStyle=g;cx.fillRect(0,0,W,H);cx.save();cx.globalAlpha=.15;for(let i=0;i<2000;i++){const x=((Math.sin(i)*13.7*W)%W+W)%W,y=((Math.cos(i)*17.3*H)%H+H)%H;cx.fillStyle=i%2===0?'#fff':'#000';cx.fillRect(x,y,1,1)}cx.restore();dw.forEach(d=>{cx.save();cx.translate(d.x,d.y);cx.rotate(d.a);const dg=cx.createLinearGradient(0,-d.h,0,d.h);dg.addColorStop(0,'rgba(0,0,0,0.2)');dg.addColorStop(1,'transparent');cx.fillStyle=dg;cx.beginPath();cx.ellipse(0,0,d.w,d.h,0,0,Math.PI*2);cx.fill();cx.restore()});cx.globalAlpha=.015;cx.fillStyle='#fff';for(let y=0;y<H;y+=20)cx.fillRect(Math.sin((y+ft*.4)*.05)*5,y,W,1);cx.globalAlpha=1}
function drGrid(){cx.strokeStyle='rgba(0,0,0,.03)';cx.lineWidth=.5;for(let x=0;x<=W;x+=TILE){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke()}for(let y=0;y<=H;y+=TILE){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()}}
function drMtns(){const l=LV[lvl];for(const r of l.rk){const x=r.x*TILE,y=r.y*TILE,mx=x+TILE/2,my=y+TILE/2,here=pl.x===r.x&&pl.y===r.y;cx.globalAlpha=.2;cx.fillStyle='#1a0a00';cx.beginPath();cx.ellipse(mx+3,my+7,18,7,0,0,Math.PI*2);cx.fill();cx.globalAlpha=1;cx.fillStyle=here?'#3d4f60':'#4a3c2a';cx.beginPath();cx.moveTo(x-3,y+TILE);cx.lineTo(x+5,y+10);cx.lineTo(mx-1,y-3);cx.lineTo(mx+4,y+4);cx.lineTo(x+TILE-3,y-5);cx.lineTo(x+TILE+3,y+9);cx.lineTo(x+TILE+3,y+TILE);cx.closePath();cx.fill();cx.fillStyle=here?'#506878':'#6d5a3a';cx.beginPath();cx.moveTo(mx-1,y-3);cx.lineTo(mx+4,y+4);cx.lineTo(x+TILE-3,y-5);cx.lineTo(x+TILE+3,y+9);cx.lineTo(x+TILE+3,y+TILE);cx.lineTo(mx,y+TILE);cx.closePath();cx.fill();cx.fillStyle='#c8b8a8';cx.globalAlpha=.5;cx.beginPath();cx.moveTo(mx-1,y-3);cx.lineTo(mx+3,y+3);cx.lineTo(mx-5,y+5);cx.closePath();cx.fill();cx.beginPath();cx.moveTo(x+TILE-3,y-5);cx.lineTo(x+TILE+1,y+2);cx.lineTo(x+TILE-7,y+3);cx.closePath();cx.fill();cx.globalAlpha=1;if(here){cx.globalAlpha=.12+Math.sin(ft*.06)*.06;cx.strokeStyle='#4fc3f7';cx.lineWidth=2;cx.setLineDash([4,3]);cx.beginPath();cx.arc(mx,my,22,0,Math.PI*2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1}else if(worms.length>0&&Math.abs(pl.x-r.x)<=2&&Math.abs(pl.y-r.y)<=2){cx.globalAlpha=.18;cx.fillStyle='#4fc3f7';cx.font='9px Rajdhani';cx.textAlign='center';cx.fillText('⛰',mx,y+TILE+9);cx.globalAlpha=1}}}
function drSpice(){for(const s of spice){const x=s.x*TILE+TILE/2,y=s.y*TILE+TILE/2,p=Math.sin(ft*.07+s.x)*.3+.7,gl=Math.sin(ft*.05+s.y)*3+13;cx.globalAlpha=.12*p;const g=cx.createRadialGradient(x,y,1,x,y,gl);g.addColorStop(0,'#ff9f43');g.addColorStop(1,'transparent');cx.fillStyle=g;cx.fillRect(x-gl,y-gl,gl*2,gl*2);cx.globalAlpha=.92;cx.fillStyle='#e85d10';cx.beginPath();cx.moveTo(x,y-9);cx.lineTo(x+7,y);cx.lineTo(x,y+9);cx.lineTo(x-7,y);cx.closePath();cx.fill();cx.fillStyle='#ffcc02';cx.beginPath();cx.moveTo(x,y-5);cx.lineTo(x+4,y);cx.lineTo(x,y+5);cx.lineTo(x-4,y);cx.closePath();cx.fill();cx.fillStyle='#fff';cx.globalAlpha=p*.5;cx.beginPath();cx.arc(x-2,y-3,1.2,0,Math.PI*2);cx.fill();cx.globalAlpha=1}}
function drWmTrail(w){cx.globalAlpha=.04;cx.fillStyle='#3e2723';for(const s of w.seg){cx.beginPath();cx.ellipse(s.x*TILE+TILE/2+2,s.y*TILE+TILE/2+3,14,6,0,0,Math.PI*2);cx.fill()}cx.globalAlpha=1}
function drWm(w){const cols=[['#5d4037','#4e342e','#6d4c41','#8d6e63'],['#4a148c','#38006b','#6a1b9a','#9c27b0']][w.hue%2];const ss=w.seg;for(let i=ss.length-1;i>=0;i--){const s=ss[i],x=s.x*TILE+TILE/2,y=s.y*TILE+TILE/2,wb=Math.sin(ft*.08+i*.8)*2,t=i/(ss.length-1),r=16-t*7;if(i===0){const j=w.jo*.3;cx.fillStyle=cols[1];cx.beginPath();cx.arc(x+wb,y,r+2,0,Math.PI*2);cx.fill();cx.fillStyle=cols[0];cx.beginPath();cx.arc(x+wb,y,r,0,Math.PI*2);cx.fill();cx.fillStyle=cols[1];cx.beginPath();cx.arc(x+wb,y-j*10,r-2,Math.PI+.3,-.3);cx.closePath();cx.fill();cx.beginPath();cx.arc(x+wb,y+j*10,r-2,.3,Math.PI-.3);cx.closePath();cx.fill();if(w.jo>.2){cx.fillStyle='#b71c1c';cx.globalAlpha=w.jo;cx.beginPath();cx.ellipse(x+wb,y,r-4,j*8,0,0,Math.PI*2);cx.fill();cx.globalAlpha=1}cx.fillStyle='#ffecb3';for(let t=0;t<4;t++){const a=(t/4)*Math.PI-Math.PI/2,tx=x+wb+Math.cos(a)*(r-3),ty=y-j*8+Math.sin(a)*3;cx.beginPath();cx.moveTo(tx-1.5,ty);cx.lineTo(tx,ty+4+j*3);cx.lineTo(tx+1.5,ty);cx.fill()}for(let t=0;t<4;t++){const a=(t/4)*Math.PI+Math.PI/2,tx=x+wb+Math.cos(a)*(r-3),ty=y+j*8+Math.sin(a)*3;cx.beginPath();cx.moveTo(tx-1.5,ty);cx.lineTo(tx,ty-4-j*3);cx.lineTo(tx+1.5,ty);cx.fill()}const eg=Math.sin(ft*.1)*.3+.7;cx.globalAlpha=.35*eg;cx.fillStyle='#ff1744';cx.beginPath();cx.arc(x+wb-5,y-6,5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(x+wb+5,y-6,5,0,Math.PI*2);cx.fill();cx.globalAlpha=1;cx.fillStyle='#ff1744';cx.beginPath();cx.arc(x+wb-5,y-6,3.5,0,Math.PI*2);cx.fill();cx.fillStyle='#b71c1c';cx.beginPath();cx.arc(x+wb-5,y-6,1.8,0,Math.PI*2);cx.fill();cx.fillStyle='#ff1744';cx.beginPath();cx.arc(x+wb+5,y-6,3.5,0,Math.PI*2);cx.fill();cx.fillStyle='#b71c1c';cx.beginPath();cx.arc(x+wb+5,y-6,1.8,0,Math.PI*2);cx.fill()}else{cx.fillStyle=t<.5?cols[2]:cols[3];cx.beginPath();cx.arc(x+wb,y,r,0,Math.PI*2);cx.fill();cx.strokeStyle=t<.5?cols[0]:cols[2];cx.lineWidth=1;cx.beginPath();cx.arc(x+wb,y,r-2,0,Math.PI*2);cx.stroke()}}}
function drPl(){const x=pl.x*TILE+TILE/2,y=pl.y*TILE+TILE/2,hover=Math.sin(ft*.1)*2;if(hidden){cx.globalAlpha=.15+Math.sin(ft*.06)*.06;cx.strokeStyle='#4fc3f7';cx.lineWidth=1.5;cx.setLineDash([3,3]);cx.beginPath();cx.arc(x,y,18,0,Math.PI*2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1}cx.globalAlpha=hidden?.05:.12;cx.fillStyle='#1a0e00';cx.beginPath();cx.ellipse(x,y+16,10,4,0,0,Math.PI*2);cx.fill();cx.globalAlpha=hidden?.4:1;cx.fillStyle='#5d4037';cx.beginPath();cx.moveTo(x-10,y+15);cx.quadraticCurveTo(x+Math.sin(ft*.05)*10,y+20,x+10,y+15);cx.lineTo(x,y-5);cx.closePath();cx.fill();cx.fillStyle='#333';cx.beginPath();cx.arc(x,y-8+hover,7,0,Math.PI*2);cx.fill();cx.fillStyle='#00f2ff';cx.shadowBlur=8;cx.shadowColor='#00f2ff';cx.fillRect(x-4,y-10+hover,3,2);cx.fillRect(x+1,y-10+hover,3,2);cx.shadowBlur=0;cx.globalAlpha=1}
function drHud(){const rm=spice.length;cx.globalAlpha=.6;cx.fillStyle='#1a0e00';cx.fillRect(W/2-75,4,150,18);cx.globalAlpha=1;cx.font='bold 11px Rajdhani';cx.textAlign='center';if(rm>0){cx.fillStyle=rm<=1?'#00e676':'#ff9f43';cx.fillText(`◆ ${rm} especia${rm>1?'s':''} restante${rm>1?'s':''}`,W/2,17)}else{cx.fillStyle='#00e676';cx.fillText('✓ ¡Especia recogida!',W/2,17)}if(hidden){cx.globalAlpha=.7;cx.fillStyle='#0d47a1';cx.fillRect(W/2-40,24,80,14);cx.globalAlpha=1;cx.fillStyle='#4fc3f7';cx.font='bold 9px Rajdhani';cx.fillText('⛰ OCULTO',W/2,34)}if(!wormActive&&worms.length>0){cx.globalAlpha=.5;cx.fillStyle='#1a0e00';cx.fillRect(W/2-65,H-22,130,18);cx.globalAlpha=.8;cx.fillStyle='#4fc3f7';cx.font='bold 10px Rajdhani';cx.fillText('☠ Gusano espera tu código',W/2,H-9)}}
function drTremor(){if(!wormActive)return;let minD=999;for(const w of worms){const h=w.seg[0],d=Math.sqrt((pl.x-h.x)**2+(pl.y-h.y)**2);if(d<minD)minD=d}const tr=minD<5&&!hidden?(5-minD)/5:0;if(tr<=0){cv.style.transform='';return}cx.globalAlpha=tr*.06;cx.fillStyle='#ff1744';cx.fillRect(0,0,W,H);cx.globalAlpha=1;if(tr>.5)cv.style.transform=`translate(${(Math.random()-.5)*tr*2}px,${(Math.random()-.5)*tr*2}px)`;else cv.style.transform=''}
function drShield(){const x=pl.x*TILE+TILE/2,y=pl.y*TILE+TILE/2;cx.globalAlpha=Math.sin(ft*.15)*.1+.18;cx.strokeStyle='#4fc3f7';cx.lineWidth=1.5;cx.setLineDash([5,3]);cx.beginPath();cx.arc(x,y,20,0,Math.PI*2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1}

init();
