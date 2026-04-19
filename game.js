// ══════════════════════════════════════════════════════
// ARRAKIS — APRENDE A PROGRAMAR v3
// ══════════════════════════════════════════════════════
const TILE=40,COLS=16,ROWS=12,W=COLS*TILE,H=ROWS*TILE;
let cv,cx,running=false,af=null,ft=0,lvl=1;
let pl,spice,worms=[],hidden=false,grace=0,GRACE=50,winning=false;
let codeOn=false,cq=[],ct=null,wormActive=false,totalScore=0,hintIdx=0;
function resize(){if(!cv)return;const w=document.getElementById('canvas-wrap');if(!w)return;const s=Math.min(w.clientWidth/W,w.clientHeight/H,2);cv.style.width=Math.floor(W*s)+'px';cv.style.height=Math.floor(H*s)+'px'}
window.addEventListener('resize',resize);

// ═══ SFX ═══
let sfxC=null;function initSfx(){if(!sfxC)sfxC=new(window.AudioContext||window.webkitAudioContext)();if(sfxC.state==='suspended')sfxC.resume()}
function snd(t){initSfx();const T=sfxC.currentTime;if(t==='step'){const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='square';o.frequency.value=80+Math.random()*30;g.gain.setValueAtTime(.05,T);g.gain.exponentialRampToValueAtTime(.001,T+.06);const f=sfxC.createBiquadFilter();f.type='bandpass';f.frequency.value=400;o.connect(f);f.connect(g);g.connect(sfxC.destination);o.start(T);o.stop(T+.06)}else if(t==='hide'){const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='sine';o.frequency.setValueAtTime(220,T);o.frequency.exponentialRampToValueAtTime(330,T+.12);g.gain.setValueAtTime(.07,T);g.gain.exponentialRampToValueAtTime(.001,T+.25);o.connect(g);g.connect(sfxC.destination);o.start(T);o.stop(T+.25)}else if(t==='spice'){[523,659,784].forEach((f,i)=>{const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.09,T+i*.05);g.gain.exponentialRampToValueAtTime(.001,T+i*.05+.15);o.connect(g);g.connect(sfxC.destination);o.start(T+i*.05);o.stop(T+i*.05+.15)})}else if(t==='win'){[392,494,587,784].forEach((f,i)=>{const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.07,T+i*.1);g.gain.exponentialRampToValueAtTime(.001,T+i*.1+.3);o.connect(g);g.connect(sfxC.destination);o.start(T+i*.1);o.stop(T+i*.1+.3)})}else if(t==='die'){const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(120,T);o.frequency.exponentialRampToValueAtTime(30,T+.45);g.gain.setValueAtTime(.1,T);g.gain.exponentialRampToValueAtTime(.001,T+.45);const f=sfxC.createBiquadFilter();f.type='lowpass';f.frequency.value=200;o.connect(f);f.connect(g);g.connect(sfxC.destination);o.start(T);o.stop(T+.45)}else if(t==='fail'){const o=sfxC.createOscillator(),g=sfxC.createGain();o.type='triangle';o.frequency.setValueAtTime(300,T);o.frequency.exponentialRampToValueAtTime(150,T+.25);g.gain.setValueAtTime(.08,T);g.gain.exponentialRampToValueAtTime(.001,T+.25);o.connect(g);g.connect(sfxC.destination);o.start(T);o.stop(T+.25)}}

// ═══ MUSIC ═══
let ac=null,mp=false,mn=[];function startMusic(){if(mp)return;if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();mn=[];const m=ac.createGain();m.gain.value=.11;m.connect(ac.destination);function o(t,f,g,ft,ff){const os=ac.createOscillator();os.type=t;os.frequency.value=f;const gn=ac.createGain();gn.gain.value=g;if(ft){const fl=ac.createBiquadFilter();fl.type=ft;fl.frequency.value=ff;os.connect(fl);fl.connect(gn)}else os.connect(gn);gn.connect(m);os.start();mn.push(os);return os}o('sawtooth',55,.25,'lowpass',120);o('sine',27.5,.2);const p=o('sine',220,.03);const lf=ac.createOscillator();lf.type='sine';lf.frequency.value=.12;const lg=ac.createGain();lg.gain.value=8;lf.connect(lg);lg.connect(p.frequency);lf.start();mn.push(lf);const buf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const ws=ac.createBufferSource();ws.buffer=buf;ws.loop=true;const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=500;wf.Q.value=.5;const wg=ac.createGain();wg.gain.value=.04;ws.connect(wf);wf.connect(wg);wg.connect(m);ws.start();mn.push(ws);mp=true;document.getElementById('music-btn').classList.add('active')}
function stopMusic(){mn.forEach(n=>{try{n.stop()}catch(e){}});mn=[];mp=false;document.getElementById('music-btn').classList.remove('active')}
function toggleMusic(){mp?stopMusic():startMusic()}

