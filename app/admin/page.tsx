'use client';
import './admin.css';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type Content=any;
type LayerKey='headerBg'|'logo'|'brushText'|'brandText'|'heroImage'|'line1'|'line2'|'accent'|'subtitle'|'contactDock';

const FONTS=[
  'Cormorant Garamond','Prata','Playfair Display','Lora','Spectral','Forum',
  'Tenor Sans','Manrope','Montserrat','Raleway','Golos Text','Unbounded',
  'Yeseva One','Old Standard TT','Vollkorn','Philosopher','PT Serif','Roboto Slab'
];

const LAYERS:{key:LayerKey;label:string;group:string}[]=[
  {key:'headerBg',label:'Фон шапки',group:'Шапка'},
  {key:'logo',label:'Логотип',group:'Шапка'},
  {key:'brushText',label:'Кистевая надпись',group:'Шапка'},
  {key:'brandText',label:'Название в шапке',group:'Шапка'},
  {key:'heroImage',label:'Фоновое фото',group:'Первый экран'},
  {key:'line1',label:'Первая строка',group:'Первый экран'},
  {key:'line2',label:'Вторая строка',group:'Первый экран'},
  {key:'accent',label:'Золотая строка',group:'Первый экран'},
  {key:'subtitle',label:'Подзаголовок',group:'Первый экран'},
  {key:'contactDock',label:'Карточка контактов',group:'Первый экран'}
];

const setPath=(o:any,path:string,value:any)=>{
  const parts=path.split('.');
  let x=o;
  for(let i=0;i<parts.length-1;i++) x=x[parts[i]];
  x[parts[parts.length-1]]=value;
};
const getPath=(o:any,path:string)=>path.split('.').reduce((v:any,k)=>v?.[k],o);
const num=(v:any,f=0)=>Number.isFinite(Number(v))?Number(v):f;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

const META:Record<LayerKey,{x?:string;y?:string;size?:string;font?:string;text?:string;color?:string;spacing?:string;min?:number;max?:number}> = {
  headerBg:{color:'header.bgColor'},
  logo:{x:'header.logoX',y:'header.logoY',size:'header.logoSize',min:28,max:180},
  brushText:{x:'header.brushX',y:'header.brushY',size:'header.brushSize',text:'header.brushText',color:'header.brushColor',spacing:'header.brushSpacing',min:20,max:180},
  brandText:{x:'header.textX',y:'header.textY',size:'header.textSize',font:'header.textFont',color:'header.textColor',spacing:'header.textSpacing',min:10,max:260},
  heroImage:{x:'hero.imageX',y:'hero.imageY',size:'hero.imageScale',min:100,max:180},
  line1:{x:'hero.line1X',y:'hero.line1Y',size:'hero.line1Size',font:'hero.line1Font',text:'hero.title',color:'hero.line1Color',spacing:'hero.line1Spacing',min:10,max:240},
  line2:{x:'hero.line2X',y:'hero.line2Y',size:'hero.line2Size',font:'hero.line2Font',text:'hero.title2',color:'hero.line2Color',spacing:'hero.line2Spacing',min:10,max:240},
  accent:{x:'hero.accentX',y:'hero.accentY',size:'hero.accentSize',font:'hero.accentFont',text:'hero.accent',color:'hero.accentColor',spacing:'hero.accentSpacing',min:10,max:240},
  subtitle:{x:'hero.subtitleX',y:'hero.subtitleY',size:'hero.subtitleSize',font:'hero.subtitleFont',text:'hero.subtitle',color:'hero.subtitleColor',spacing:'hero.subtitleSpacing',min:10,max:220},
  contactDock:{x:'hero.contactX',y:'hero.contactY',size:'hero.contactScale',color:'hero.contactBgColor',min:70,max:140}
};

const readDataUrl=(file:Blob)=>new Promise<string>((ok,bad)=>{
  const r=new FileReader(); r.onload=()=>ok(String(r.result)); r.onerror=bad; r.readAsDataURL(file);
});
async function optimizeImage(file:File){
  if(!file.type.startsWith('image/')||file.type==='image/svg+xml')return file;
  try{
    const bitmap=await createImageBitmap(file);
    const maxSide=1800, scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d'); if(!ctx){bitmap.close();return file}
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close();
    const blob=await new Promise<Blob|null>(ok=>canvas.toBlob(ok,'image/webp',.82));
    if(!blob||blob.size>=file.size)return file;
    return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp'});
  }catch{return file}
}

