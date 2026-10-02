try{
// Menu: rola até a seção
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const alvo=document.querySelector(a.getAttribute('href'));
  if(!alvo)return;
  e.preventDefault();
  const y=alvo.getBoundingClientRect().top+window.pageYOffset-60;
  window.scrollTo({top:y,behavior:'smooth'});
}));
}catch(e){console.error(e)}
// Barra de progresso
const bar=document.getElementById('progress');
addEventListener('scroll',()=>{
  const h=document.documentElement;
  bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
},{passive:true});

// Aparecer ao rolar + contadores
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');
  if(e.target.dataset.n)count(e.target);
  io.unobserve(e.target);
}),{threshold:.2});
document.querySelectorAll('.timeline li,.panel article,.stats b').forEach(el=>{
  if(!el.dataset.n)el.classList.add('rv');
  io.observe(el);
});
function count(el){
  el.textContent='0';
  const end=+el.dataset.n,t0=performance.now(),d=1400;
  (function step(t){
    const p=Math.min((t-t0)/d,1);
    el.textContent=Math.round(end*(1-Math.pow(1-p,3)));
    if(p<1)requestAnimationFrame(step);
  })(t0);
}

// Abas
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');
  document.getElementById('p-'+b.dataset.t).classList.add('on');
});

// Cartões virando
document.querySelectorAll('.card').forEach(c=>c.onclick=()=>c.classList.toggle('flip'));

// ===== MÚSICA =====
// Coloque na mesma pasta o arquivo hasta-siempre.mp3 (uma cópia que você tenha direito de usar).
// Se o arquivo não existir, toca uma música ambiente gerada no navegador.
const ARQUIVO='hasta-siempre.mp3';
const btn=document.getElementById('music'),label=btn.querySelector('span');
let playing=false,audio=null,usandoSynth=false,ctx,master,timer,step=0;

function aviso(msg){
  const t=document.createElement('div');t.className='toast';t.textContent=msg;
  document.body.appendChild(t);setTimeout(()=>t.remove(),4500);
}
function setUI(on){
  playing=on;btn.classList.toggle('on',on);
  label.textContent=on?'Pausar música':'Tocar música';
}
const chords=[[220,261.63,329.63],[174.61,220,261.63],[130.81,196,261.63],[196,246.94,293.66]];
function pluck(f,t,v){
  const o=ctx.createOscillator(),g=ctx.createGain(),fl=ctx.createBiquadFilter();
  o.type='triangle';o.frequency.value=f;
  fl.type='lowpass';fl.frequency.setValueAtTime(2600,t);fl.frequency.exponentialRampToValueAtTime(500,t+.5);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+1.1);
  o.connect(fl);fl.connect(g);g.connect(master);o.start(t);o.stop(t+1.2);
}
function drum(t,f,v){
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(40,t+.15);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+.25);
}
function tick(){
  const t=ctx.currentTime+.05,c=chords[Math.floor(step/8)%4],i=step%8,p=[0,1,2,1,0,1,2,1];
  pluck(c[p[i]]*(i%4===0?.5:1),t,i%4===0?.25:.15);
  if(i%4===0)drum(t,120,.6);
  if(i===3||i===7)drum(t,200,.2);
  step++;
}
async function iniciarSynth(){
  usandoSynth=true;
  ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
  if(!master){master=ctx.createGain();master.gain.value=.8;master.connect(ctx.destination);}
  await ctx.resume();
  timer=setInterval(tick,300);
  setUI(true);
}
async function toggle(){
  if(playing){
    if(usandoSynth)clearInterval(timer);else audio.pause();
    return setUI(false);
  }
  if(usandoSynth)return iniciarSynth();
  try{
    audio=audio||new Audio(ARQUIVO);audio.loop=true;audio.volume=.7;
    await audio.play();
    setUI(true);
  }catch(e){
    aviso('Arquivo '+ARQUIVO+' não encontrado. Tocando música ambiente no lugar.');
    iniciarSynth();
  }
}
btn.onclick=toggle;

// ===== FRASES =====
const frases=[
 ['Hasta la victoria siempre.','Despedida usada por Che em cartas'],
 ['O verdadeiro revolucionário é guiado por grandes sentimentos de amor.','O Socialismo e o Homem Novo, 1965'],
 ['Pátria ou morte.','Lema da Revolução Cubana, usado por Che em discursos'],
 ['Sinta-se sempre capaz de sentir, no mais fundo, qualquer injustiça cometida contra qualquer pessoa no mundo.','Atribuída a Che, em carta aos filhos']
];
let qi=0;const qel=document.getElementById('quote');
function mostrarFrase(){
  qel.style.opacity=0;
  setTimeout(()=>{const f=frases[qi%frases.length];qel.innerHTML='“'+f[0]+'”<small>'+f[1]+'</small>';qel.style.opacity=1;qi++;},250);
}
document.getElementById('nextq').onclick=mostrarFrase;mostrarFrase();

// ===== QUIZ =====
const perguntas=[
 ['Em que país Che nasceu?',['Cuba','Argentina','Bolívia'],1],
 ['Qual era o nome do barco que levou o grupo a Cuba em 1956?',['Granma','La Poderosa','Sierra'],0],
 ['Em que cidade cubana está o mausoléu com seus restos?',['Havana','Santiago','Santa Clara'],2],
 ['Que profissão ele estudou?',['Medicina','Direito','Engenharia'],0],
 ['Em que país ele foi capturado em 1967?',['Congo','Bolívia','Peru'],1]
];
const box=document.getElementById('quizbox');let qn=0,pts=0;
function renderQ(){
  if(qn>=perguntas.length){
    box.innerHTML='<div class="score">'+pts+' / '+perguntas.length+'</div><p>'+(pts>=4?'Você manja de Che!':'Releia as seções acima e tente de novo.')+'</p><button class="again">Refazer</button>';
    box.querySelector('.again').onclick=()=>{qn=0;pts=0;renderQ()};return;
  }
  const [q,o,c]=perguntas[qn];
  box.innerHTML='<div class="qq"><div class="qcount">Pergunta '+(qn+1)+' de '+perguntas.length+'</div><h3>'+q+'</h3><div class="opts"></div></div>';
  const wrap=box.querySelector('.opts');
  o.forEach((t,i)=>{
    const b=document.createElement('button');b.className='opt';b.textContent=t;
    b.onclick=()=>{
      wrap.querySelectorAll('.opt').forEach((x,j)=>{x.disabled=true;if(j===c)x.classList.add('ok');});
      if(i===c)pts++;else b.classList.add('no');
      setTimeout(()=>{qn++;renderQ()},1100);
    };
    wrap.appendChild(b);
  });
}
renderQ();