// ══════════════════════════════════════════════════════
// NIVELES
// patrol: array de waypoints para gusano predecible (niveles 6-8)
// chase: true = IA de persecución (niveles 9-10)
// ══════════════════════════════════════════════════════
const LV={
1:{name:'Primer Comando',concept:'Comandos Básicos',par:5,
  tut:'La especia ◆ está a tu derecha. Escribe un comando para llegar. El formato es: <code>derecha(número)</code><span class="tut-new">NUEVO: derecha(n), izquierda(n), arriba(n), abajo(n)</span>',
  hints:['La especia está en línea recta. Cuenta las celdas entre tú y la especia.','Son 5 celdas a la derecha. El comando es <code>derecha(número)</code>.','Escribe: <code>derecha(5)</code>'],
  ws:99,wl:0,pp:{x:2,y:5},worms:[],sp:[{x:7,y:5}],rk:[],blocks:['move'],winMsg:'¡Aprendiste tu primer comando!'},
2:{name:'Dos Direcciones',concept:'Secuencia',par:7,
  tut:'La especia no está en línea recta. Escribe <b>dos comandos</b>, uno debajo del otro.',
  hints:['Necesitas moverte en dos direcciones distintas.','Primero cuenta cuántas celdas a la derecha, luego cuántas hacia abajo.','Necesitas 4 a la derecha y 3 abajo. Escribe:<br><code>derecha(4)</code><br><code>abajo(3)</code>'],
  ws:99,wl:0,pp:{x:1,y:1},worms:[],sp:[{x:5,y:4}],rk:[],blocks:['move'],winMsg:'¡Un programa es una secuencia de instrucciones!'},
3:{name:'Rodear Obstáculos',concept:'Planificación',par:16,
  tut:'Las montañas ⛰ bloquean el paso. Recoge las <b>2 especias</b> encontrando un camino alrededor.',
  hints:['No puedes atravesar montañas. Busca un camino que las rodee.','Intenta: bajar primero, luego ir a la derecha para rodear las montañas.','Una ruta posible: <code>abajo(4)</code>, <code>derecha(3)</code> (primera especia), luego sigue a la segunda.'],
  ws:99,wl:0,pp:{x:1,y:1},worms:[],sp:[{x:4,y:5},{x:9,y:3}],rk:[{x:4,y:2},{x:4,y:3},{x:4,y:4},{x:7,y:5},{x:7,y:6}],blocks:['move'],winMsg:'¡Planificar rutas es diseñar algoritmos!'},
4:{name:'No Te Repitas',concept:'Bucles',par:8,
  tut:'Las especias siguen un patrón repetitivo. En vez de escribir lo mismo muchas veces, usa: <code>repetir(n):</code> con las instrucciones adentro y <code>fin</code> al cerrar.<span class="tut-new">NUEVO: repetir(n): ... fin</span>',
  hints:['Observa las 4 especias: cada una está 2 celdas a la derecha y 1 abajo de la anterior.','El patrón es: <code>derecha(2)</code> luego <code>abajo(1)</code>. Se repite 4 veces.','Usa:<br><code>repetir(4):</code><br><code>  derecha(2)</code><br><code>  abajo(1)</code><br><code>fin</code>'],
  ws:99,wl:0,pp:{x:0,y:0},worms:[],sp:[{x:2,y:1},{x:4,y:2},{x:6,y:3},{x:8,y:4}],rk:[],blocks:['move','loop'],winMsg:'¡Los bucles evitan repetir código!'},
5:{name:'Zigzag',concept:'Patrones',par:16,
  tut:'Las especias forman un zigzag. Observa el patrón y usa <code>repetir()</code> para automatizarlo.',
  hints:['Mira las posiciones: derecha, abajo, izquierda, abajo... es un zigzag.','El patrón base es: <code>derecha(3)</code>, <code>abajo(2)</code>, <code>izquierda(3)</code>, <code>abajo(2)</code>.','Usa <code>repetir(2):</code> con el patrón zigzag adentro y <code>fin</code> al final.'],
  ws:99,wl:0,pp:{x:0,y:0},worms:[],sp:[{x:3,y:0},{x:0,y:2},{x:3,y:4},{x:0,y:6}],rk:[{x:1,y:1},{x:2,y:1},{x:1,y:3},{x:2,y:3},{x:1,y:5},{x:2,y:5}],blocks:['move','loop'],winMsg:'¡Dominas los patrones!'},
6:{name:'Peligro Predecible',concept:'Detectar y Huir',par:14,canCont:true,
  tut:'¡Shai-Hulud aparece! Recorre un camino <b>fijo y predecible</b>. Obsérvalo antes de ejecutar. Usa <code>si_peligro(n):</code> y <code>huir()</code> para escapar automáticamente en dirección contraria.<span class="tut-new">NUEVO: si_peligro(n), huir(), esconderse()</span>',
  hints:['Observa el gusano: se mueve en un patrón que se repite. Puedes predecir dónde estará.','Usa <code>si_peligro(4):</code> antes de moverte. Si detecta peligro, <code>huir()</code> te aleja automáticamente.','Puedes usar ▶+ Continuar para avanzar paso a paso y observar al gusano.'],
  prefill:'// Observa el gusano, luego ejecuta\n// Usa ▶+ Continuar para ir paso a paso\nderecha(3)\nsi_peligro(4):\n  huir()\nfin\nderecha(3)',
  ws:26,wl:4,pp:{x:0,y:3},
  worms:[{x:10,y:2,patrol:[{x:10,y:2},{x:14,y:2},{x:14,y:8},{x:10,y:8},{x:10,y:2}]}],
  sp:[{x:5,y:1},{x:12,y:5},{x:7,y:8}],
  rk:[{x:3,y:5},{x:3,y:6},{x:8,y:3},{x:8,y:4},{x:12,y:7},{x:12,y:8}],
  blocks:['move','loop','danger'],winMsg:'¡Puedes detectar y esquivar peligro!'},
7:{name:'Buscar y Escapar',concept:'Sensores Inteligentes',par:18,canCont:true,
  tut:'Ahora puedes usar <code>ir_a_especia()</code> para moverte automáticamente hacia la especia más cercana, y <code>ir_a_refugio()</code> para ir a la montaña más cercana.<span class="tut-new">NUEVO: ir_a_especia(), ir_a_refugio()</span>',
  hints:['Combina <code>ir_a_especia()</code> con <code>si_peligro(4):</code> para buscar especia pero escapar si hay peligro.','Dentro de un <code>repetir()</code> grande, alterna entre buscar especia y revisar peligro.','Usa <code>▶+ Continuar</code> para avanzar de a poco y ajustar tu estrategia.'],
  prefill:'// Busca especia, escapa del peligro\nrepetir(8):\n  si_peligro(4):\n    huir()\n  sino:\n    ir_a_especia()\n  fin\nfin',
  ws:24,wl:4,pp:{x:0,y:0},
  worms:[{x:12,y:6,patrol:[{x:12,y:6},{x:12,y:0},{x:4,y:0},{x:4,y:6},{x:12,y:6}]}],
  sp:[{x:6,y:1},{x:2,y:5},{x:10,y:3},{x:14,y:9}],
  rk:[{x:3,y:2},{x:3,y:3},{x:8,y:5},{x:8,y:6},{x:13,y:3},{x:13,y:4},{x:6,y:8},{x:6,y:9}],
  blocks:['move','loop','danger','smart'],winMsg:'¡Tu programa busca y esquiva solo!'},
8:{name:'Refugio Estratégico',concept:'Esconderse',par:20,canCont:true,
  tut:'Gusano más rápido pero predecible. Usa <code>ir_a_refugio()</code> para llegar a una montaña y <code>esconderse()</code> para esperar seguro. Desde ahí el gusano pierde tu rastro.',
  hints:['Cuando el peligro es alto, ve a una montaña y espera. El gusano pasará de largo.','Patrón: recoger especia → detectar peligro → <code>ir_a_refugio()</code> → <code>esconderse()</code> → seguir.','Usa <code>▶+ Continuar</code>. Cada vez que el gusano pase, escribe más código para el siguiente tramo.'],
  prefill:'// Avanza con precaución\nrepetir(6):\n  si_peligro(5):\n    ir_a_refugio()\n    esconderse()\n  sino:\n    ir_a_especia()\n  fin\nfin',
  ws:16,wl:5,pp:{x:0,y:6},
  worms:[{x:8,y:0,patrol:[{x:8,y:0},{x:14,y:0},{x:14,y:10},{x:8,y:10},{x:8,y:0}]}],
  sp:[{x:3,y:1},{x:11,y:2},{x:14,y:7},{x:5,y:10},{x:1,y:8}],
  rk:[{x:4,y:3},{x:4,y:4},{x:10,y:4},{x:10,y:5},{x:13,y:5},{x:13,y:6},{x:3,y:7},{x:3,y:8},{x:7,y:9},{x:7,y:10}],
  blocks:['move','loop','danger','smart'],winMsg:'¡Dominas el arte del refugio!'},
9:{name:'Caza Activa',concept:'Gusanos que Persiguen',par:24,canCont:true,
  tut:'2 gusanos que ahora <b>te persiguen activamente</b>. Ya no son predecibles. Combina todos los sensores: <code>si_peligro()</code>, <code>huir()</code>, <code>ir_a_refugio()</code>, <code>ir_a_especia()</code>.',
  hints:['Los gusanos te siguen. Necesitas moverte rápido y usar refugios como paradas.','Alterna: recoger especia → revisar peligro → escapar o esconderse → repetir.','Usa <code>▶+ Continuar</code> para planificar cada tramo. No intentes hacer todo de una vez.'],
  prefill:'// Los gusanos te persiguen - sé rápido\nrepetir(10):\n  si_peligro(4):\n    ir_a_refugio()\n    esconderse()\n  sino:\n    ir_a_especia()\n  fin\nfin',
  ws:14,wl:5,pp:{x:0,y:0},chase:true,
  worms:[{x:10,y:4},{x:14,y:10}],
  sp:[{x:4,y:2},{x:12,y:1},{x:14,y:7},{x:7,y:9},{x:2,y:8}],
  rk:[{x:3,y:3},{x:3,y:4},{x:7,y:2},{x:7,y:3},{x:11,y:5},{x:11,y:6},{x:5,y:7},{x:5,y:8},{x:10,y:9},{x:10,y:10},{x:14,y:3},{x:14,y:4}],
  blocks:['move','loop','danger','smart'],winMsg:'¡Sobreviviste a la caza activa!'},
10:{name:'Maestro Fremen',concept:'Desafío Final',par:28,canCont:true,
  tut:'Prueba final: 2 gusanos rápidos que te persiguen. Usa <b>todo</b> lo que aprendiste. Planifica, ejecuta paso a paso con ▶+ Continuar.',
  hints:['Planifica tu ruta en papel antes de escribir código.','Identifica los refugios en el mapa. Planea parar en cada uno.','Usa <code>▶+ Continuar</code> para cada tramo entre refugios. No necesitas hacerlo todo en un solo programa.'],
  prefill:'// Desafío final - usa todo\n// Escribe tu estrategia paso a paso\n// Usa ▶+ Continuar entre tramos',
  ws:10,wl:6,pp:{x:0,y:5},chase:true,
  worms:[{x:8,y:2},{x:12,y:10}],
  sp:[{x:3,y:1},{x:7,y:0},{x:13,y:3},{x:14,y:8},{x:8,y:10},{x:2,y:9}],
  rk:[{x:3,y:3},{x:3,y:4},{x:6,y:3},{x:6,y:4},{x:10,y:5},{x:10,y:6},{x:13,y:5},{x:13,y:6},{x:5,y:8},{x:5,y:9},{x:11,y:8},{x:11,y:9}],
  blocks:['move','loop','danger','smart'],winMsg:'¡Eres un Maestro Fremen!'}
};

