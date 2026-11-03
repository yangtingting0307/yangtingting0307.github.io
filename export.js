// Export the rendered portfolio as a portable, dependency-free ZIP archive.
(()=>{
 const toolbar=document.querySelector('.asset-toolbar');if(!toolbar)return;
 const button=document.createElement('button');button.type='button';button.textContent='导出网站';toolbar.append(button);
 const encoder=new TextEncoder();
 const chooseFolder=()=>new Promise(resolve=>{
  const input=document.createElement('input');input.type='file';input.webkitdirectory=true;input.multiple=true;input.hidden=true;document.body.append(input);
  input.addEventListener('change',()=>{const files=new Map();for(const file of input.files){const path=file.webkitRelativePath.split('/').slice(1).join('/');files.set(path,file)}input.remove();resolve(files)},{once:true});
  input.addEventListener('cancel',()=>{input.remove();resolve(null)},{once:true});input.click();
 });
 const crc32=bytes=>{let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return(crc^0xffffffff)>>>0};
 const header=(length)=>new DataView(new ArrayBuffer(length));
 function zip(files){const parts=[],directory=[];let offset=0,centralSize=0;
  for(const [name,bytes] of files){const path=encoder.encode(name),crc=crc32(bytes),local=header(30);local.setUint32(0,0x04034b50,true);local.setUint16(4,20,true);local.setUint16(6,0x800,true);local.setUint32(14,crc,true);local.setUint32(18,bytes.length,true);local.setUint32(22,bytes.length,true);local.setUint16(26,path.length,true);parts.push(local,path,bytes);
   const entry=header(46);entry.setUint32(0,0x02014b50,true);entry.setUint16(4,20,true);entry.setUint16(6,20,true);entry.setUint16(8,0x800,true);entry.setUint32(16,crc,true);entry.setUint32(20,bytes.length,true);entry.setUint32(24,bytes.length,true);entry.setUint16(28,path.length,true);entry.setUint32(42,offset,true);directory.push(entry,path);centralSize+=46+path.length;offset+=30+path.length+bytes.length;
  }
  const end=header(22);end.setUint32(0,0x06054b50,true);end.setUint16(8,files.size,true);end.setUint16(10,files.size,true);end.setUint32(12,centralSize,true);end.setUint32(16,offset,true);return new Blob([...parts,...directory,end],{type:'application/zip'});
 }
 button.addEventListener('click',async()=>{
  const hint=document.querySelector('#editor-hint');button.disabled=true;button.textContent='正在打包…';
  try{
   let folder=null;
   if(location.protocol==='file:'){if(hint)hint.textContent='请选择包含 index.html、style.css 和素材的网站项目文件夹';folder=await chooseFolder();if(!folder){if(hint)hint.textContent='已取消导出';return}}
   const readAsset=async value=>{
    const url=new URL(value,document.baseURI);
    if(folder&&url.protocol==='file:'){
     const base=new URL('.',document.baseURI).pathname;
     const path=decodeURIComponent(url.pathname.startsWith(base)?url.pathname.slice(base.length):url.pathname);
     const file=folder.get(path);if(!file)throw Error('所选文件夹缺少文件：'+path);return file;
    }
    const response=await fetch(url);if(!response.ok)throw Error('文件读取失败：'+value);return response.blob();
   };
   document.querySelector('#save-site-edits')?.click();
   const copy=document.documentElement.cloneNode(true),files=new Map(),assets=new Map();
   let css='';for(const sheet of document.styleSheets){if(sheet.href&&new URL(sheet.href).origin!==location.origin)continue;if(folder&&sheet.href){css+=await(await readAsset(sheet.href)).text();continue}try{css+=[...sheet.cssRules].map(rule=>rule.cssText).join('\n')}catch{css+=await(await readAsset(sheet.href)).text()}}
   copy.querySelectorAll('script,.asset-toolbar,.asset-button,.cursor-label,.direct-media-picker,.site-media-input,.gallery-item button').forEach(el=>el.remove());
   copy.querySelectorAll('link[rel="stylesheet"]').forEach(el=>{if(new URL(el.href).origin===location.origin)el.remove()});
   const style=document.createElement('style');style.textContent=css;copy.querySelector('head').append(style);
   copy.querySelector('body').classList.remove('site-editing','menu-open');
   copy.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));
   copy.querySelectorAll('.work-card,.intro-title,.projects-title,.contact p,.contact h2,.about-copy').forEach(el=>el.classList.add('visible'));
   for(const element of copy.querySelectorAll('img,video,source,audio')){
    for(const attribute of ['src','poster']){const value=element.getAttribute(attribute);if(!value||value.startsWith('data:'))continue;
     const url=new URL(value,document.baseURI).href;if(!assets.has(url)){
      const blob=await readAsset(url);
      const extension=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','video/mp4':'mp4','video/webm':'webm','image/svg+xml':'svg'}[blob.type])||new URL(url).pathname.match(/\.([a-z0-9]+)$/i)?.[1]||'bin';
      const path=`assets/media-${assets.size+1}.${extension}`;files.set(path,new Uint8Array(await blob.arrayBuffer()));assets.set(url,path);
     }element.setAttribute(attribute,assets.get(url));
    }
   }
   const menuScript=document.createElement('script');menuScript.textContent="document.querySelector('.menu-toggle')?.addEventListener('click',function(){const open=this.getAttribute('aria-expanded')!=='true';this.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});";copy.querySelector('body').append(menuScript);
   files.set('index.html',encoder.encode('<!doctype html>\n'+copy.outerHTML));
   files.set('README.txt',encoder.encode('解压后将 index.html 与 assets 文件夹一同上传到网站仓库。此包为当前作品集的展示版本，文字和媒体已固化，不依赖浏览器编辑数据。原项目保留编辑功能。'));
   const url=URL.createObjectURL(zip(files)),link=document.createElement('a');link.href=url;link.download='portfolio-website.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
   if(hint)hint.textContent='网站已导出，请将 ZIP 解压后的文件上传 GitHub';
  }catch(error){if(hint)hint.textContent='导出失败：'+error.message+'。若直接打开本地文件，请通过本地网站服务打开后重试。'}
  finally{button.disabled=false;button.textContent='导出网站'}
 });
})();
