const showcase=document.querySelector('#showcase');
let targetX=0,targetY=0,currentX=0,currentY=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
window.addEventListener('pointermove',e=>{targetX=(e.clientX/innerWidth-.5)*12;targetY=(e.clientY/innerHeight-.5)*-9;document.documentElement.style.setProperty('--pointer-x',`${e.clientX}px`);document.documentElement.style.setProperty('--pointer-y',`${e.clientY}px`)});
function frame(){currentX+=(targetX-currentX)*.045;currentY+=(targetY-currentY)*.045;showcase.style.setProperty('--tilt-x',`${currentY}deg`);showcase.style.setProperty('--tilt-y',`${currentX}deg`);requestAnimationFrame(frame)} if(!reduced)frame();
const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');reveal.unobserve(entry.target)}}),{threshold:.16});document.querySelectorAll('.work-card,.intro-title,.projects-title,.contact p,.contact h2,.about-copy').forEach(el=>reveal.observe(el));
let active=null;document.querySelectorAll('.work-card').forEach(card=>{let startX=0,startY=0,baseX=0,baseY=0,moved=false;card.addEventListener('pointerdown',e=>{if(e.target.closest('a'))e.preventDefault();active=card;startX=e.clientX;startY=e.clientY;baseX=Number(card.dataset.x||0);baseY=Number(card.dataset.y||0);card.setPointerCapture(e.pointerId);card.classList.add('dragging')});card.addEventListener('pointermove',e=>{if(active!==card)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;card.dataset.x=baseX+dx;card.dataset.y=baseY+dy;card.style.setProperty('--drag-x',`${card.dataset.x}px`);card.style.setProperty('--drag-y',`${card.dataset.y}px`)});const stop=()=>{if(active!==card)return;active=null;card.classList.remove('dragging');if(moved){setTimeout(()=>moved=false,80)}};card.addEventListener('pointerup',stop);card.addEventListener('pointercancel',stop);card.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false}},true)});
const menu=document.querySelector('.menu-toggle');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});document.querySelectorAll('.site-head nav a').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false')}));
const cursor=document.querySelector('.cursor-label');if(matchMedia('(hover:hover) and (pointer:fine)').matches){window.addEventListener('pointermove',e=>{cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`});document.querySelectorAll('.work-card').forEach(c=>{c.addEventListener('mouseenter',()=>cursor.classList.add('active'));c.addEventListener('mouseleave',()=>cursor.classList.remove('active'))})}
const heroVideo=document.querySelector('.showcase-video');
heroVideo.addEventListener('loadedmetadata',()=>{heroVideo.currentTime=3.2;},{once:true});


const cubeModel=document.querySelector('#cubeModel');
const cubeStage=document.querySelector('.cube-stage');
if(cubeModel&&cubeStage&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  let cubeX=0,cubeY=0,targetCubeX=0,targetCubeY=0;
  cubeStage.addEventListener('pointermove',event=>{const bounds=cubeStage.getBoundingClientRect();targetCubeY=((event.clientX-bounds.left)/bounds.width-.5)*34;targetCubeX=-((event.clientY-bounds.top)/bounds.height-.5)*24;});
  cubeStage.addEventListener('pointerleave',()=>{targetCubeX=0;targetCubeY=0});
  const updateCube=()=>{cubeX+=(targetCubeX-cubeX)*.06;cubeY+=(targetCubeY-cubeY)*.06;cubeModel.style.setProperty('--mouse-tilt-x',`${cubeX}deg`);cubeModel.style.setProperty('--mouse-tilt-y',`${cubeY}deg`);requestAnimationFrame(updateCube)};updateCube();
}
// Portfolio editing workflow: inline text, direct cover replacement, ordered project galleries.
(()=>{
 const dbName='portfolio-content-v1';let db;
 const openDb=()=>new Promise((resolve,reject)=>{const req=indexedDB.open(dbName,1);req.onupgradeneeded=()=>req.result.createObjectStore('assets');req.onsuccess=()=>{db=req.result;resolve(db)};req.onerror=()=>reject(req.error)});
 const put=(key,value)=>new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite');tx.objectStore('assets').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
 const getAll=()=>new Promise((resolve,reject)=>{const tx=db.transaction('assets','readonly'),req=tx.objectStore('assets').getAllKeys();req.onsuccess=()=>{const keys=req.result;Promise.all(keys.map(key=>new Promise(res=>{const r=tx.objectStore('assets').get(key);r.onsuccess=()=>res([key,r.result])}))).then(resolve)};req.onerror=()=>reject(req.error)});
 const mediaEl=(fileOrBlob,type)=>{const el=type.startsWith('video/')?document.createElement('video'):document.createElement('img');el.src=URL.createObjectURL(fileOrBlob);el.className='portfolio-media';if(el.tagName==='VIDEO'){el.autoplay=true;el.muted=true;el.loop=true;el.playsInline=true}return el};
 const saveText=()=>{const data={};document.querySelectorAll('[data-inline-edit]').forEach((el,i)=>data[i]=el.innerHTML);localStorage.setItem('portfolio-inline-text',JSON.stringify(data))};
 const indexText=()=>document.querySelectorAll('header a,header .edition,.edge-note,.hero-project-card span,.hero-project-card h2,.intro-caption span,.intro-title,.hero-coordinate,.cube-page-meta span,.cube-page-caption span,.section-meta span,.projects-title,.card-image b,.card-image h3,.card-image span,.card-info span,.projects-bottom span,.interlude-kicker,.interlude-word,.about-copy,.interlude-foot,.contact-top span,.contact-top a,.contact p,.email,.contact h2,.contact footer span').forEach((el,i)=>el.dataset.inlineEdit=i);
 const restoreText=()=>{try{const data=JSON.parse(localStorage.getItem('portfolio-inline-text')||'{}');document.querySelectorAll('[data-inline-edit]').forEach((el,i)=>{if(data[i]!=null)el.innerHTML=data[i]})}catch{}};
 const makePicker=(accept,multiple,callback)=>{const input=document.createElement('input');input.type='file';input.accept=accept;input.multiple=multiple;input.hidden=true;document.body.append(input);input.onchange=()=>{if(input.files.length)callback([...input.files]);input.remove()};input.click()};
 const saveButton=document.getElementById('save-site-edits');saveButton?.addEventListener('click',saveText);
 const toggle=document.getElementById('edit-text-toggle');toggle?.addEventListener('click',()=>{const on=toggle.dataset.on!=='1';toggle.dataset.on=on?'1':'0';toggle.textContent=on?'完成编辑':'开始编辑';document.body.classList.toggle('site-editing',on);document.querySelectorAll('[data-inline-edit]').forEach(el=>el.contentEditable=on?'true':'false')});
 document.addEventListener('focusout',e=>{if(e.target.matches('[contenteditable="true"]'))saveText()});
 indexText();restoreText();
 const projects=[...document.querySelectorAll('.work-card')];
 projects.forEach((card,i)=>{
  const cover=card.querySelector('.card-image');const gallery=card.querySelector('.project-gallery');const fileInput=card.querySelector('.asset-input');
  const applyCover=file=>{const type=file.type||'image/*';const old=cover.querySelector('.portfolio-cover');const media=mediaEl(file,type);media.classList.add('portfolio-cover');if(old)old.replaceWith(media);else cover.prepend(media);put(`cover-${i}`,{blob:file,type}).catch(()=>{});if(i===2){const home=document.querySelector('.hero-card-preview');if(home){const clone=mediaEl(file,type);clone.classList.add('portfolio-cover');home.replaceChildren(clone)}}};
  cover.addEventListener('click',e=>{if(e.target.closest('.asset-button'))return;e.preventDefault();e.stopPropagation();makePicker('image/*,video/*',false,files=>applyCover(files[0]))});
  fileInput?.addEventListener('change',()=>{[...fileInput.files].forEach(file=>gallery.appendChild(makeGalleryItem(file)));fileInput.value=''});
  function makeGalleryItem(file){const item=document.createElement('figure');item.className='gallery-item';const media=mediaEl(file,file.type);item.append(media);const controls=document.createElement('figcaption');const replace=document.createElement('button');replace.textContent='替换';replace.onclick=()=>makePicker('image/*,video/*',false,files=>{const next=files[0],m=mediaEl(next,next.type);item.querySelector('video,img').replaceWith(m);persistGallery()});const remove=document.createElement('button');remove.textContent='移除';remove.onclick=()=>{item.remove();persistGallery()};controls.append(replace,remove);item.append(controls);persistGallery();return item}
  function persistGallery(){const entries=[...gallery.querySelectorAll('.gallery-item')].map(item=>{const m=item.querySelector('video,img');return {src:m.currentSrc||m.src,type:m.tagName==='VIDEO'?'video/mp4':'image/*'}});localStorage.setItem(`portfolio-gallery-${i}`,JSON.stringify(entries))}
  openDb().then(async()=>{const records=await getAll();const coverRecord=records.find(([key])=>key===`cover-${i}`);if(coverRecord){const value=coverRecord[1];applyCover(value.blob)}const galleryRecord=records.find(([key])=>key===`gallery-${i}`);if(galleryRecord)galleryRecord[1].forEach(asset=>{const item=makeGalleryItem(asset.blob);gallery.append(item)})}).catch(()=>{});
  const add=fileInput?.closest('.asset-button');if(add){add.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()});fileInput.addEventListener('change',async()=>{for(const file of fileInput.files){try{await put(`gallery-${i}-${Date.now()}-${Math.random()}`,{blob:file,type:file.type})}catch{}}})}
 });
 document.querySelectorAll('.hero-card-preview,.cube-front').forEach(region=>region.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();makePicker('image/*,video/*',false,files=>{const file=files[0],m=mediaEl(file,file.type);region.replaceChildren(m);openDb().then(()=>put('hero-cover',{blob:file,type:file.type})).catch(()=>{})})}));
})();