let sg=[],dw=[];function genTex(){sg=[];for(let i=0;i<300;i++)sg.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.3,s:Math.random(),o:Math.random()*.12+.03});dw=[];for(let i=0;i<10;i++)dw.push({x:Math.random()*W,y:Math.random()*H,w:Math.random()*180+50,h:Math.random()*14+4,a:Math.random()*.4-.2,s:Math.random()*.06+.02})}
function buildLS(){const g=document.getElementById('ls-grid');g.innerHTML='';for(let i=1;i<=10;i++){const l=LV[i],c=document.createElement('div');c.className='ls-card';c.innerHTML=`<div class="ls-num">${i}</div><div class="ls-tag">${l.concept}</div>`;c.onclick=()=>{closeLevelSelect();lvl=i;startFromLevel()};g.appendChild(c)}}
function selectLevel(){buildLS();document.getElementById('level-select').classList.add('on')}
function closeLevelSelect(){document.getElementById('level-select').classList.remove('on')}
function init(){cv=document.getElementById('c');cx=cv.getContext('2d');cv.width=W;cv.height=H;resize()}
function startGame(){lvl=1;totalScore=0;startFromLevel()}
function startFromLevel(){document.getElementById('start-screen').classList.add('hide');document.getElementById('game').classList.add('on');closeLevelSelect();startMusic();loadLvl(lvl);setTimeout(resize,80)}
function backToMenu(){running=false;if(af)cancelAnimationFrame(af);stopCode();stopMusic();document.getElementById('game').classList.remove('on');document.getElementById('start-screen').classList.remove('hide');hideOv()}

function loadLvl(n){
  const l=LV[n];if(!l)return;hideOv();stopCode();closeHint();lvl=n;winning=false;wormActive=false;hintIdx=0;
  pl={x:l.pp.x,y:l.pp.y,sp:0,st:0,alive:true};hidden=false;
  spice=l.sp.map(s=>({...s}));
  worms=l.worms.map((w,i)=>{const seg=[];for(let j=0;j<l.wl;j++)seg.push({x:w.x-j,y:w.y});return{seg,mt:0,mi:l.ws,jo:0,jd:1,wd:null,ws:0,sc:0,hue:i,patrol:w.patrol||null,pi:0}});
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
  document.getElementById('bk-danger').style.display=l.blocks.includes('danger')?'flex':'none';
  document.getElementById('bk-smart').style.display=l.blocks.includes('smart')?'flex':'none';
  document.getElementById('btn-cont').style.display=l.canCont?'flex':'none';
  document.getElementById('ann-lvl').textContent=`NIVEL ${n}`;
  document.getElementById('ann-name').textContent=l.name;
  showOv('ov-lvl');
  const ed=document.getElementById('code');
  if(!ed.value.trim()&&l.prefill)ed.value=l.prefill;
  const c=document.getElementById('console');c.innerHTML='';c.classList.remove('on');
  document.getElementById('ed-status').textContent='LISTO';
  running=true;if(af)cancelAnimationFrame(af);loop();
  setTimeout(()=>document.getElementById('ov-lvl').classList.remove('on'),1400);
  setTimeout(resize,100);
}
function resetLevel(){hideOv();stopCode();const l=LV[lvl];
  pl={x:l.pp.x,y:l.pp.y,sp:0,st:0,alive:true};hidden=false;winning=false;wormActive=false;
  spice=l.sp.map(s=>({...s}));
  worms=l.worms.map((w,i)=>{const seg=[];for(let j=0;j<l.wl;j++)seg.push({x:w.x-j,y:w.y});return{seg,mt:0,mi:l.ws,jo:0,jd:1,wd:null,ws:0,sc:0,hue:i,patrol:w.patrol||null,pi:0}});
  genTex();grace=0;
  document.getElementById('hud-spice').textContent=`◆ 0/${l.sp.length}`;
  document.getElementById('hud-steps').textContent='↦ 0';document.getElementById('hud-hidden').style.display='none';
  const c=document.getElementById('console');c.innerHTML='';c.classList.remove('on');
  document.getElementById('ed-status').textContent='LISTO';
  if(!running){running=true;loop()}}
