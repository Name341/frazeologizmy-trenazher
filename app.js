const idioms = window.PHRASES.map((item,index)=>({ ...item, id:'i'+index, idiom:true, meaning:item.meaning || '', source:'учебный список ФИПИ, с. '+item.page+'.' }));
const ordinary = [
['узкая долина','И. С. Тургенев, «Бежин луг»','https://ilibrary.ru/text/1204/p.8/index.html'],['густая высокая трава','И. С. Тургенев, «Бежин луг»','https://ilibrary.ru/text/1204/p.8/index.html'],['пологий холм','И. С. Тургенев, «Бежин луг»','https://ilibrary.ru/text/1204/p.8/index.html'],['стальные отблески воды','И. С. Тургенев, «Бежин луг»','https://ilibrary.ru/text/1204/p.8/index.html'],['старый сад','А. П. Чехов, «Три сестры»','https://ilibrary.ru/text/973/p.4/index.html'],['еловая аллея','А. П. Чехов, «Три сестры»','https://ilibrary.ru/text/973/p.4/index.html'],['старые деревья','А. П. Чехов, «Три сестры»','https://ilibrary.ru/text/973/p.4/index.html'],['беспокойный взгляд','А. П. Чехов, «Три сестры»','https://ilibrary.ru/text/973/p.4/index.html'],['деревянный дом','Н. В. Гоголь, «Мёртвые души»','https://ilibrary.ru/text/78/p.6/index.html'],['красная крыша','Н. В. Гоголь, «Мёртвые души»','https://ilibrary.ru/text/78/p.6/index.html'],['тёмный чулан','Н. В. Гоголь, «Мёртвые души»','https://ilibrary.ru/text/78/p.6/index.html'],['широкая дорога','А. С. Пушкин, «Путешествие в Арзрум»','https://ilibrary.ru/text/483/p.3/index.html'],['плоская кровля','А. С. Пушкин, «Путешествие в Арзрум»','https://ilibrary.ru/text/483/p.3/index.html'],['естественная граница','А. С. Пушкин, «Путешествие в Арзрум»','https://ilibrary.ru/text/483/p.3/index.html'],['груды камней','А. С. Пушкин, «Путешествие в Арзрум»','https://ilibrary.ru/text/483/p.3/index.html'],['маленький дом','М. Горький, «Мать»','https://ilibrary.ru/text/1485/p.8/index.html'],['плюшевый жилет','М. Горький, «Мать»','https://ilibrary.ru/text/1485/p.8/index.html'],['дождливая ночь','С. А. Есенин, «Эта улица мне знакома…»','https://ilibrary.ru/text/4135/p.1/index.html'],['родительский дом','С. А. Есенин, «Эта улица мне знакома…»','https://ilibrary.ru/text/4135/p.1/index.html'],['низенький дом','С. А. Есенин, «Эта улица мне знакома…»','https://ilibrary.ru/text/4135/p.1/index.html']
].map(([text,source,url],index)=>({text,source,url,id:'o'+index,idiom:false,context:['За селом открывалась узкая долина.','На лугу росла густая высокая трава.','Вдали виднелся пологий холм.','На реке виднелись стальные отблески воды.','За домом был старый сад.','В саду тянулась еловая аллея.','В парке росли старые деревья.','Он бросил на дверь беспокойный взгляд.','На краю села стоял деревянный дом.','У дома была красная крыша.','За дверью оказался тёмный чулан.','Впереди пролегала широкая дорога.','У дома была плоская кровля.','Река образует естественную границу.','На склоне лежали груды камней.','У дороги стоял маленький дом.','На нём был плюшевый жилет.','Наступила дождливая ночь.','Вдали показался родительский дом.','На улице стоял низенький дом.'][index],meaning:'Слова сохраняют свои прямые значения и свободно сочетаются.'}));

