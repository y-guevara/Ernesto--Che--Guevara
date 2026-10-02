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
const ARQUIVO='hasta siempre.mp3';