function nextLevel(){if(lvl>=10){showEnd();return}hideOv();document.getElementById('code').value='';loadLvl(lvl+1)}
function showEnd(){hideOv();document.getElementById('final-score').textContent=totalScore;showOv('ov-end');running=false}
function showOv(id){document.getElementById(id).classList.add('on')}
function hideOv(){['ov-death','ov-win','ov-end','ov-lvl','ov-grace','ov-fail','level-select'].forEach(i=>document.getElementById(i).classList.remove('on'))}
function ins(code){const e=document.getElementById('code');const p=e.selectionStart,v=e.value;const pre=(v.length>0&&!v.endsWith('\n'))?'\n':'';e.value=v.substring(0,p)+pre+code+'\n'+v.substring(e.selectionEnd);e.focus()}
function clearEditor(){document.getElementById('code').value='';const c=document.getElementById('console');c.innerHTML='';c.classList.remove('on');document.getElementById('ed-status').textContent='LISTO'}

// ═══ PROGRESSIVE HINTS ═══
function showHint(){hintIdx=0;renderHint()}
function nextHint(){hintIdx++;renderHint()}
function renderHint(){
  const l=LV[lvl],hints=l.hints||[];
  if(hintIdx>=hints.length)hintIdx=hints.length-1;
  document.getElementById('hint-text').innerHTML=hints[hintIdx]||'No hay más pistas.';
  document.getElementById('hint-num').textContent=`(${hintIdx+1}/${hints.length})`;
  const btn=document.getElementById('hint-more-btn');
  btn.className=hintIdx<hints.length-1?'hint-more':'hint-more hide';
  document.getElementById('hint-box').classList.add('on');
}
function closeHint(){document.getElementById('hint-box').classList.remove('on')}

// ═══ LOOP ═══
function loop(){if(!running)return;ft++;
  if(grace>0){grace--;const s=Math.ceil(grace/30);const g=document.getElementById('ov-grace');if(grace>0){g.classList.add('on');document.getElementById('grace-num').textContent=s}else g.classList.remove('on');draw();af=requestAnimationFrame(loop);return}
  if(winning){draw();af=requestAnimationFrame(loop);return}
  if(wormActive)for(const w of worms){w.jo+=.06*w.jd;if(w.jo>1)w.jd=-1;if(w.jo<0)w.jd=1;w.mt++;if(w.mt>=w.mi){w.mt=0;moveWm(w)}}
  else for(const w of worms){w.jo+=.04*w.jd;if(w.jo>1)w.jd=-1;if(w.jo<0)w.jd=1}
  hidden=LV[lvl].rk.some(r=>r.x===pl.x&&r.y===pl.y);
  document.getElementById('hud-hidden').style.display=hidden?'inline':'none';
  draw();af=requestAnimationFrame(loop)}

