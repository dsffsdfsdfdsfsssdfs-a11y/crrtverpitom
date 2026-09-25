'use client';
import './admin.css';
import { FormEvent, useEffect, useRef, useState } from 'react';

type Content = any;

const FONT_OPTIONS=['Georgia','Playfair Display','Manrope','Montserrat','Roboto','Open Sans','Lora','Merriweather','PT Serif','PT Sans','Raleway','Cormorant Garamond','Cormorant','Noto Serif','Noto Sans','Ubuntu','Rubik','Oswald','Fira Sans','Fira Sans Condensed','IBM Plex Sans','IBM Plex Serif','Source Sans 3','Source Serif 4','Alegreya','Alegreya Sans','Old Standard TT','Spectral','Prata','Vollkorn','Philosopher','Tenor Sans','Forum','Marck Script','Bad Script','Caveat','Comfortaa','Poiret One','Yeseva One','Russo One','Unbounded','Golos Text','Neucha','Pacifico','Lobster','Kelly Slab','Jura','Exo 2','Play','Roboto Slab'];

const setPath=(o:any,path:string,value:any)=>{
  const parts=path.split('.');
  let x=o;
  for(let i=0;i<parts.length-1;i++) x=x[parts[i]];
  x[parts[parts.length-1]]=value;
};

const getPath=(o:any,path:string)=>path.split('.').reduce((v:any,k)=>v?.[k],o);

const readDataUrl=(file:Blob)=>new Promise<string>((resolve,reject)=>{
  const r=new FileReader();
  r.onload=()=>resolve(String(r.result));
  r.onerror=reject;
  r.readAsDataURL(file);
});

async function optimizeImage(file:File){
  if(!file.type.startsWith('image/')||file.type==='image/svg+xml') return file;
  try{
    const bitmap=await createImageBitmap(file);
    const maxSide=1800;
    const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d');
    if(!ctx){bitmap.close();return file}
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    bitmap.close();
    const blob=await new Promise<Blob|null>(ok=>canvas.toBlob(ok,'image/webp',.82));
    if(!blob||blob.size>=file.size) return file;
    return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp'});
  }catch{return file}
}

function Section({title,children}:{title:string,children:React.ReactNode}){
  return <section className="editor-card"><div className="editor-card-title"><h2>{title}</h2></div>{children}</section>
}

function Field({label,children,hint}:{label:string,children:React.ReactNode,hint?:string}){
  return <label className="editor-field"><span>{label}</span>{hint&&<small>{hint}</small>}{children}</label>
}