function Slider({label,value,min,max,step=1,onChange}:{label:string;value:number;min:number;max:number;step?:number;onChange:(v:number)=>void}){
  return <div className="prop">
    <div className="prop-head"><span>{label}</span><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))}/></div>
    <input className="range" type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/>
  </div>
}

export default function Admin(){
  const [password,setPassword]=useState('');
  const [content,setContent]=useState<Content|null>(null);
  const [selected,setSelected]=useState<LayerKey>('line1');
  const [message,setMessage]=useState('');
  const [loginError,setLoginError]=useState(false);
  const [loginSuccess,setLoginSuccess]=useState(false);
  const [loginShake,setLoginShake]=useState(false);
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [device,setDevice]=useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [dirty,setDirty]=useState(false);
  const [badgeVisible,setBadgeVisible]=useState(true);
  const iframeRef=useRef<HTMLIFrameElement>(null);
  const stageRef=useRef<HTMLDivElement>(null);
  const contentRef=useRef<Content|null>(null);
  const dragRef=useRef<any>(null);
  const [fitScale,setFitScale]=useState(1);

  const viewport=device==='desktop'?{w:1440,h:900,label:'Desktop'}:device==='tablet'?{w:820,h:1180,label:'Tablet'}:{w:390,h:844,label:'Mobile'};
  const previewWidth=viewport.w;
  const previewHeight=viewport.h;

  const sendPreview=(next:Content|null=contentRef.current)=>{
    if(next) iframeRef.current?.contentWindow?.postMessage({type:'crr-preview',content:next},window.location.origin);
  };

  const update=(path:string,value:any)=>{
    setDirty(true);
    setContent((old:Content)=>{
      const copy=structuredClone(old); setPath(copy,path,value); return copy;
    });
  };

  useEffect(()=>{
    contentRef.current=content;
    if(content) requestAnimationFrame(()=>sendPreview(content));
  },[content]);

  const decorateFrame=()=>{
    const frame=iframeRef.current;
    if(!frame)return;
    try{
      const doc=frame.contentDocument; if(!doc)return;
      const all=Array.from(doc.querySelectorAll<HTMLElement>('[data-editor-key]'));
      all.forEach(el=>{
        el.style.cursor='grab';
        el.style.outline=el.dataset.editorKey===selected?'2px solid #d9b16f':'';
        el.style.outlineOffset=el.dataset.editorKey===selected?'5px':'';
      });
      const select=(ev:Event)=>{
        const target=(ev.target as HTMLElement).closest<HTMLElement>('[data-editor-key]');
        if(!target)return;
        ev.preventDefault(); ev.stopPropagation();
        const key=target.dataset.editorKey as LayerKey;
        if(key){setSelected(key)}
      };
      const down=(ev:PointerEvent)=>{
        const target=(ev.target as HTMLElement).closest<HTMLElement>('[data-editor-key]');
        if(!target)return;
        const key=target.dataset.editorKey as LayerKey;
        const meta=META[key]; if(!meta?.x||!meta?.y)return;
        ev.preventDefault(); ev.stopPropagation();
        setSelected(key);
        const c=contentRef.current;
        dragRef.current={
          key,startClientX:ev.clientX,startClientY:ev.clientY,
          startX:num(getPath(c,meta.x),key==='heroImage'?50:0),
          startY:num(getPath(c,meta.y),key==='heroImage'?50:0)
        };
        target.setPointerCapture?.(ev.pointerId);
        target.style.cursor='grabbing';
      };
      const move=(ev:PointerEvent)=>{
        const d=dragRef.current;if(!d)return;
        const meta=META[d.key as LayerKey]; if(!meta?.x||!meta?.y)return;
        const dx=ev.clientX-d.startClientX,dy=ev.clientY-d.startClientY;
        if(d.key==='heroImage'){
          const nx=clamp(d.startX+dx/8,0,100),ny=clamp(d.startY+dy/8,0,100);
          setContent((old:Content)=>{const copy=structuredClone(old);setPath(copy,meta.x!,String(Math.round(nx)));setPath(copy,meta.y!,String(Math.round(ny)));return copy});
        }else{
          setContent((old:Content)=>{const copy=structuredClone(old);setPath(copy,meta.x!,String(Math.round(d.startX+dx)));setPath(copy,meta.y!,String(Math.round(d.startY+dy)));return copy});
        }
        setDirty(true);
      };
      const up=()=>{dragRef.current=null};
      doc.addEventListener('click',select,true);
      doc.addEventListener('pointerdown',down,true);
      doc.addEventListener('pointermove',move,true);
      doc.addEventListener('pointerup',up,true);
      (frame as any)._editorCleanup=()=>{
        doc.removeEventListener('click',select,true);
        doc.removeEventListener('pointerdown',down,true);
        doc.removeEventListener('pointermove',move,true);
        doc.removeEventListener('pointerup',up,true);
      };
      sendPreview();
    }catch{}
  };

  useEffect(()=>{
    const frame=iframeRef.current;
    if(!frame)return;
    try{
      const doc=frame.contentDocument;
      doc?.querySelectorAll<HTMLElement>('[data-editor-key]').forEach(el=>{
        el.style.outline=el.dataset.editorKey===selected?'2px solid #d9b16f':'';
        el.style.outlineOffset=el.dataset.editorKey===selected?'5px':'';
      });
    }catch{}
  },[selected,content]);

  useEffect(()=>{
    const ready=(event:MessageEvent)=>{
      if(event.origin===window.location.origin&&event.data?.type==='crr-preview-ready'){sendPreview();setTimeout(decorateFrame,80)}
    };
    window.addEventListener('message',ready);
    return()=>window.removeEventListener('message',ready);
  },[selected]);

  useEffect(()=>{
    const stage=stageRef.current;
    if(!stage)return;
    let raf1=0,raf2=0;
    const timers:number[]=[];
    const updateScale=()=>{
      const rect=stage.getBoundingClientRect();
      const availableW=Math.max(200,rect.width-28);
      const availableH=Math.max(200,rect.height-28);
      setFitScale(Math.min(1,availableW/previewWidth,availableH/previewHeight));
    };
    updateScale();
    raf1=requestAnimationFrame(()=>{updateScale();raf2=requestAnimationFrame(updateScale)});
    timers.push(window.setTimeout(updateScale,120));
    timers.push(window.setTimeout(updateScale,350));
    timers.push(window.setTimeout(updateScale,800));
    if(document.fonts?.ready) document.fonts.ready.then(updateScale).catch(()=>{});
    const ro=new ResizeObserver(updateScale);
    ro.observe(stage);
    window.addEventListener('resize',updateScale);
    return()=>{cancelAnimationFrame(raf1);cancelAnimationFrame(raf2);timers.forEach(clearTimeout);ro.disconnect();window.removeEventListener('resize',updateScale)};
  },[device,previewWidth,previewHeight,Boolean(content)]);

  useEffect(()=>{
    if(!content)return;
    setBadgeVisible(true);
    const t=window.setTimeout(()=>setBadgeVisible(false),1200);
    return()=>window.clearTimeout(t);
  },[device,Boolean(content)]);

  async function login(e:FormEvent){
    e.preventDefault();
    const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
    if(!r.ok){
      setMessage('Неверный пароль');
      setLoginError(true);
      setLoginShake(false);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        setLoginShake(true);
        window.setTimeout(()=>setLoginShake(false),460);
      }));
      return;
    }
    setMessage('Успешно');
    setLoginSuccess(true);
    const fresh=await fetch('/api/admin/content?ts='+Date.now(),{cache:'no-store'}).then(x=>x.json());
    window.setTimeout(()=>{setContent(fresh);setDirty(false)},520);
  }

  async function save(){
    if(!content||saving)return;
    setSaving(true);setMessage('Сохраняю…');
    try{
      const r=await fetch('/api/admin/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(content)});
      if(!r.ok)throw new Error('Ошибка сохранения');
      setDirty(false);setMessage('Сохранено');
    }catch{setMessage('Ошибка сохранения')}
    finally{setSaving(false);setTimeout(()=>setMessage(''),1800)}
  }

  async function upload(file:File,path:string){
    if(!content)return;
    setUploading(true);
    try{
      const optimized=await optimizeImage(file);
      const dataUrl=await readDataUrl(optimized);
      const r=await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:optimized.name,base64:dataUrl.split(',')[1]})});
      const data=await r.json();
      if(!r.ok||!data.url)throw new Error();
      update(path,data.url+'?v='+Date.now());
    }finally{setUploading(false)}
  }

  const meta=META[selected];
  const current=content;
  const groups=useMemo(()=>Array.from(new Set(LAYERS.map(x=>x.group))),[]);

  if(!content)return <main className="ve-login"><div className="ve-login-backdrop"/><form onSubmit={login} className={'ve-login-card '+(loginShake?'login-shake':'')}><div className="ve-login-logo-wrap"><img className="ve-login-logo" src="/uploads/1790294762962-fgf.webp?v=1790294762845" alt="Центр размножения растений"/></div><h1>РЕДАКТОР САЙТА</h1><p>Центр размножения растений</p><div className={'ve-login-field '+(loginError?'login-field-error':loginSuccess?'login-field-success':'')}><span className={"ve-login-lock "+(password.length>0?"is-open":"")} aria-hidden="true"><svg viewBox="-2 -3 30 31" fill="none"><g className="lock-shackle"><path d="M8 11V8.2a4 4 0 0 1 8 0V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></g><rect x="5" y="10.5" width="14" height="10.5" rx="2.6" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="14.8" r="1.25" fill="currentColor"/><path d="M12 15.8v2.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span><input type="password" value={password} onChange={e=>{setPassword(e.target.value);if(loginError||loginSuccess){setLoginError(false);setLoginSuccess(false);setMessage('')}}} placeholder="Пароль"/></div><button className="ve-login-submit">ВОЙТИ</button>{message&&<small className={loginError?'login-error-text':loginSuccess?'login-success-text':''}>{message}</small>}</form></main>;

  return <main className="ve-app">
    <header className="ve-top">
      <div className="ve-brand"><a href="/" target="_blank">Сайт</a><b>CRR Visual Editor</b><span>{dirty?'Есть несохранённые изменения':'Все изменения сохранены'}</span></div>
      <div className="ve-device">
        <button className={device==='desktop'?'active':''} onClick={()=>setDevice('desktop')}>Desktop</button>
        <button className={device==='tablet'?'active':''} onClick={()=>setDevice('tablet')}>Tablet</button>
        <button className={device==='mobile'?'active':''} onClick={()=>setDevice('mobile')}>Mobile</button>
      </div>
      <div className="ve-actions"><span>{message}</span><button className="ve-save" onClick={save} disabled={saving}>{saving?'Сохраняю…':'Сохранить'}</button></div>
    </header>

    <div className="ve-workspace">
      <aside className="ve-layers">
        <div className="panel-title"><span>Слои</span><small>Кликни элемент на сайте или выбери здесь</small></div>
        {groups.map(group=><div className="layer-group" key={group}><b>{group}</b>{LAYERS.filter(x=>x.group===group).map(x=><button key={x.key} className={selected===x.key?'active':''} onClick={()=>setSelected(x.key)}><i/><span>{x.label}</span></button>)}</div>)}
        <div className="ve-tip"><b>Как редактировать</b><p>Выбери элемент и тащи его мышкой прямо на макете. Размер и точные значения меняются справа.</p></div>
      </aside>

      <section className="ve-canvas">
        <div className="canvas-stage" ref={stageRef}>
          <div className={'viewport-badge '+(badgeVisible?'show':'hide')}>{viewport.label} · {previewWidth} × {previewHeight}</div>
          <div className="device-frame" style={{width:previewWidth*fitScale,height:previewHeight*fitScale}}>
            <div className="device-scale" style={{width:previewWidth,height:previewHeight,transform:`scale(${fitScale})`}}>
              <iframe key={device} ref={iframeRef} src="/?preview=1" title="Предпросмотр" onLoad={()=>{sendPreview();setTimeout(decorateFrame,120)}} style={{width:previewWidth,height:previewHeight}}/>
            </div>
          </div>
        </div>
      </section>

      <aside className="ve-inspector">
        <div className="panel-title"><span>{LAYERS.find(x=>x.key===selected)?.label}</span><small>Свойства элемента</small></div>

        {meta.text&&<div className="inspector-section"><label className="text-label">Текст<textarea value={getPath(current,meta.text)||''} onChange={e=>update(meta.text!,e.target.value)}/></label></div>}

        {meta.font&&<div className="inspector-section"><label className="text-label">Шрифт<select value={getPath(current,meta.font)||'Georgia'} onChange={e=>update(meta.font!,e.target.value)}>{FONTS.map(font=><option key={font} style={{fontFamily:font}}>{font}</option>)}</select></label><div className="font-preview" style={{fontFamily:getPath(current,meta.font)||'Georgia'}}>Aa Бб — красивый сад</div></div>}

        {meta.color&&<div className="inspector-section"><h3>Цвет</h3><label className="color-control"><input type="color" value={getPath(current,meta.color)||(selected==='headerBg'?'#f4eee3':selected==='accent'?'#d5ad68':selected==='contactDock'?'#5a482f':'#ffffff')} onChange={e=>update(meta.color!,e.target.value)}/><span>{getPath(current,meta.color)||'Выбрать цвет'}</span></label></div>}

        {meta.spacing&&<div className="inspector-section"><h3>Расстояние между буквами</h3><Slider label="Интервал, em" value={num(getPath(current,meta.spacing),0)} min={-0.08} max={0.30} step={0.005} onChange={v=>update(meta.spacing!,String(v))}/></div>}

        <div className="inspector-section">
          <h3>Положение</h3>
          {meta.x&&<Slider label="X" value={num(getPath(current,meta.x),selected==='heroImage'?50:0)} min={selected==='heroImage'?0:-1500} max={selected==='heroImage'?100:1500} onChange={v=>update(meta.x!,String(v))}/>}
          {meta.y&&<Slider label="Y" value={num(getPath(current,meta.y),selected==='heroImage'?50:0)} min={selected==='heroImage'?0:-1500} max={selected==='heroImage'?100:1500} onChange={v=>update(meta.y!,String(v))}/>}
        </div>

        {meta.size&&<div className="inspector-section"><h3>Размер</h3><Slider label={selected==='logo'?'Размер, px':'Масштаб, %'} value={num(getPath(current,meta.size),100)} min={meta.min||35} max={meta.max||240} onChange={v=>update(meta.size!,String(v))}/></div>}

        {selected==='brandText'&&<div className="inspector-section"><h3>Текст шапки</h3><label className="text-label">Название<input value={current.header.title||''} onChange={e=>update('header.title',e.target.value)}/></label><label className="text-label">Подпись<input value={current.header.subtitle||''} onChange={e=>update('header.subtitle',e.target.value)}/></label></div>}

        {selected==='logo'&&<div className="inspector-section"><h3>Логотип</h3><label className="upload-btn">{uploading?'Загрузка…':'Заменить логотип'}<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0],'header.logoImage')}/></label></div>}

        {selected==='heroImage'&&<div className="inspector-section"><h3>Фоновое фото</h3><label className="upload-btn">{uploading?'Загрузка…':'Заменить фотографию'}<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0],'hero.image')}/></label></div>}

        {selected==='contactDock'&&<div className="inspector-section"><h3>Контакты</h3><p className="muted">Карточку можно двигать мышкой и менять её масштаб. Тексты контактов редактируются через данные сайта.</p></div>}

        <button className="reset-btn" onClick={()=>{
          const defaults:any={headerBg:[0,0,100],logo:[0,0,80],brushText:[0,0,55],brandText:[0,0,125],heroImage:[50,50,105],line1:[0,0,100],line2:[0,0,112],accent:[0,0,95],subtitle:[0,0,100],contactDock:[0,0,100]};
          const d=defaults[selected]; if(meta.x)update(meta.x,String(d[0])); if(meta.y)update(meta.y,String(d[1])); if(meta.size)update(meta.size,String(d[2])); if(meta.spacing)update(meta.spacing,'0');
        }}>Сбросить положение и размер</button>
      </aside>
    </div>
  </main>
}