// ═══ WORM: PATROL vs CHASE ═══
function moveWm(w){if(!pl.alive)return;const l=LV[lvl],h=w.seg[0];
  const dirs=[{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
  function ok(p){if(p.x<0||p.x>=COLS||p.y<0||p.y>=ROWS)return false;if(l.rk.some(r=>r.x===p.x&&r.y===p.y))return false;const cl=Math.max(1,w.seg.length-3);for(let i=0;i<cl;i++)if(w.seg[i].x===p.x&&w.seg[i].y===p.y)return false;return true}
  let nx=h.x,ny=h.y,mv=false;

  if(hidden){
    // Wander when player hidden
    if(w.ws<=0){w.wd=dirs[Math.floor(Math.random()*4)];w.ws=Math.floor(Math.random()*5)+2}
    const t={x:h.x+w.wd.x,y:h.y+w.wd.y};if(ok(t)){nx=t.x;ny=t.y;mv=true}else w.ws=0;w.ws--;
  } else if(w.patrol&&!l.chase){
    // PATROL MODE: follow waypoints
    const tgt=w.patrol[w.pi];
    const dx=tgt.x-h.x,dy=tgt.y-h.y;
    if(dx===0&&dy===0){w.pi=(w.pi+1)%w.patrol.length;} // reached waypoint
    else{
      if(Math.abs(dx)>=Math.abs(dy)){nx=h.x+Math.sign(dx);ny=h.y}
      else{nx=h.x;ny=h.y+Math.sign(dy)}
      if(ok({x:nx,y:ny}))mv=true;else{w.pi=(w.pi+1)%w.patrol.length}
    }
  } else {
    // CHASE MODE
    const dx=pl.x-h.x,dy=pl.y-h.y;let cs=[];
    if(Math.abs(dx)>=Math.abs(dy)){if(dx)cs.push({x:h.x+Math.sign(dx),y:h.y});if(dy)cs.push({x:h.x,y:h.y+Math.sign(dy)})}
    else{if(dy)cs.push({x:h.x,y:h.y+Math.sign(dy)});if(dx)cs.push({x:h.x+Math.sign(dx),y:h.y})}
    for(const d of dirs){const p={x:h.x+d.x,y:h.y+d.y};if(!cs.some(c=>c.x===p.x&&c.y===p.y))cs.push(p)}
    for(const c of cs)if(ok(c)){nx=c.x;ny=c.y;mv=true;break}
  }

  if(mv){w.sc=0;for(let i=w.seg.length-1;i>0;i--)w.seg[i]={...w.seg[i-1]};w.seg[0]={x:nx,y:ny}}
  else{w.sc++;if(w.sc>3&&w.seg.length>3){w.seg.pop();w.sc=0}}
  if(w.seg.length<LV[lvl].wl&&w.sc===0&&Math.random()<.08)w.seg.push({...w.seg[w.seg.length-1]});
  if(!hidden&&pl.alive)for(const s of w.seg)if(s.x===pl.x&&s.y===pl.y){die();return}
}

// ═══ PLAYER ═══
function movePl(dx,dy){if(!pl.alive||!running||winning)return false;
  const nx=pl.x+dx,ny=pl.y+dy;if(nx<0||nx>=COLS||ny<0||ny>=ROWS)return false;
  if(worms.length===0&&LV[lvl].rk.some(r=>r.x===nx&&r.y===ny))return false;
  pl.x=nx;pl.y=ny;pl.st++;
  const wasH=hidden;hidden=LV[lvl].rk.some(r=>r.x===pl.x&&r.y===pl.y);
  if(hidden&&!wasH)snd('hide');else snd('step');
  const si=spice.findIndex(s=>s.x===nx&&s.y===ny);if(si>=0){spice.splice(si,1);pl.sp++;snd('spice')}
  document.getElementById('hud-spice').textContent=`◆ ${pl.sp}/${LV[lvl].sp.length}`;
  document.getElementById('hud-steps').textContent=`↦ ${pl.st}`;
  if(!hidden)for(const w of worms)for(const s of w.seg)if(s.x===pl.x&&s.y===pl.y){die();return true}
  if(spice.length===0&&pl.alive){winning=true;setTimeout(()=>winLvl(),500)}
  return true}
function die(){pl.alive=false;running=false;if(af)cancelAnimationFrame(af);stopCode();snd('die');document.getElementById('canvas-wrap').classList.add('shake');setTimeout(()=>document.getElementById('canvas-wrap').classList.remove('shake'),400);setTimeout(()=>showOv('ov-death'),350)}
function winLvl(){running=false;if(af)cancelAnimationFrame(af);stopCode();winning=false;snd('win');
  const l=LV[lvl],stars=pl.st<=l.par?3:pl.st<=l.par*1.5?2:1,lvlScore=stars*100+Math.max(0,(l.par*3-pl.st)*5);
  totalScore+=lvlScore;document.getElementById('hud-score').textContent=`★ ${totalScore}`;
  if(lvl>=10){setTimeout(showEnd,400);return}
  document.getElementById('win-t').textContent=`¡NIVEL ${lvl} COMPLETADO!`;
  document.getElementById('win-m').textContent=`${pl.st} pasos (óptimo: ${l.par}) · +${lvlScore} pts`;
  document.getElementById('win-stars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  document.getElementById('win-concept').textContent=l.winMsg;showOv('ov-win')}

// ══════════════════════════════════════════════════════
// SMART COMMANDS — auto-direction
// ══════════════════════════════════════════════════════
function nearestWormDist(){let m=999;for(const w of worms){const h=w.seg[0];const d=Math.abs(pl.x-h.x)+Math.abs(pl.y-h.y);if(d<m)m=d}return m}
function nearestWormDir(){let m=999,bx=0,by=0;for(const w of worms){const h=w.seg[0];const d=Math.abs(pl.x-h.x)+Math.abs(pl.y-h.y);if(d<m){m=d;bx=h.x-pl.x;by=h.y-pl.y}}return{dx:bx,dy:by}}

function doHuir(){
  const w=nearestWormDir();let dx=0,dy=0;
  // Go opposite direction from worm
  if(Math.abs(w.dx)>=Math.abs(w.dy)){dx=-Math.sign(w.dx);dy=0}
  else{dx=0;dy=-Math.sign(w.dy)}
  // Try 2 steps opposite
  let moved=false;
  for(let i=0;i<2;i++){if(movePl(dx,dy))moved=true;else break}
  if(!moved){// try perpendicular
    const alt=[{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
    for(const a of alt)if(movePl(a.x,a.y)){moved=true;break}
  }
  logC(moved?`  🏃 Huyendo ${dx>0?'→':dx<0?'←':dy>0?'↓':'↑'}`:'  ✗ No puede huir','i');
  return moved;
}

function doIrAEspecia(){
  if(spice.length===0)return false;
  let nearest=null,minD=999;
  for(const s of spice){const d=Math.abs(pl.x-s.x)+Math.abs(pl.y-s.y);if(d<minD){minD=d;nearest=s}}
  if(!nearest)return false;
  const dx=nearest.x-pl.x,dy=nearest.y-pl.y;
  let moved=false;
  if(Math.abs(dx)>=Math.abs(dy)){moved=movePl(Math.sign(dx),0)}
  if(!moved&&dy!==0){moved=movePl(0,Math.sign(dy))}
  if(!moved&&dx!==0){moved=movePl(Math.sign(dx),0)}
  logC(moved?`  ◆ Hacia especia (dist:${minD})`:'  ✗ Camino bloqueado','i');
  return moved;
}

function doIrARefugio(){
  const l=LV[lvl];if(l.rk.length===0)return false;
  let nearest=null,minD=999;
  for(const r of l.rk){const d=Math.abs(pl.x-r.x)+Math.abs(pl.y-r.y);if(d<minD&&d>0){minD=d;nearest=r}}
  if(!nearest)return false;
  const dx=nearest.x-pl.x,dy=nearest.y-pl.y;
  let moved=false;
  if(Math.abs(dx)>=Math.abs(dy)){moved=movePl(Math.sign(dx),0)}
  if(!moved&&dy!==0){moved=movePl(0,Math.sign(dy))}
  if(!moved&&dx!==0){moved=movePl(Math.sign(dx),0)}
  logC(moved?`  ⛰ Hacia refugio (dist:${minD})`:'  ✗ Camino bloqueado','i');
  return moved;
}

// ══════════════════════════════════════════════════════
// PARSER + ENGINE
// ══════════════════════════════════════════════════════
function parse(src){const ls=src.split('\n').map(l=>l.trimEnd());let p=0;
function pb(ind){const c=[];while(p<ls.length){const r=ls[p],t=r.trim();if(!t||t.startsWith('//')){p++;continue}const ci=r.length-r.trimStart().length;if(ci<ind&&t!=='fin'&&t!=='sino:')break;if(t==='fin'){p++;break}if(t==='sino:')break;
const mv=t.match(/^(arriba|abajo|izquierda|derecha|esperar)\s*\(\s*(\d+)\s*\)$/i);if(mv){c.push({t:'m',c:mv[1].toLowerCase(),n:parseInt(mv[2])});p++;continue}
if(t.match(/^esconderse\s*\(\s*\)$/i)){c.push({t:'m',c:'esperar',n:3});p++;continue}
if(t.match(/^huir\s*\(\s*\)$/i)){c.push({t:'smart',c:'huir'});p++;continue}
if(t.match(/^ir_a_especia\s*\(\s*\)$/i)){c.push({t:'smart',c:'especia'});p++;continue}
if(t.match(/^ir_a_refugio\s*\(\s*\)$/i)){c.push({t:'smart',c:'refugio'});p++;continue}
const rp=t.match(/^repetir\s*\(\s*(\d+)\s*\)\s*:?$/i);if(rp){p++;c.push({t:'r',n:parseInt(rp[1]),b:pb(ci+1)});continue}
const pg=t.match(/^si_peligro\s*\(\s*(\d+)\s*\)\s*:?$/i);if(pg){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'pg',d:parseInt(pg[1]),th,el});continue}
const se=t.match(/^si_especia\s*\(\s*(arriba|abajo|izquierda|derecha)\s*,\s*(\d+)\s*\)\s*:?$/i);if(se){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'se',dir:se[1].toLowerCase(),d:parseInt(se[2]),th,el});continue}
const sr=t.match(/^si_refugio\s*\(\s*(arriba|abajo|izquierda|derecha)\s*,\s*(\d+)\s*\)\s*:?$/i);if(sr){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'sr',dir:sr[1].toLowerCase(),d:parseInt(sr[2]),th,el});continue}
const sb=t.match(/^si_bloqueado\s*\(\s*(arriba|abajo|izquierda|derecha)\s*\)\s*:?$/i);if(sb){p++;const th=pb(ci+1);let el=[];if(p<ls.length&&ls[p].trim()==='sino:'){p++;el=pb(ci+1)}c.push({t:'sb',dir:sb[1].toLowerCase(),th,el});continue}
c.push({t:'e',l:t});p++}return c}return pb(0)}
function flat(ast){const q=[];function w(ns){for(const n of ns){if(n.t==='e'){q.push(n);return}if(n.t==='m'||n.t==='smart')for(let i=0;i<(n.n||1);i++)q.push(n.t==='m'?{t:'m',c:n.c}:{t:'smart',c:n.c});if(n.t==='r')for(let i=0;i<n.n;i++)w(n.b);if('th'in n)q.push(n)}}w(ast);return q}