const $ = id => document.getElementById(id);
const shuffle = values => {const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const storageKey='phrase-trainer-queues-v2';
let pools={i:[],o:[]};
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&Array.isArray(saved.i)&&Array.isArray(saved.o))pools=saved;}catch(e){}
function take(poolKey,source,count){
  const byId=new Map(source.map(item=>[item.id,item]));
  let pool=[...new Set(pools[poolKey].filter(id=>byId.has(id)))];
  const selected=[];
  while(selected.length<count){
    if(!pool.length){const used=new Set(selected.map(item=>item.id));const fresh=shuffle(source.map(item=>item.id));pool=[...fresh.filter(id=>!used.has(id)),...fresh.filter(id=>used.has(id))];}
    const id=pool.shift();
    if(!selected.some(item=>item.id===id))selected.push(byId.get(id));
  }
  pools[poolKey]=pool;
  try{localStorage.setItem(storageKey,JSON.stringify(pools));}catch(e){}
  return selected;
}
const maxCount=idioms.length+ordinary.length;
let deck=[],index=0,correct=0,results=[],locked=false,repeatMistakes=false;
function show(id){['intro','quiz','result'].forEach(x=>$(x).classList.toggle('hidden',x!==id));window.scrollTo(0,0);}
function countLabel(n){const n10=n%10,n100=n%100;return n+' '+(n10===1&&n100!==11?'задание':n10>=2&&n10<=4&&(n100<12||n100>14)?'задания':'заданий');}
function updateCount(value){const count=Math.max(1,Math.min(maxCount,Number(value)||1));$('countRange').value=String(count);const label=countLabel(count);$('countValue').textContent=label;$('startCount').textContent=label;document.querySelectorAll('[data-count]').forEach(b=>{const active=b.dataset.count==='all'?count===maxCount:Number(b.dataset.count)===count;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});}
function start(){
  const count=Math.max(1,Math.min(maxCount,Number($('countRange').value)||10));
  const normalCount=Math.min(ordinary.length,Math.floor(count/2));
  const idiomCount=count-normalCount;
  deck=shuffle([...take('i',idioms,idiomCount),...take('o',ordinary,normalCount)]);
  index=0;correct=0;results=[];repeatMistakes=$('repeatErrors').checked;show('quiz');render();
}
function dragHint(afterAnswer=false){const fine=typeof window.matchMedia==='function' && window.matchMedia('(pointer: fine)').matches;return afterAnswer?(fine?'Перетащите карточку, чтобы идти дальше':'Смахните карточку, чтобы идти дальше'):(fine?'Перетащите карточку мышью влево или вправо':'Смахните карточку влево или вправо');}
function render(){
  locked=false;const q=deck[index];$('questionTitle').textContent=q.text;$('questionContext').textContent=q.context?'('+q.context+')':'';$('questionContext').classList.toggle('hidden',!q.context);$('counter').textContent='ВОПРОС '+String(index+1).padStart(2,'0')+' / '+deck.length;$('score').textContent='ВЕРНО '+correct;$('progress').style.width=(index/deck.length*100)+'%';$('feedback').classList.add('hidden');$('feedbackTitle').classList.add('hidden');$('next').classList.add('hidden');$('answers').classList.remove('hidden');$('swipeHint').textContent=dragHint();document.querySelector('.card').classList.remove('correct','incorrect');document.querySelectorAll('.answer').forEach(b=>{b.disabled=false;b.classList.remove('selected','wrong','right');});
}
function answer(value,button){
  if(locked)return;locked=true;const q=deck[index],ok=value===q.idiom;if(ok)correct++;else if(repeatMistakes)deck.push(q);results.push({q,ok});$('counter').textContent='ВОПРОС '+String(index+1).padStart(2,'0')+' / '+deck.length;$('score').textContent='ВЕРНО '+correct;$('progress').style.width=((index+1)/deck.length*100)+'%';document.querySelectorAll('.answer').forEach(b=>{b.disabled=true;if((b.dataset.answer==='true')===q.idiom)b.classList.add('right');});if(!ok)button.classList.add('wrong');$('feedbackTitle').textContent=ok?'Верно':'Ошибка';$('feedbackTitle').classList.remove('hidden');document.querySelector('.card').classList.add(ok?'correct':'incorrect');$('answers').classList.add('hidden');$('next').classList.remove('hidden');$('swipeHint').textContent=dragHint(true);$('feedbackText').textContent=(q.idiom?'Это фразеологизм. ':'Это обычное словосочетание. ')+q.meaning;$('source').replaceChildren();if(q.url){const a=document.createElement('a');a.href=q.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=q.source;$('source').append('Источник: ',a,' · форма слов может отличаться от текста.');}else $('source').textContent='Источник: '+q.source;$('next').innerHTML=index===deck.length-1?'Посмотреть результат <span>→</span>':'Дальше <span>→</span>';$('feedback').classList.remove('hidden');
}
function finish(){
  show('result');$('resultScore').textContent=correct+' / '+results.length;const ratio=correct/results.length;$('resultMessage').textContent=ratio===1?'Все ответы верные! Ты прекрасно чувствуешь язык.':ratio>=0.7?'Хороший результат! Ещё немного практики — и устойчивые выражения не ускользнут.':'Хорошее начало! Повтори задания и обрати внимание на значения выражений.';$('review').replaceChildren();const heading=document.createElement('h3');heading.textContent='Твои ответы';$('review').append(heading);results.forEach(({q,ok})=>{const row=document.createElement('div');row.className='review-row';const left=document.createElement('span');left.textContent=q.text;const right=document.createElement('span');right.textContent=(ok?'✓ Верно':'× Ошибка')+' · '+(q.idiom?'фразеологизм':'словосочетание');row.append(left,right);$('review').append(row);});
}
$('start').addEventListener('click',start);
$('again').addEventListener('click',()=>show('intro'));
function releaseUnanswered(){const answered=new Set(results.map(r=>r.q.id));const remaining=deck.slice(index+(locked?1:0)).filter(q=>!answered.has(q.id));for(const key of ['i','o']){const pending=[...new Set(remaining.filter(q=>q.id.startsWith(key)).map(q=>q.id))];const restored=new Set(pending);pools[key]=[...pending,...pools[key].filter(id=>!restored.has(id))];}try{localStorage.setItem(storageKey,JSON.stringify(pools));}catch(e){}}
$('restart').addEventListener('click',()=>{releaseUnanswered();show('intro');});
$('countRange').max=String(maxCount);
$('countRange').addEventListener('input',e=>updateCount(e.target.value));
document.querySelectorAll('[data-count]').forEach(b=>b.addEventListener('click',()=>updateCount(b.dataset.count==='all'?maxCount:b.dataset.count)));
document.querySelectorAll('.answer').forEach(b=>b.addEventListener('click',()=>answer(b.dataset.answer==='true',b)));
$('next').addEventListener('click',()=>{index++;if(index===deck.length)finish();else render();});
// Use one pointer gesture for mouse, touch and pen. Vertical movement remains native scrolling.
const card=document.querySelector('.card');
let gesture=null;
function resetGesture(){
  const active=gesture; gesture=null;
  card.classList.remove('dragging'); card.style.transform='';
  if(active && card.hasPointerCapture && card.hasPointerCapture(active.id)){
    try{card.releasePointerCapture(active.id);}catch(e){}
  }
}
card.addEventListener('pointerdown',e=>{
  if(gesture || e.isPrimary===false || (e.pointerType==='mouse' && e.button!==0))return;
  if(e.target.closest && e.target.closest('a,button,input,select,textarea'))return;
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY};
  try{card.setPointerCapture(e.pointerId);}catch(err){}
});
card.addEventListener('pointermove',e=>{
  if(!gesture || e.pointerId!==gesture.id)return;
  const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
  if(Math.abs(dx)>8 && Math.abs(dx)>Math.abs(dy)*1.2){
    card.classList.add('dragging');
    const x=Math.max(-120,Math.min(120,dx));
    card.style.transform='translateX('+x+'px) rotate('+(x/35)+'deg)';
  }else if(card.classList.contains('dragging')){
    card.classList.remove('dragging');card.style.transform='';
  }
});
card.addEventListener('pointerup',e=>{
  if(!gesture || e.pointerId!==gesture.id)return;
  const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
  const threshold=Math.min(65,Math.max(35,card.clientWidth*0.12));
  const swipe=Math.abs(dx)>=threshold && Math.abs(dx)>Math.abs(dy)*1.2;
  resetGesture();
  if(!swipe)return;
  if(locked){$('next').click();}else{const value=dx>0;answer(value,document.querySelector('.answer[data-answer="'+value+'"]'));}
});
card.addEventListener('pointercancel',e=>{if(gesture && e.pointerId===gesture.id)resetGesture();});
card.addEventListener('lostpointercapture',e=>{if(gesture && e.pointerId===gesture.id)resetGesture();});
document.querySelectorAll('[data-help]').forEach(b=>b.addEventListener('click',()=>$('help').showModal()));
$('closeHelp').addEventListener('click',()=>$('help').close());
updateCount(10);show('intro');