export default function Admin(){
  const [password,setPassword]=useState('');
  const [content,setContent]=useState<Content|null>(null);
  const [message,setMessage]=useState('');
  const [uploading,setUploading]=useState(0);
  const [saving,setSaving]=useState(false);
  const [tab,setTab]=useState('main');
  const previewRef=useRef<HTMLIFrameElement>(null);
  const previewBoxRef=useRef<HTMLDivElement>(null);
  const contentRef=useRef<Content|null>(null);
  const [previewScale,setPreviewScale]=useState(.6);

  const sendPreview=(next:Content|null=contentRef.current)=>{
    if(next) previewRef.current?.contentWindow?.postMessage({type:'crr-preview',content:next},window.location.origin);
  };

  useEffect(()=>{
    contentRef.current=content;
    if(content) requestAnimationFrame(()=>sendPreview(content));
  },[content]);

  useEffect(()=>{
    const ready=(event:MessageEvent)=>{
      if(event.origin===window.location.origin&&event.data?.type==='crr-preview-ready') sendPreview();
    };
    window.addEventListener('message',ready);
    return()=>window.removeEventListener('message',ready);
  },[]);

  useEffect(()=>{
    const box=previewBoxRef.current;
    if(!box) return;
    const update=()=>setPreviewScale(Math.min(1,box.clientWidth/1440));
    update();
    const observer=new ResizeObserver(update);
    observer.observe(box);
    window.addEventListener('resize',update);
    return()=>{observer.disconnect();window.removeEventListener('resize',update)};
  },[]);

  const change=(path:string,value:any)=>setContent((old:Content)=>{
    const copy=structuredClone(old);
    setPath(copy,path,value);
    return copy;
  });

  async function login(e:FormEvent){
    e.preventDefault();
    setMessage('');
    const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
    if(!r.ok){setMessage((await r.json()).error||'Неверный пароль');return}
    const fresh=await fetch('/api/admin/content?ts='+Date.now(),{cache:'no-store'}).then(x=>x.json());
    setContent(fresh);
  }

  async function save(){
    if(!content||saving||uploading) return;
    setSaving(true);
    setMessage('Сохраняю изменения…');
    try{
      const r=await fetch('/api/admin/save',{
        method:'POST',
        headers:{'Content-Type':'application/json','Cache-Control':'no-cache'},
        cache:'no-store',
        body:JSON.stringify(content)
      });
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||'Ошибка сохранения');
      const fresh=await fetch('/api/admin/content?ts='+Date.now(),{cache:'no-store'}).then(x=>x.json());
      setContent(fresh);
      contentRef.current=fresh;
      sendPreview(fresh);
      setMessage('Сохранено. Изменения опубликованы.');
    }catch(err){
      setMessage(err instanceof Error?err.message:'Ошибка сохранения');
    }finally{setSaving(false)}
  }

  async function upload(index:number,file:File,target?:string){
    if(!content) return;
    const path=index===-1?'header.logoImage':target?target+'.image':'galleryImages.'+index;
    const previous=getPath(content,path);
    const localUrl=URL.createObjectURL(file);
    change(path,localUrl);
    setUploading(v=>v+1);
    setMessage('Загружаю изображение…');
    try{
      const optimized=await optimizeImage(file);
      const dataUrl=await readDataUrl(optimized);
      const r=await fetch('/api/admin/upload',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:optimized.name,base64:dataUrl.split(',')[1]})
      });
      const data=await r.json();
      if(!r.ok||!data.url) throw new Error(data.error||'Ошибка загрузки');
      change(path,data.url+'?v='+Date.now());
      setMessage('Фото загружено.');
    }catch(err){
      change(path,previous||'');
      setMessage(err instanceof Error?err.message:'Ошибка загрузки');
    }finally{
      setUploading(v=>Math.max(0,v-1));
      setTimeout(()=>URL.revokeObjectURL(localUrl),4000);
    }
  }

  if(!content){
    return <main className="new-admin-login">
      <form onSubmit={login} className="new-login-card">
        <div className="login-mark">ЦР</div>
        <h1>Редактор сайта</h1>
        <p>Вход для владельца сайта</p>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Пароль" required autoFocus/>
        <button type="submit">Войти</button>
        {message&&<small>{message}</small>}
      </form>
    </main>
  }

  const tabs=[
    ['main','Первый экран'],
    ['header','Шапка'],
    ['contacts','Контакты'],
    ['content','Контент'],
    ['media','Фото и видео'],
    ['position','Размеры']
  ];

  return <main className="new-admin">
    <header className="new-admin-head">
      <div className="new-admin-brand">
        <a href="/" target="_blank" rel="noreferrer">← Сайт</a>
        <div><b>Редактор сайта</b><span>Центр размножения растений</span></div>
      </div>
      <div className="new-admin-actions">
        {message&&<span className="save-status">{message}</span>}
        <button className="save-button" onClick={save} disabled={saving||uploading>0}>
          {uploading ? 'Загрузка ('+uploading+')' : saving ? 'Сохраняю…' : 'Сохранить'}
        </button>
      </div>
    </header>

    <div className="new-editor">
      <aside className="editor-sidebar">
        <nav className="editor-tabs">
          {tabs.map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}
        </nav>

        <div className="editor-scroll">
          {tab==='main'&&<>
            <Section title="Первый экран">
              {[
                ['Первая строка','hero.title','line1'],
                ['Вторая строка','hero.title2','line2'],
                ['Золотая строка','hero.accent','accent'],
                ['Подзаголовок','hero.subtitle','subtitle']
              ].map(([label,path,key])=><div className="hero-line-editor" key={key}>
                <Field label={label}><input value={getPath(content,path)||''} onChange={e=>change(path,e.target.value)}/></Field>
                <div className="hero-line-controls">
                  <Field label="Размер (%)"><input type="number" min="35" max="240" value={content.hero[key+'Size']??(key==='line2'?112:key==='accent'?95:100)} onChange={e=>change('hero.'+key+'Size',e.target.value)}/></Field>
                  <Field label="X"><input type="number" min="-500" max="500" value={content.hero[key+'X']??0} onChange={e=>change('hero.'+key+'X',e.target.value)}/></Field>
                  <Field label="Y"><input type="number" min="-300" max="300" value={content.hero[key+'Y']??0} onChange={e=>change('hero.'+key+'Y',e.target.value)}/></Field>
                </div>
                <Field label="Шрифт">
                  <select value={content.hero[key+'Font']|| (key==='subtitle'?'Manrope':'Georgia')} onChange={e=>change('hero.'+key+'Font',e.target.value)}>
                    {FONT_OPTIONS.map(font=><option key={font} value={font}>{font}</option>)}
                  </select>
                </Field>
              </div>)}
              <Field label="Дополнительное описание"><textarea value={content.hero.intro||''} onChange={e=>change('hero.intro',e.target.value)}/></Field>
              <Field label="Фоновое фото"><input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(0,e.target.files[0],'hero')}/></Field>
            </Section>
            <Section title="Шрифты">
              <Field label="Шрифт заголовков">
                <select value={content.appearance.headingFont} onChange={e=>change('appearance.headingFont',e.target.value)}>
                  {FONT_OPTIONS.map(font=><option key={font} value={font}>{font}</option>)}
                </select>
              </Field>
              <Field label="Основной шрифт">
                <select value={content.appearance.bodyFont} onChange={e=>change('appearance.bodyFont',e.target.value)}>
                  {FONT_OPTIONS.map(font=><option key={font} value={font}>{font}</option>)}
                </select>
              </Field>
            </Section>
          </>}

          {tab==='header'&&<Section title="Шапка сайта">
            <Field label="Название"><input value={content.header.title||''} onChange={e=>change('header.title',e.target.value)}/></Field>
            <Field label="Подпись"><input value={content.header.subtitle||''} onChange={e=>change('header.subtitle',e.target.value)}/></Field>
            <Field label="Логотип"><input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(-1,e.target.files[0])}/></Field>
            {(content.header.nav||[]).map((x:string,i:number)=><Field key={i} label={'Пункт меню '+(i+1)}><input value={x} onChange={e=>change('header.nav.'+i,e.target.value)}/></Field>)}
          </Section>}

          {tab==='contacts'&&<>
            <Section title="Основные контакты">
              <Field label="Телефон"><input value={content.phone||''} onChange={e=>change('phone',e.target.value)}/></Field>
              <Field label="Номер для звонка"><input value={content.phoneLink||''} onChange={e=>change('phoneLink',e.target.value)}/></Field>
              <Field label="Почта"><input value={content.email||''} onChange={e=>change('email',e.target.value)}/></Field>
              <Field label="Адрес"><input value={content.address||''} onChange={e=>change('address',e.target.value)}/></Field>
            </Section>
            <Section title="Люди">
              {(content.contacts||[]).map((x:any,i:number)=><div className="contact-row" key={i}>
                <b>Контакт {i+1}</b>
                <input value={x.name||''} onChange={e=>change('contacts.'+i+'.name',e.target.value)} placeholder="Имя"/>
                <input value={x.label||''} onChange={e=>change('contacts.'+i+'.label',e.target.value)} placeholder="Номер на сайте"/>
                <input value={x.phone||''} onChange={e=>change('contacts.'+i+'.phone',e.target.value)} placeholder="Только цифры"/>
              </div>)}
              <button className="secondary-button" onClick={()=>setContent((o:Content)=>({...o,contacts:[...(o.contacts||[]),{name:'',label:'',phone:''}]}))}>+ Добавить контакт</button>
            </Section>
          </>}

          {tab==='content'&&<>
            <Section title="Специализация">
              <Field label="Заголовок"><input value={content.specialty.title||''} onChange={e=>change('specialty.title',e.target.value)}/></Field>
              <Field label="Текст 1"><textarea value={content.specialty.paragraph1||''} onChange={e=>change('specialty.paragraph1',e.target.value)}/></Field>
              <Field label="Текст 2"><textarea value={content.specialty.paragraph2||''} onChange={e=>change('specialty.paragraph2',e.target.value)}/></Field>
            </Section>
            <Section title="Теплицы">
              <Field label="Заголовок"><input value={content.greenhouse.title||''} onChange={e=>change('greenhouse.title',e.target.value)}/></Field>
              <Field label="Акцент"><input value={content.greenhouse.accent||''} onChange={e=>change('greenhouse.accent',e.target.value)}/></Field>
              <Field label="Описание"><textarea value={content.greenhouse.text||''} onChange={e=>change('greenhouse.text',e.target.value)}/></Field>
              <Field label="Фото"><input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(0,e.target.files[0],'greenhouse')}/></Field>
            </Section>
            <Section title="Маточник">
              <Field label="Заголовок"><input value={content.mother.title||''} onChange={e=>change('mother.title',e.target.value)}/></Field>
              <Field label="Акцент"><input value={content.mother.accent||''} onChange={e=>change('mother.accent',e.target.value)}/></Field>
              <Field label="Описание"><textarea value={content.mother.text||''} onChange={e=>change('mother.text',e.target.value)}/></Field>
              <Field label="Фото"><input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(0,e.target.files[0],'mother')}/></Field>
            </Section>
            <Section title="Ассортимент">
              {(content.assortment||[]).map((x:string,i:number)=><Field key={i} label={'Позиция '+(i+1)}><input value={x} onChange={e=>change('assortment.'+i,e.target.value)}/></Field>)}
            </Section>
          </>}

          {tab==='media'&&<>
            <Section title="Галерея">
              <div className="gallery-edit-grid">
                {(content.galleryImages||[]).map((url:string,i:number)=><div className="gallery-edit" key={i}>
                  <div className="gallery-thumb" style={{backgroundImage:'url('+url+')'}}/>
                  <input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(i,e.target.files[0])}/>
                  <div className="triple">
                    <label>Масштаб<input type="number" value={content.galleryImageSettings?.[i]?.scale??100} onChange={e=>change('galleryImageSettings.'+i+'.scale',Number(e.target.value))}/></label>
                    <label>X<input type="number" value={content.galleryImageSettings?.[i]?.x??50} onChange={e=>change('galleryImageSettings.'+i+'.x',Number(e.target.value))}/></label>
                    <label>Y<input type="number" value={content.galleryImageSettings?.[i]?.y??50} onChange={e=>change('galleryImageSettings.'+i+'.y',Number(e.target.value))}/></label>
                  </div>
                </div>)}
              </div>
              <button className="secondary-button" onClick={()=>setContent((o:Content)=>({...o,galleryImages:[...(o.galleryImages||[]),''],galleryImageSettings:[...(o.galleryImageSettings||[]),{scale:100,x:50,y:50}]}))}>+ Добавить фото</button>
            </Section>
            <Section title="Видео">
              {(content.videos||[]).map((v:any,i:number)=><div className="contact-row" key={i}>
                <input value={v.title||''} onChange={e=>change('videos.'+i+'.title',e.target.value)} placeholder="Название"/>
                <input value={v.url||''} onChange={e=>change('videos.'+i+'.url',e.target.value)} placeholder="YouTube ссылка"/>
              </div>)}
              <button className="secondary-button" onClick={()=>setContent((o:Content)=>({...o,videos:[...(o.videos||[]),{title:'',url:''}]}))}>+ Добавить видео</button>
            </Section>
            <Section title="Полезные ссылки">
              {(content.resources||[]).map((x:any,i:number)=><div className="contact-row" key={i}>
                <input value={x.title||''} onChange={e=>change('resources.'+i+'.title',e.target.value)} placeholder="Название"/>
                <input value={x.url||''} onChange={e=>change('resources.'+i+'.url',e.target.value)} placeholder="Ссылка"/>
              </div>)}
            </Section>
          </>}

          {tab==='position'&&<>
            <Section title="Шапка — размер и положение">
              {[
                ['Размер логотипа','header.logoSize'],
                ['Логотип X','header.logoX'],
                ['Логотип Y','header.logoY'],
                ['Размер текста шапки (%)','header.textSize'],
                ['Текст шапки X','header.textX'],
                ['Текст шапки Y','header.textY']
              ].map(([label,path])=><Field key={path} label={label}><input type="number" value={getPath(content,path)??0} onChange={e=>change(path,e.target.value)}/></Field>)}
            </Section>
            <Section title="Первый экран — размер и положение">
              {[
                ['Размер заголовка (%)','hero.titleSize'],
                ['Текст X','hero.textX'],
                ['Текст Y','hero.textY'],
                ['Масштаб фото (%)','hero.imageScale'],
                ['Фото X (%)','hero.imageX'],
                ['Фото Y (%)','hero.imageY']
              ].map(([label,path])=><Field key={path} label={label}><input type="number" value={getPath(content,path)??0} onChange={e=>change(path,e.target.value)}/></Field>)}
            </Section>
          </>}
        </div>
      </aside>

      <section className="editor-preview">
        <div className="preview-top">
          <div><i/><b>Предпросмотр</b></div>
          <span>изменения видны сразу</span>
        </div>
        <div className="browser-frame">
          <div className="browser-bar"><span/><span/><span/></div>
          <div className="preview-viewport" ref={previewBoxRef}>
            <iframe ref={previewRef} src="/?preview=1" title="Предпросмотр сайта" onLoad={()=>sendPreview(content)} style={{width:'1440px',height:(100/previewScale)+'%',transform:'scale('+previewScale+')',transformOrigin:'top left'}}/>
          </div>
        </div>
      </section>
    </div>
  </main>
}