const DR={arriba:{x:0,y:-1},abajo:{x:0,y:1},izquierda:{x:-1,y:0},derecha:{x:1,y:0}};
function scanDir(dir,maxD,check){const d=DR[dir];if(!d)return false;for(let i=1;i<=maxD;i++){const x=pl.x+d.x*i,y=pl.y+d.y*i;if(x<0||x>=COLS||y<0||y>=ROWS)break;if(check(x,y))return true}return false}

function runCode(cont){
  if(codeOn)return;
  const l=LV[lvl];
  if(!cont){// Full reset
    pl={x:l.pp.x,y:l.pp.y,sp:0,st:0,alive:true};hidden=false;winning=false;
    spice=l.sp.map(s=>({...s}));
    worms=l.worms.map((w,i)=>{const seg=[];for(let j=0;j<l.wl;j++)seg.push({x:w.x-j,y:w.y});return{seg,mt:0,mi:l.ws,jo:0,jd:1,wd:null,ws:0,sc:0,hue:i,patrol:w.patrol||null,pi:0}});
    document.getElementById('hud-spice').textContent=`◆ 0/${l.sp.length}`;
    document.getElementById('hud-steps').textContent='↦ 0';
  }
  hideOv();
  const r=document.getElementById('code').value.trim();if(!r)return;
  const con=document.getElementById('console');con.classList.add('on');if(!cont)con.innerHTML='';
  const ast=parse(r);let er=[];(function f(ns){for(const n of ns){if(n.t==='e')er.push(n.l);if(n.th)f(n.th);if(n.el)f(n.el);if(n.b)f(n.b)}})(ast);
  if(er.length){logC(`✗ Error: "${er[0]}"`,'e');return}
  cq=flat(ast);logC(cont?'▶+ Continuando...':'▶ Ejecutando...','s');
  document.getElementById('ed-status').textContent='EJECUTANDO';
  wormActive=true;if(!running){running=true;loop()}codeOn=true;exN()}

function exN(){if(!codeOn||cq.length===0){codeOn=false;wormActive=false;
  if(pl.alive&&!winning){if(spice.length>0){logC(`⚠ Faltan ${spice.length} especia${spice.length>1?'s':''}`,'e');
    if(LV[lvl].canCont)logC('Escribe más código y usa ▶+ Continuar','i');
    else{document.getElementById('ed-status').textContent='INCOMPLETO';snd('fail');document.getElementById('fail-msg').textContent=`Faltan ${spice.length} especia${spice.length>1?'s':''}.`;setTimeout(()=>showOv('ov-fail'),300)}}
    else{logC('✓ ¡Completado!','s');document.getElementById('ed-status').textContent='COMPLETO'}}
  document.getElementById('ed-status').textContent=spice.length>0&&pl.alive?'ESPERANDO':'COMPLETO';return}
  if(grace>0){ct=setTimeout(exN,100);return}
  const i=cq.shift();
  if(i.t==='m'){let ok=true;switch(i.c){case'arriba':ok=movePl(0,-1);break;case'abajo':ok=movePl(0,1);break;case'izquierda':ok=movePl(-1,0);break;case'derecha':ok=movePl(1,0);break;case'esperar':break}if(!ok){logC(`✗ Bloqueado: ${i.c}`,'e');codeOn=false;wormActive=false;document.getElementById('ed-status').textContent='BLOQUEADO';return}}
  if(i.t==='smart'){let ok=true;switch(i.c){case'huir':ok=doHuir();break;case'especia':ok=doIrAEspecia();break;case'refugio':ok=doIrARefugio();break}if(!ok){logC('✗ Acción inteligente falló','e');codeOn=false;wormActive=false;return}}
  if(i.t==='pg'){const d=nearestWormDist();const f=d<=i.d;const w=nearestWormDir();const dir=Math.abs(w.dx)>Math.abs(w.dy)?(w.dx>0?'→ derecha':'← izquierda'):(w.dy>0?'↓ abajo':'↑ arriba');logC(`  ☠ peligro(${i.d})? dist=${d} ${f?'⚠ SÍ desde '+dir:'✓ seguro'}`,'i');cq=flat(f?i.th:i.el).concat(cq)}
  if(i.t==='se'){const f=scanDir(i.dir,i.d,(x,y)=>spice.some(s=>s.x===x&&s.y===y));logC(`  ◆ especia ${i.dir}? ${f?'SÍ':'NO'}`,'i');cq=flat(f?i.th:i.el).concat(cq)}
  if(i.t==='sr'){const f=scanDir(i.dir,i.d,(x,y)=>LV[lvl].rk.some(r=>r.x===x&&r.y===y));logC(`  ⛰ refugio ${i.dir}? ${f?'SÍ':'NO'}`,'i');cq=flat(f?i.th:i.el).concat(cq)}
  if(i.t==='sb'){const d=DR[i.dir];const nx=pl.x+d.x,ny=pl.y+d.y;const f=nx<0||nx>=COLS||ny<0||ny>=ROWS||(worms.length===0&&LV[lvl].rk.some(r=>r.x===nx&&r.y===ny));logC(`  ▧ bloqueado ${i.dir}? ${f?'SÍ':'NO'}`,'i');cq=flat(f?i.th:i.el).concat(cq)}
  if(!pl.alive||(!running&&!winning)){codeOn=false;wormActive=false;document.getElementById('ed-status').textContent='DETENIDO';return}
  ct=setTimeout(exN,200)}
