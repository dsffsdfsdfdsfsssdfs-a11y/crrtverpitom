'use client';
import './admin.css';
import { FormEvent, useEffect, useRef, useState } from 'react';
type Content=any;
const setPath=(o:any,path:string,value:string)=>{const p=path.split('.');let x=o;for(let i=0;i<p.length-1;i++)x=x[p[i]];x[p.at(-1)!]=value};
const readDataUrl=(file:Blob)=>new Promise<string>((ok,bad)=>{const r=new FileReader();r.onload=()=>ok(String(r.result));r.onerror=bad;r.readAsDataURL(file)});
async function optimizeImage(file:File){
 if(!file.type.startsWith('image/')||file.type==='image/svg+xml')return file;
 try{
  const bitmap=await createImageBitmap(file);
  const maxSide=1600;
  const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  if(scale===1&&file.size<350000){bitmap.close();return file}
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));
  canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d');
  if(!ctx){bitmap.close();return file}
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  bitmap.close();
  const blob=await new Promise<Blob|null>(ok=>canvas.toBlob(ok,'image/webp',.78));
  if(!blob||blob.size>=file.size)return file;
  return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp'});
 }catch{return file}
}
export default function Admin(){
 const [password,setPassword]=useState(''),[content,setContent]=useState<Content|null>(null),[message,setMessage]=useState(''),[uploading,setUploading]=useState(0),[saving,setSaving]=useState(false);const previewRef=useRef<HTMLIFrameElement>(null);const contentRef=useRef<Content|null>(null);
 const sendPreview=(next:Content|null=contentRef.current)=>{if(next)previewRef.current?.contentWindow?.postMessage({type:'crr-preview',content:next},window.location.origin)};
 useEffect(()=>{contentRef.current=content;if(content){requestAnimationFrame(()=>sendPreview(content))}},[content]);
 useEffect(()=>{const ready=(event:MessageEvent)=>{if(event.origin===window.location.origin&&event.data?.type==='crr-preview-ready')sendPreview()};window.addEventListener('message',ready);return()=>window.removeEventListener('message',ready)},[]);
 useEffect(()=>{
  let raf=0;
  const syncPreviewScroll=()=>{
   cancelAnimationFrame(raf);
   raf=requestAnimationFrame(()=>{
    const frame=previewRef.current;
    const win=frame?.contentWindow;
    if(!frame||!win)return;
    try{
     const doc=win.document.documentElement;
     const pageMax=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
     const previewMax=Math.max(0,doc.scrollHeight-frame.clientHeight);
     const ratio=Math.min(1,Math.max(0,window.scrollY/pageMax));
     win.scrollTo({top:previewMax*ratio,behavior:'auto'});
    }catch{}
   });
  };
  window.addEventListener('scroll',syncPreviewScroll,{passive:true});
  window.addEventListener('resize',syncPreviewScroll);
  const frame=previewRef.current;
  frame?.addEventListener('load',syncPreviewScroll);
  syncPreviewScroll();
  return()=>{
   cancelAnimationFrame(raf);
   window.removeEventListener('scroll',syncPreviewScroll);
   window.removeEventListener('resize',syncPreviewScroll);
   frame?.removeEventListener('load',syncPreviewScroll);
  };
 },[]);
 const change=(path:string,value:string)=>setContent((old:Content)=>{const copy=structuredClone(old);setPath(copy,path,value);return copy});
 async function login(e:FormEvent){e.preventDefault();const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});if(!r.ok){setMessage((await r.json()).error);return}setContent(await fetch('/api/admin/content?ts='+Date.now(),{cache:'no-store'}).then(x=>x.json()))}
 async function save(){if(uploading){setMessage('Фото ещё загружается — подожди пару секунд.');return}if(saving||!content)return;setSaving(true);setMessage('Сохраняю…');try{const r=await fetch('/api/admin/save',{method:'POST',headers:{'Content-Type':'application/json','Cache-Control':'no-cache'},cache:'no-store',body:JSON.stringify(content)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Ошибка сохранения');const fresh=await fetch('/api/admin/content?ts='+Date.now(),{cache:'no-store'}).then(x=>{if(!x.ok)throw new Error('Не удалось проверить сохранение');return x.json()});setContent(fresh);contentRef.current=fresh;sendPreview(fresh);setMessage('Сохранено. Изменения записаны на сервер и уже видны на сайте.')}catch(error){setMessage(error instanceof Error?error.message:'Ошибка сохранения')}finally{setSaving(false)}}
 async function upload(index:number,file:File,target?:string){
  const path=index===-1?'header.logoImage':target?target+'.image':'galleryImages.'+index;
  const previous=path.split('.').reduce((o:any,k)=>o?.[k],content);
  const previewUrl=URL.createObjectURL(file);
  change(path,previewUrl);
  setUploading(x=>x+1);
  setMessage('Фото уже видно в предпросмотре. Загружаю…');
  try{
    const optimized=await optimizeImage(file);
    const dataUrl=await readDataUrl(optimized);
    const r=await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:optimized.name,base64:dataUrl.split(',')[1]})});
    const data=await r.json();
    if(!r.ok||!data.url)throw new Error(data.error||'Ошибка загрузки');
    change(path,data.url+'?v='+Date.now());
    setMessage('Фото загружено. Сохранение теперь займёт доли секунды.');
  }catch(error){
    change(path,typeof previous==='string'?previous:'');
    setMessage(error instanceof Error?error.message:'Ошибка загрузки');
  }finally{
    setUploading(x=>Math.max(0,x-1));
    window.setTimeout(()=>URL.revokeObjectURL(previewUrl),5000);
  }
 }
 if(!content)return <main className="admin-shell"><form className="login-card" onSubmit={login}><p className="eyebrow gold">ЦЕНТР РАЗМНОЖЕНИЯ РАСТЕНИЙ</p><h1>Вход в редактор</h1><p>Доступ только для владельца сайта.</p><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Пароль" required/><button className="gold-btn">Войти <span>↗</span></button>{message&&<small>{message}</small>}</form></main>;
 return <main className="admin-shell"><header className="admin-head"><a href="/">← Открыть сайт</a><div><b>Редактор сайта</b><button onClick={save} className="gold-btn" disabled={saving||uploading>0}>{uploading?`Загрузка фото… (${uploading})`:saving?'Сохраняю…':'Сохранить изменения'}</button></div></header><div className="editor-layout"><div className="admin-wrap"><p className="admin-message">{message||'Меняй всё нужное и нажми «Сохранить изменения». Изменения публикуются сразу.'}</p>
 <section><h2>Шапка, логотип и шрифты</h2><label>Название в шапке<input value={content.header.title} onChange={e=>change('header.title',e.target.value)}/></label><label>Подпись под названием<input value={content.header.subtitle} onChange={e=>change('header.subtitle',e.target.value)}/></label><label>Логотип<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(-1,e.target.files[0])}/></label><label>Шрифт заголовков<select value={content.appearance.headingFont} onChange={e=>change('appearance.headingFont',e.target.value)}><option>Playfair Display</option><option>Georgia</option><option>Manrope</option><option>Arial</option></select></label><label>Основной шрифт<select value={content.appearance.bodyFont} onChange={e=>change('appearance.bodyFont',e.target.value)}><option>Manrope</option><option>Arial</option><option>Georgia</option></select></label></section>
 <section><h2>Первый экран</h2><label>Строка над заголовком<input value={content.hero.eyebrow} onChange={e=>change('hero.eyebrow',e.target.value)}/></label><label>Заголовок<input value={content.hero.title} onChange={e=>change('hero.title',e.target.value)}/></label><label>Золотая строка<input value={content.hero.accent} onChange={e=>change('hero.accent',e.target.value)}/></label><label>Описание<textarea value={content.hero.intro} onChange={e=>change('hero.intro',e.target.value)}/></label><label>Фоновое фото первого экрана<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(-2,e.target.files[0],'hero')}/></label></section>
 <section><h2>Контакты</h2><label>Главный телефон<input value={content.phone} onChange={e=>change('phone',e.target.value)}/></label><label>Номер для звонка — только цифры<input value={content.phoneLink} onChange={e=>change('phoneLink',e.target.value)}/></label><label>Почта<input value={content.email} onChange={e=>change('email',e.target.value)}/></label><label>Адрес<input value={content.address} onChange={e=>change('address',e.target.value)}/></label>{content.contacts.map((x:any,i:number)=><div className="contact-edit" key={i}><b>Контакт {i+1}</b><input value={x.name} onChange={e=>change('contacts.'+i+'.name',e.target.value)}/><input value={x.label} onChange={e=>change('contacts.'+i+'.label',e.target.value)}/><input value={x.phone} onChange={e=>change('contacts.'+i+'.phone',e.target.value)} placeholder="Номер для звонка"/></div>)}</section>
 <section><h2>Теплицы и маточник</h2>{['greenhouse','mother'].map(key=><div className="contact-edit" key={key}><b>{key==='greenhouse'?'Тепличный комплекс':'Маточник'}</b><input value={content[key].title} onChange={e=>change(key+'.title',e.target.value)}/><input value={content[key].accent} onChange={e=>change(key+'.accent',e.target.value)}/><textarea value={content[key].text} onChange={e=>change(key+'.text',e.target.value)}/><input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(-2,e.target.files[0],key)}/></div>)}</section>
 <section><h2>Специализация и прайс</h2><label>Заголовок<input value={content.specialty.title} onChange={e=>change('specialty.title',e.target.value)}/></label><label>Текст<textarea value={content.specialty.paragraph1} onChange={e=>change('specialty.paragraph1',e.target.value)}/></label><label>Текст 2<textarea value={content.specialty.paragraph2} onChange={e=>change('specialty.paragraph2',e.target.value)}/></label><label>Ссылка на прайс<input value={content.priceUrl} onChange={e=>change('priceUrl',e.target.value)} placeholder="https://…"/></label></section>
 <section><h2>Ассортимент</h2>{content.assortment.map((x:string,i:number)=><label key={i}>Позиция {i+1}<input value={x} onChange={e=>change('assortment.'+i,e.target.value)}/></label>)}<button type="button" className="outline-btn" onClick={()=>setContent((o:Content)=>({...o,assortment:[...o.assortment,'Новая культура']}))}>Добавить культуру</button></section>
 <section><h2>Фотографии</h2><div className="upload-grid">{content.galleryImages.map((url:string,i:number)=><label className="upload" key={i} style={{backgroundImage:'url('+url+')'}}><input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(i,e.target.files[0])}/><span>Заменить фото</span></label>)}</div>{content.galleryImages.map((_:string,i:number)=><div className="contact-edit" key={'settings'+i}><b>Фото {i+1}: масштаб и сдвиг</b><input type="number" value={content.galleryImageSettings[i].scale} onChange={e=>change('galleryImageSettings.'+i+'.scale',e.target.value)} placeholder="Масштаб"/><input type="number" value={content.galleryImageSettings[i].x} onChange={e=>change('galleryImageSettings.'+i+'.x',e.target.value)} placeholder="По X"/><input type="number" value={content.galleryImageSettings[i].y} onChange={e=>change('galleryImageSettings.'+i+'.y',e.target.value)} placeholder="По Y"/></div>)}<button type="button" className="outline-btn" onClick={()=>setContent((o:Content)=>({...o,galleryImages:[...o.galleryImages,''],galleryImageSettings:[...o.galleryImageSettings,{scale:100,x:50,y:50}]}))}>Добавить фото</button></section>
 <section><h2>Видео</h2><p>Вставь ссылку на YouTube — видео появится на сайте.</p>{content.videos.map((v:any,i:number)=><div className="contact-edit" key={i}><input value={v.title} onChange={e=>change('videos.'+i+'.title',e.target.value)} placeholder="Название видео"/><input value={v.url} onChange={e=>change('videos.'+i+'.url',e.target.value)} placeholder="https://www.youtube.com/watch?v=…"/></div>)}<button type="button" className="outline-btn" onClick={()=>setContent((o:Content)=>({...o,videos:[...o.videos,{title:'Новое видео',url:''}]}))}>Добавить видео</button></section>
 <section><h2>Полезные ссылки</h2>{content.resources.map((x:any,i:number)=><div className="contact-edit" key={i}><input value={x.title} onChange={e=>change('resources.'+i+'.title',e.target.value)}/><input value={x.url} onChange={e=>change('resources.'+i+'.url',e.target.value)} placeholder="Ссылка"/></div>)}</section><section><h2>Размер и положение</h2><p>Числа можно менять и сразу смотреть результат справа.</p>{[['Размер логотипа','header.logoSize'],['Логотип по X','header.logoX'],['Логотип по Y','header.logoY'],['Размер текста шапки (%)','header.textSize'],['Текст шапки по X','header.textX'],['Текст шапки по Y','header.textY'],['Размер главного заголовка (%)','hero.titleSize'],['Главный текст по X','hero.textX'],['Главный текст по Y','hero.textY'],['Масштаб главного фото (%)','hero.imageScale'],['Главное фото по X (%)','hero.imageX'],['Главное фото по Y (%)','hero.imageY']].map(([label,path])=><label key={path}>{label}<input type="number" value={path.split('.').reduce((o:any,k)=>o[k],content)} onChange={e=>change(path,e.target.value)}/></label>)}</section></div><aside className="preview-panel"><div className="preview-label"><span>Предпросмотр</span><small>Изменения видны сразу</small></div><div className="preview-frame"><iframe ref={previewRef} src="/?preview=1" title="Предпросмотр сайта" onLoad={()=>sendPreview(content)}/></div></aside></div></main>}
