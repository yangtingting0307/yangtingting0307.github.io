const showcase=document.querySelector('#showcase');
let targetX=0,targetY=0,currentX=0,currentY=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
window.addEventListener('pointermove',e=>{targetX=(e.clientX/innerWidth-.5)*12;targetY=(e.clientY/innerHeight-.5)*-9;document.documentElement.style.setProperty('--pointer-x',`${e.clientX}px`);document.documentElement.style.setProperty('--pointer-y',`${e.clientY}px`)});
function frame(){currentX+=(targetX-currentX)*.045;currentY+=(targetY-currentY)*.045;showcase.style.setProperty('--tilt-x',`${currentY}deg`);showcase.style.setProperty('--tilt-y',`${currentX}deg`);requestAnimationFrame(frame)} if(!reduced)frame();
const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');reveal.unobserve(entry.target)}}),{threshold:.16});document.querySelectorAll('.work-card,.intro-title,.projects-title,.contact p,.contact h2,.about-copy').forEach(el=>reveal.observe(el));
let active=null;document.querySelectorAll('.work-card').forEach(card=>{let startX=0,startY=0,baseX=0,baseY=0,moved=false;card.addEventListener('pointerdown',e=>{const interactive=e.target.closest('[contenteditable="true"],button,input,label,video,audio,select,textarea');if(!interactive&&e.target.closest('a'))e.preventDefault();active=card;startX=e.clientX;startY=e.clientY;baseX=Number(card.dataset.x||0);baseY=Number(card.dataset.y||0);if(!interactive)card.setPointerCapture(e.pointerId);card.classList.add('dragging')});card.addEventListener('pointermove',e=>{if(active!==card)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;card.dataset.x=baseX+dx;card.dataset.y=baseY+dy;card.style.setProperty('--drag-x',`${card.dataset.x}px`);card.style.setProperty('--drag-y',`${card.dataset.y}px`)});const stop=()=>{if(active!==card)return;active=null;card.classList.remove('dragging');if(moved){setTimeout(()=>moved=false,80)}};card.addEventListener('pointerup',stop);card.addEventListener('pointercancel',stop);card.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false}},true)});
const menu=document.querySelector('.menu-toggle');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});document.querySelectorAll('.site-head nav a').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false')}));
const cursor=document.querySelector('.cursor-label');if(matchMedia('(hover:hover) and (pointer:fine)').matches){window.addEventListener('pointermove',e=>{cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`});document.querySelectorAll('.work-card').forEach(c=>{c.addEventListener('mouseenter',()=>cursor.classList.add('active'));c.addEventListener('mouseleave',()=>cursor.classList.remove('active'))})}
const heroVideo=document.querySelector('.hero-card-preview video');
heroVideo?.addEventListener('loadedmetadata',()=>{heroVideo.currentTime=3.2;},{once:true});


const cubeModel=document.querySelector('#cubeModel');
const cubeStage=document.querySelector('.cube-stage');
if(cubeModel&&cubeStage&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  let cubeX=0,cubeY=0,targetCubeX=0,targetCubeY=0;
  cubeStage.addEventListener('pointermove',event=>{const bounds=cubeStage.getBoundingClientRect();targetCubeY=((event.clientX-bounds.left)/bounds.width-.5)*34;targetCubeX=-((event.clientY-bounds.top)/bounds.height-.5)*24;});
  cubeStage.addEventListener('pointerleave',()=>{targetCubeX=0;targetCubeY=0});
  const updateCube=()=>{cubeX+=(targetCubeX-cubeX)*.06;cubeY+=(targetCubeY-cubeY)*.06;cubeModel.style.setProperty('--mouse-tilt-x',`${cubeX}deg`);cubeModel.style.setProperty('--mouse-tilt-y',`${cubeY}deg`);requestAnimationFrame(updateCube)};updateCube();
}
// Portfolio content editor: inline text, direct cover replacement, ordered multi-asset galleries.
(()=>{
 const DB_NAME='portfolio-editor-v2',STORE='records';let db;
 const dbReady=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>req.result.createObjectStore(STORE);req.onsuccess=()=>{db=req.result;resolve()};req.onerror=()=>reject(req.error)});
 const dbGet=async key=>{await dbReady;return new Promise((resolve,reject)=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})};
 const dbSet=async(key,value)=>{await dbReady;return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})};
 const $=s=>document.querySelector(s);const projects=[...document.querySelectorAll('.work-card')];
 const textSelector='header a,header .edition,.edge-note,.hero-project-card span,.hero-project-card h2,.intro-caption span,.intro-title,.hero-coordinate,.cube-page-meta span,.cube-page-caption span,.section-meta span,.projects-title,.card-image b,.card-image h3,.card-image span,.card-info span,.projects-bottom span,.interlude-kicker,.interlude-word,.about-copy,.interlude-foot,.contact-top span,.contact-top a,.contact p,.email,.contact h2,.contact footer span';
 const textElements=[...document.querySelectorAll(textSelector)];textElements.forEach((el,i)=>el.dataset.inlineEdit=String(i));
 const customTextKey='portfolio-custom-text-v1';
 const customSections=[...document.querySelectorAll('main > section')];
 const addCustomText=(record)=>{
  const section=customSections[record.section];if(!section)return null;
  const el=document.createElement('div');el.className='custom-text-box';el.dataset.customText='true';el.dataset.inlineEdit=String(textElements.length);
  el.innerHTML=record.html||'点击这里输入文字';el.style.left=record.left||'10%';el.style.top=record.top||'40%';
  section.append(el);textElements.push(el);return el;
 };
 try{const records=JSON.parse(localStorage.getItem(customTextKey)||'[]');if(Array.isArray(records))records.forEach(addCustomText)}catch{}
 const saveCustomText=()=>{const records=[...document.querySelectorAll('[data-custom-text]')].map(el=>({section:customSections.indexOf(el.parentElement),html:el.innerHTML,left:el.style.left,top:el.style.top}));try{localStorage.setItem(customTextKey,JSON.stringify(records))}catch{}};
 const saveText=()=>{const data={};textElements.forEach((el,i)=>data[i]=el.innerHTML);try{localStorage.setItem('portfolio-inline-text-v2',JSON.stringify(data))}catch{}saveCustomText()};
 try{const saved=JSON.parse(localStorage.getItem('portfolio-inline-text-v2')||'{}');textElements.forEach((el,i)=>{if(saved[i]!=null)el.innerHTML=saved[i]})}catch{}
 // Keep this bilingual introduction's English line two pixels below its Chinese size.
 const englishIntro='Designer exploring the boundary between AI and visual storytelling.';
 textElements.filter(el=>el.closest('#about')&&(/探索\s*AI\s*与视觉叙事边界的设计师/i.test(el.textContent)||/Designer exploring the boundary/i.test(el.textContent))).forEach(el=>el.classList.add('responsive-about-intro'));
 textElements.filter(el=>el.textContent.includes(englishIntro)).forEach(el=>{
  if(el.querySelector('.intro-english-line'))return;
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const index=node.textContent.indexOf(englishIntro);if(index<0)return;
   const range=document.createRange();range.setStart(node,index);range.setEnd(node,index+englishIntro.length);
   const line=document.createElement('span');line.className='intro-english-line';range.surroundContents(line);
  });
 });
 // Keep site identity updates authoritative even in browsers with older locally saved text.
 const movingHeadline=document.querySelector('.interlude-word');
 if(movingHeadline){
  const walker=document.createTreeWalker(movingHeadline,NodeFilter.SHOW_TEXT);const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
   if(node.parentElement.closest('.moving-english-size'))return;
   const match=node.textContent.match(/[A-Za-z][A-Za-z\s/·&—-]*/);if(!match)return;
   const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
   const span=document.createElement('span');span.className='moving-english-size';range.surroundContents(span);
  });
 }
 const brand=document.querySelector('.brand');if(brand){brand.innerHTML='TING<span>.</span>';brand.setAttribute('aria-label','TING 首页')}
 const coordinate=document.querySelector('.hero-coordinate');if(coordinate)coordinate.textContent='20°13′N 117°19′E';
 const portfolioLabel=document.querySelector('.edge-note');if(portfolioLabel)portfolioLabel.innerHTML=portfolioLabel.innerHTML.replace(/SELECTED WORKS/gi,'PORTFOLIO');
 if(document.title.includes('Selected Works'))document.title='TING — Portfolio 2026';
 const toggle=$('#edit-text-toggle'),saveBtn=$('#save-site-edits'),hint=$('#editor-hint');let editing=false;
 const typography=document.createElement('div');typography.className='typography-controls';
 typography.innerHTML='<label>字体 <select aria-label="字体"><option value="">原字体</option><option value="Manrope, sans-serif">Manrope</option><option value="Microsoft YaHei, sans-serif">微软雅黑</option><option value="SimSun, serif">宋体</option><option value="KaiTi, serif">楷体</option><option value="Georgia, serif">Georgia</option><option value="monospace">等宽字体</option></select></label><label>字号 <input aria-label="字号" type="number" min="6" max="256" step="1" placeholder="px"> px</label>';
 saveBtn.before(typography);
 const fontControl=typography.querySelector('select'),sizeControl=typography.querySelector('input');
 let activeText=null,textRange=null;
 const styleKey='portfolio-text-styles-v1';
 try{const styles=JSON.parse(localStorage.getItem(styleKey)||'{}');textElements.forEach((el,i)=>{if(styles[i]?.fontFamily)el.style.fontFamily=styles[i].fontFamily;if(styles[i]?.fontSize)el.style.fontSize=styles[i].fontSize})}catch{}
 const saveStyles=()=>{const styles={};textElements.forEach((el,i)=>styles[i]={fontFamily:el.style.fontFamily,fontSize:el.style.fontSize});try{localStorage.setItem(styleKey,JSON.stringify(styles))}catch{}saveText()};
 document.addEventListener('selectionchange',()=>{
  if(!editing)return;
  const selection=getSelection();if(!selection.rangeCount)return;
  const range=selection.getRangeAt(0),node=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement;
  const target=node.closest('[data-inline-edit]');
  if(!target||!target.contains(range.endContainer))return;
  activeText=target;textRange=range.cloneRange();
  const computed=getComputedStyle(node);fontControl.value=target.style.fontFamily||'';sizeControl.value=Math.round(parseFloat(computed.fontSize));
 });
 const applyTypography=(property,value)=>{
  if(!editing||!activeText){if(hint)hint.textContent='请先开始编辑，再点击或选中要调整的文字';return}
  if(textRange&&!textRange.collapsed&&activeText.contains(textRange.commonAncestorContainer)){
   const span=document.createElement('span');span.style[property]=value;span.append(textRange.extractContents());textRange.insertNode(span);
   textRange.selectNodeContents(span);
  }else{activeText.style[property]=value}
  saveStyles();if(hint)hint.textContent='字体样式已保存到当前浏览器';
 };
 fontControl.addEventListener('change',()=>applyTypography('fontFamily',fontControl.value));
 sizeControl.addEventListener('change',()=>{const size=Number(sizeControl.value);if(size>=6&&size<=256)applyTypography('fontSize',`${size}px`)});
 saveBtn.addEventListener('click',saveStyles);
 const positionControls=document.createElement('div');positionControls.className='typography-controls position-controls';
 const addTextButton=document.createElement('button');addTextButton.type='button';addTextButton.className='add-text-button';addTextButton.textContent='新增文字';saveBtn.before(addTextButton);
 addTextButton.addEventListener('click',()=>{
  if(!editing){if(hint)hint.textContent='请先点击开始编辑';return}
  const section=customSections.reduce((best,item)=>{const bounds=item.getBoundingClientRect();const visible=Math.max(0,Math.min(bounds.bottom,innerHeight)-Math.max(bounds.top,0));return visible>best.visible?{item,visible}:best},{item:customSections[0],visible:-1}).item;
  const bounds=section.getBoundingClientRect();const top=Math.max(24,Math.min(bounds.height-48,innerHeight/2-bounds.top));
  const el=addCustomText({section:customSections.indexOf(section),top:`${top}px`});
  el.contentEditable='true';activeText=el;el.focus();const range=document.createRange();range.selectNodeContents(el);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);textRange=range.cloneRange();saveText();
  if(hint)hint.textContent='文字框已添加，可直接输入；使用字体、字号和方向按钮调整';
 });
 positionControls.innerHTML='<label>移动步长 <input aria-label="文字移动步长" type="number" min="1" max="100" value="4"> px</label><button type="button" data-dx="-1" data-dy="0" aria-label="文字左移">←</button><button type="button" data-dx="0" data-dy="-1" aria-label="文字上移">↑</button><button type="button" data-dx="0" data-dy="1" aria-label="文字下移">↓</button><button type="button" data-dx="1" data-dy="0" aria-label="文字右移">→</button><button type="button" data-reset="true">位置复位</button>';
 saveBtn.before(positionControls);
 const positionKey='portfolio-text-positions-v1';let positions={};
 const applyPosition=(el,offset)=>{el.style.translate=`${offset.x}px ${offset.y}px`};
 try{positions=JSON.parse(localStorage.getItem(positionKey)||'{}');textElements.forEach((el,i)=>{const offset=positions[i];if(offset&&Number.isFinite(offset.x)&&Number.isFinite(offset.y))applyPosition(el,offset)})}catch{positions={}}
 document.addEventListener('click',event=>{if(!editing)return;const target=event.target.closest('[data-inline-edit]');if(target){activeText=target;if(hint)hint.textContent='已选中文字，可调整字体、字号或位置'}});
 positionControls.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(!editing||!activeText){if(hint)hint.textContent='请先开始编辑，再点击要移动的文字';return}
  const step=Number(positionControls.querySelector('input').value);if(!Number.isFinite(step)||step<1||step>100)return;
  const key=activeText.dataset.inlineEdit,previous=positions[key]||{x:0,y:0};
  const offset=button.dataset.reset?{x:0,y:0}:{x:previous.x+Number(button.dataset.dx)*step,y:previous.y+Number(button.dataset.dy)*step};
  positions[key]=offset;applyPosition(activeText,offset);
  try{localStorage.setItem(positionKey,JSON.stringify(positions));if(hint)hint.textContent=`文字位置已保存：横向 ${offset.x}px，纵向 ${offset.y}px`}catch{if(hint)hint.textContent='位置已调整，但当前浏览器无法保存'}
 });
 toggle?.addEventListener('click',()=>{editing=!editing;toggle.textContent=editing?'完成编辑':'开始编辑';document.body.classList.toggle('site-editing',editing);textElements.forEach(el=>el.contentEditable=editing?'true':'false');if(hint)hint.textContent=editing?'点击标题、简介或说明直接修改；点到文字外自动保存':'文字修改已自动保存'});
 document.addEventListener('focusout',e=>{if(e.target.matches('[contenteditable="true"]')){saveText();if(hint)hint.textContent='文字修改已保存'}});
 saveBtn?.addEventListener('click',()=>{saveText();if(hint)hint.textContent='页面文字已保存'});
 const mediaNode=(blob,type)=>{const el=type.startsWith('video/')?document.createElement('video'):document.createElement('img');el.src=URL.createObjectURL(blob);el.className='portfolio-media';if(el.tagName==='VIDEO'){el.autoplay=true;el.muted=true;el.loop=true;el.playsInline=true;el.controls=false}return el};
 const choose=(multiple,callback)=>{const input=document.createElement('input');input.type='file';input.accept='image/*,video/*';input.multiple=multiple;input.style.cssText='position:fixed;left:-10000px';document.body.append(input);input.addEventListener('change',async()=>{const files=[...input.files];input.remove();if(files.length)await callback(files)});input.click()};
 const showHint=message=>{if(hint)hint.textContent=message};
 const homePreview=$('.hero-card-preview');
 async function setCover(cardIndex,container,file){const type=file.type||'image/*';const media=mediaNode(file,type);media.classList.add('portfolio-cover');const previous=container.querySelector(':scope > .portfolio-cover');if(previous)previous.remove();container.prepend(media);await dbSet(`cover-${cardIndex}`,{blob:file,type});if(cardIndex===2&&homePreview){const home=mediaNode(file,type);home.classList.add('portfolio-cover');homePreview.replaceChildren(home);await dbSet('home-cover',{blob:file,type})}showHint(`封面已替换${cardIndex===2?'，首页对应卡片已同步':''}`)}
 async function drawCover(i,container){const saved=await dbGet(`cover-${i}`);if(saved?.blob){const m=mediaNode(saved.blob,saved.type);m.classList.add('portfolio-cover');container.prepend(m);if(i===2&&homePreview){const h=mediaNode(saved.blob,saved.type);h.classList.add('portfolio-cover');homePreview.replaceChildren(h)}}}
 function renderGallery(i,gallery,assets){gallery.replaceChildren();assets.forEach((asset,index)=>{const item=document.createElement('figure');item.className='gallery-item';const media=mediaNode(asset.blob,asset.type);media.controls=media.tagName==='VIDEO';item.append(media);const caption=document.createElement('figcaption');const label=document.createElement('span');label.textContent=`${String(index+1).padStart(2,'0')} · ${asset.name|| (asset.type.startsWith('video/')?'视频':'图片')}`;const replace=document.createElement('button');replace.type='button';replace.textContent='替换';replace.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();choose(false,async files=>{const next=files[0];assets[index]={blob:next,type:next.type,name:next.name};await dbSet(`gallery-${i}`,assets);renderGallery(i,gallery,assets)})});const remove=document.createElement('button');remove.type='button';remove.textContent='移除';remove.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();assets.splice(index,1);await dbSet(`gallery-${i}`,assets);renderGallery(i,gallery,assets)});caption.append(label,replace,remove);item.append(caption);gallery.append(item)});}
 projects.forEach((card,i)=>{const cover=card.querySelector('.card-image'),gallery=card.querySelector('.project-gallery'),picker=card.querySelector('.asset-input');if(!cover||!gallery)return;
  cover.addEventListener('click',e=>{if(e.target.closest('button,.asset-button'))return;e.preventDefault();e.stopPropagation();choose(false,files=>setCover(i,cover,files[0]))});
  const addLabel=picker?.closest('.asset-button');addLabel?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();choose(true,async files=>{const assets=(await dbGet(`gallery-${i}`))||[];for(const file of files)assets.push({blob:file,type:file.type||'image/*',name:file.name});await dbSet(`gallery-${i}`,assets);renderGallery(i,gallery,assets);showHint(`已按顺序添加 ${files.length} 项素材`)})});
  dbReady.then(async()=>{await drawCover(i,cover);const assets=(await dbGet(`gallery-${i}`))||[];renderGallery(i,gallery,assets)}).catch(error=>console.warn('素材恢复失败',error));
 });
 const homePickerTarget=homePreview;if(homePickerTarget)homePickerTarget.addEventListener('click',e=>{if(e.target.closest('.portfolio-cover'))return;e.preventDefault();e.stopPropagation();choose(false,async files=>{const file=files[0],m=mediaNode(file,file.type);m.classList.add('portfolio-cover');homePickerTarget.replaceChildren(m);await dbSet('home-cover',{blob:file,type:file.type});showHint('首页封面已替换')})});
 const cubeFront=$('.cube-front');if(cubeFront)cubeFront.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();choose(false,async files=>{const file=files[0],m=mediaNode(file,file.type);m.classList.add('portfolio-cover');cubeFront.prepend(m);await dbSet('cube-cover',{blob:file,type:file.type});showHint('展示盒封面已替换')})});
 dbReady.then(async()=>{const saved=await dbGet('home-cover');if(saved?.blob&&homePreview){const m=mediaNode(saved.blob,saved.type);m.classList.add('portfolio-cover');homePreview.replaceChildren(m)}const cube=await dbGet('cube-cover');if(cube?.blob&&cubeFront){const m=mediaNode(cube.blob,cube.type);m.classList.add('portfolio-cover');cubeFront.prepend(m)}}).catch(()=>{});
})();