function stopCode(){codeOn=false;wormActive=false;cq=[];if(ct)clearTimeout(ct);document.getElementById('ed-status').textContent='LISTO'}
function logC(m,t=''){const e=document.getElementById('console'),l=document.createElement('div');l.className='log '+t;l.textContent=m;e.appendChild(l);e.scrollTop=e.scrollHeight}

// ══════════════════════════════════════════════════════
// RENDERING (same as before)
// ══════════════════════════════════════════════════════
function draw(){cx.clearRect(0,0,W,H);drD();drG();drM();drS();for(const w of worms){drWT(w);drWm(w)}if(pl.alive)drPl();drH();drTr();if(grace>0)drSh()}
function drD(){const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#c9952a');g.addColorStop(1,'#8b6914');cx.fillStyle=g;cx.fillRect(0,0,W,H);cx.save();cx.globalAlpha=.15;for(let i=0;i<2000;i++){const x=((Math.sin(i)*13.7*W)%W+W)%W,y=((Math.cos(i)*17.3*H)%H+H)%H;cx.fillStyle=i%2===0?'#fff':'#000';cx.fillRect(x,y,1,1)}cx.restore();dw.forEach(d=>{cx.save();cx.translate(d.x,d.y);cx.rotate(d.a);const dg=cx.createLinearGradient(0,-d.h,0,d.h);dg.addColorStop(0,'rgba(0,0,0,0.2)');dg.addColorStop(1,'transparent');cx.fillStyle=dg;cx.beginPath();cx.ellipse(0,0,d.w,d.h,0,0,Math.PI*2);cx.fill();cx.restore()})}
function drG(){cx.strokeStyle='rgba(0,0,0,.03)';cx.lineWidth=.5;for(let x=0;x<=W;x+=TILE){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke()}for(let y=0;y<=H;y+=TILE){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()}}
function drM(){const l=LV[lvl];for(const r of l.rk){const x=r.x*TILE,y=r.y*TILE,mx=x+TILE/2,my=y+TILE/2,here=pl.x===r.x&&pl.y===r.y;cx.globalAlpha=.2;cx.fillStyle='#1a0a00';cx.beginPath();cx.ellipse(mx+3,my+7,18,7,0,0,Math.PI*2);cx.fill();cx.globalAlpha=1;cx.fillStyle=here?'#3d4f60':'#4a3c2a';cx.beginPath();cx.moveTo(x-3,y+TILE);cx.lineTo(x+5,y+10);cx.lineTo(mx-1,y-3);cx.lineTo(mx+4,y+4);cx.lineTo(x+TILE-3,y-5);cx.lineTo(x+TILE+3,y+9);cx.lineTo(x+TILE+3,y+TILE);cx.closePath();cx.fill();cx.fillStyle=here?'#506878':'#6d5a3a';cx.beginPath();cx.moveTo(mx-1,y-3);cx.lineTo(mx+4,y+4);cx.lineTo(x+TILE-3,y-5);cx.lineTo(x+TILE+3,y+9);cx.lineTo(x+TILE+3,y+TILE);cx.lineTo(mx,y+TILE);cx.closePath();cx.fill();cx.fillStyle='#c8b8a8';cx.globalAlpha=.5;cx.beginPath();cx.moveTo(mx-1,y-3);cx.lineTo(mx+3,y+3);cx.lineTo(mx-5,y+5);cx.closePath();cx.fill();cx.beginPath();cx.moveTo(x+TILE-3,y-5);cx.lineTo(x+TILE+1,y+2);cx.lineTo(x+TILE-7,y+3);cx.closePath();cx.fill();cx.globalAlpha=1;if(here){cx.globalAlpha=.12+Math.sin(ft*.06)*.06;cx.strokeStyle='#4fc3f7';cx.lineWidth=2;cx.setLineDash([4,3]);cx.beginPath();cx.arc(mx,my,22,0,Math.PI*2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1}else if(worms.length>0&&Math.abs(pl.x-r.x)<=3&&Math.abs(pl.y-r.y)<=3){cx.globalAlpha=.2;cx.fillStyle='#4fc3f7';cx.font='9px Rajdhani';cx.textAlign='center';cx.fillText('⛰',mx,y+TILE+9);cx.globalAlpha=1}}}
function drS(){for(const s of spice){const x=s.x*TILE+TILE/2,y=s.y*TILE+TILE/2,p=Math.sin(ft*.07+s.x)*.3+.7,gl=Math.sin(ft*.05+s.y)*3+13;cx.globalAlpha=.12*p;const g=cx.createRadialGradient(x,y,1,x,y,gl);g.addColorStop(0,'#ff9f43');g.addColorStop(1,'transparent');cx.fillStyle=g;cx.fillRect(x-gl,y-gl,gl*2,gl*2);cx.globalAlpha=.92;cx.fillStyle='#e85d10';cx.beginPath();cx.moveTo(x,y-9);cx.lineTo(x+7,y);cx.lineTo(x,y+9);cx.lineTo(x-7,y);cx.closePath();cx.fill();cx.fillStyle='#ffcc02';cx.beginPath();cx.moveTo(x,y-5);cx.lineTo(x+4,y);cx.lineTo(x,y+5);cx.lineTo(x-4,y);cx.closePath();cx.fill();cx.fillStyle='#fff';cx.globalAlpha=p*.5;cx.beginPath();cx.arc(x-2,y-3,1.2,0,Math.PI*2);cx.fill();cx.globalAlpha=1}}
function drWT(w){cx.globalAlpha=.04;cx.fillStyle='#3e2723';for(const s of w.seg){cx.beginPath();cx.ellipse(s.x*TILE+TILE/2+2,s.y*TILE+TILE/2+3,14,6,0,0,Math.PI*2);cx.fill()}cx.globalAlpha=1}
function drWm(w){const cols=[['#5d4037','#4e342e','#6d4c41','#8d6e63'],['#4a148c','#38006b','#6a1b9a','#9c27b0']][w.hue%2];const ss=w.seg;for(let i=ss.length-1;i>=0;i--){const s=ss[i],x=s.x*TILE+TILE/2,y=s.y*TILE+TILE/2,wb=Math.sin(ft*.08+i*.8)*2,t=i/(ss.length-1),r=16-t*7;if(i===0){const j=w.jo*.3;cx.fillStyle=cols[1];cx.beginPath();cx.arc(x+wb,y,r+2,0,Math.PI*2);cx.fill();cx.fillStyle=cols[0];cx.beginPath();cx.arc(x+wb,y,r,0,Math.PI*2);cx.fill();cx.fillStyle=cols[1];cx.beginPath();cx.arc(x+wb,y-j*10,r-2,Math.PI+.3,-.3);cx.closePath();cx.fill();cx.beginPath();cx.arc(x+wb,y+j*10,r-2,.3,Math.PI-.3);cx.closePath();cx.fill();if(w.jo>.2){cx.fillStyle='#b71c1c';cx.globalAlpha=w.jo;cx.beginPath();cx.ellipse(x+wb,y,r-4,j*8,0,0,Math.PI*2);cx.fill();cx.globalAlpha=1}cx.fillStyle='#ffecb3';for(let ti=0;ti<4;ti++){const a=(ti/4)*Math.PI-Math.PI/2,tx=x+wb+Math.cos(a)*(r-3),ty=y-j*8+Math.sin(a)*3;cx.beginPath();cx.moveTo(tx-1.5,ty);cx.lineTo(tx,ty+4+j*3);cx.lineTo(tx+1.5,ty);cx.fill()}for(let ti=0;ti<4;ti++){const a=(ti/4)*Math.PI+Math.PI/2,tx=x+wb+Math.cos(a)*(r-3),ty=y+j*8+Math.sin(a)*3;cx.beginPath();cx.moveTo(tx-1.5,ty);cx.lineTo(tx,ty-4-j*3);cx.lineTo(tx+1.5,ty);cx.fill()}const eg=Math.sin(ft*.1)*.3+.7;cx.globalAlpha=.35*eg;cx.fillStyle='#ff1744';cx.beginPath();cx.arc(x+wb-5,y-6,5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(x+wb+5,y-6,5,0,Math.PI*2);cx.fill();cx.globalAlpha=1;cx.fillStyle='#ff1744';cx.beginPath();cx.arc(x+wb-5,y-6,3.5,0,Math.PI*2);cx.fill();cx.fillStyle='#b71c1c';cx.beginPath();cx.arc(x+wb-5,y-6,1.8,0,Math.PI*2);cx.fill();cx.fillStyle='#ff1744';cx.beginPath();cx.arc(x+wb+5,y-6,3.5,0,Math.PI*2);cx.fill();cx.fillStyle='#b71c1c';cx.beginPath();cx.arc(x+wb+5,y-6,1.8,0,Math.PI*2);cx.fill()}else{cx.fillStyle=t<.5?cols[2]:cols[3];cx.beginPath();cx.arc(x+wb,y,r,0,Math.PI*2);cx.fill();cx.strokeStyle=t<.5?cols[0]:cols[2];cx.lineWidth=1;cx.beginPath();cx.arc(x+wb,y,r-2,0,Math.PI*2);cx.stroke()}}}
function drPl(){const x=pl.x*TILE+TILE/2,y=pl.y*TILE+TILE/2,h=Math.sin(ft*.1)*2;if(hidden){cx.globalAlpha=.15+Math.sin(ft*.06)*.06;cx.strokeStyle='#4fc3f7';cx.lineWidth=1.5;cx.setLineDash([3,3]);cx.beginPath();cx.arc(x,y,18,0,Math.PI*2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1}cx.globalAlpha=hidden?.05:.12;cx.fillStyle='#1a0e00';cx.beginPath();cx.ellipse(x,y+16,10,4,0,0,Math.PI*2);cx.fill();cx.globalAlpha=hidden?.4:1;cx.fillStyle='#5d4037';cx.beginPath();cx.moveTo(x-10,y+15);cx.quadraticCurveTo(x+Math.sin(ft*.05)*10,y+20,x+10,y+15);cx.lineTo(x,y-5);cx.closePath();cx.fill();cx.fillStyle='#333';cx.beginPath();cx.arc(x,y-8+h,7,0,Math.PI*2);cx.fill();cx.fillStyle='#00f2ff';cx.shadowBlur=8;cx.shadowColor='#00f2ff';cx.fillRect(x-4,y-10+h,3,2);cx.fillRect(x+1,y-10+h,3,2);cx.shadowBlur=0;cx.globalAlpha=1}
function drH(){const rm=spice.length;cx.globalAlpha=.6;cx.fillStyle='#1a0e00';cx.fillRect(W/2-75,4,150,18);cx.globalAlpha=1;cx.font='bold 11px Rajdhani';cx.textAlign='center';if(rm>0){cx.fillStyle=rm<=1?'#00e676':'#ff9f43';cx.fillText(`◆ ${rm} especia${rm>1?'s':''} restante${rm>1?'s':''}`,W/2,17)}else{cx.fillStyle='#00e676';cx.fillText('✓ ¡Especia recogida!',W/2,17)}if(hidden){cx.globalAlpha=.7;cx.fillStyle='#0d47a1';cx.fillRect(W/2-40,24,80,14);cx.globalAlpha=1;cx.fillStyle='#4fc3f7';cx.font='bold 9px Rajdhani';cx.fillText('⛰ OCULTO',W/2,34)}if(!wormActive&&worms.length>0){cx.globalAlpha=.5;cx.fillStyle='#1a0e00';cx.fillRect(W/2-70,H-22,140,18);cx.globalAlpha=.8;cx.fillStyle='#4fc3f7';cx.font='bold 10px Rajdhani';cx.fillText('☠ Gusano espera tu código',W/2,H-9)}}
function drTr(){if(!wormActive)return;let m=999;for(const w of worms){const h=w.seg[0],d=Math.sqrt((pl.x-h.x)**2+(pl.y-h.y)**2);if(d<m)m=d}const tr=m<5&&!hidden?(5-m)/5:0;if(tr<=0){cv.style.transform='';return}cx.globalAlpha=tr*.06;cx.fillStyle='#ff1744';cx.fillRect(0,0,W,H);cx.globalAlpha=1;if(tr>.5)cv.style.transform=`translate(${(Math.random()-.5)*tr*2}px,${(Math.random()-.5)*tr*2}px)`;else cv.style.transform=''}
function drSh(){const x=pl.x*TILE+TILE/2,y=pl.y*TILE+TILE/2;cx.globalAlpha=Math.sin(ft*.15)*.1+.18;cx.strokeStyle='#4fc3f7';cx.lineWidth=1.5;cx.setLineDash([5,3]);cx.beginPath();cx.arc(x,y,20,0,Math.PI*2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1}
init();
