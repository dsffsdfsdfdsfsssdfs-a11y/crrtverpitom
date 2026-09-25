'use client';
import { useEffect, useState } from 'react';

type ContactIconType='phone'|'mail';
function ContactIcon({type}:{type:ContactIconType}){
  if(type==='phone')return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.5 9.8 7l-1.7 2.1c1.2 2.4 3.1 4.3 5.5 5.5l2.1-1.7 3.5 2.6c.5.4.7 1.1.4 1.7l-1 2.2c-.3.7-1 1.1-1.8 1-7.1-.8-12.8-6.5-13.6-13.6-.1-.8.3-1.5 1-1.8l2.2-1c.6-.3 1.3-.1 1.7.4Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>;
}
export default function HomeClient({initialContent}:{initialContent:any}) {
  const [menu,setMenu]=useState(false);
  const [order,setOrder]=useState(false);
  const [c,setContent]=useState<any>(initialContent);
  useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin===window.location.origin&&event.data?.type==='crr-preview'&&event.data.content)setContent(event.data.content)};window.addEventListener('message',receive);if(window.parent!==window)window.parent.postMessage({type:'crr-preview-ready'},window.location.origin);return()=>window.removeEventListener('message',receive)},[]);
  const num=(v:any,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
  const logoSize=clamp(num(c.header.logoSize,53),28,105);
  const logoX=clamp(num(c.header.logoX,0),-35,55);
  const logoY=clamp(num(c.header.logoY,0),-20,20);
  const textX=clamp(num(c.header.textX,0),-25,45);
  const textY=clamp(num(c.header.textY,0),-20,20);
  const logoSlot=Math.max(68,logoSize+Math.abs(logoX)+16);
  const fontStyles={'--headingFont':`${c.appearance.headingFont}, Georgia, serif`,'--bodyFont':`${c.appearance.bodyFont}, Arial, sans-serif`} as React.CSSProperties;
  const videoSrc=(url:string)=>url.includes('watch?v=')?url.replace('watch?v=','embed/'):url;
  const phoneHref=(phone:string)=>{const digits=(phone||'').replace(/\D/g,'');if(!digits)return '';return 'tel:'+(digits.startsWith('8')?'+7'+digits.slice(1):'+'+digits)};
  const logoSrc=c.header.logoImage;
  const contactPeople=(c.contacts||[]).filter((x:{phone?:string})=>Boolean((x.phone||'').trim()));
  return <>
    <div className="overscroll-bottom-backdrop" aria-hidden="true"/>
    <div className="overscroll-top-header" aria-hidden="true"/>
    <main style={fontStyles}>
    <header className="topbar">
      <a className="brand header-brand" href="/" aria-label="Обновить страницу" onClick={(e)=>{e.preventDefault();window.location.reload()}}><span className="brand-logo-slot" style={{width:logoSlot}}><span aria-label="Логотип" className="brand-image brand-image-bg" style={{width:logoSize,height:logoSize,transform:`translate(${logoX}px,${logoY}px)`,backgroundImage:`url("${logoSrc||"/favicon-v17.png?v=17"}"),url("/favicon-v17.png?v=17")`}}/></span><span className="brand-copy" style={{fontSize:`${c.header.textSize}%`,transform:`translate(${textX}px,${textY}px)`}}>{c.header.title}<br/><b>{c.header.subtitle}</b></span></a>
      <nav className={menu?'open':''}><a href="#about">{c.header.nav[0]}</a><a href="#assortment">{c.header.nav[1]}</a><a href="#gallery">{c.header.nav[2]}</a><a href="#knowledge">{c.header.nav[3]}</a></nav>
      <span className="header-spacer desktop" aria-hidden="true"/>
      <button className="burger" aria-label="Открыть меню" onClick={()=>setMenu(!menu)}>☰</button>
    </header>
    <section className="hero hero-contacts" id="top">
      <div className="hero-bg" aria-hidden="true" style={{backgroundImage:`url("${c.hero.image}"),url("/repo-assets/1790256146854-lyjh500c3dfczzpumdyigwunksyimztdsbhjlv1khcud4udhjd8rer980wfvtjt44dhpo1kcp-jgsej5jfmdaso7.jpg")`,backgroundSize:'cover',backgroundPosition:`${c.hero.imageX}% ${c.hero.imageY}%`,backgroundRepeat:'no-repeat',transform:`scale(${Math.max(1,Number(c.hero.imageScale||100)/100)})`}}/>
      <div className="hero-overlay"/>
      <div className="hero-contact-layout">
        <div className="hero-contact-main">
          <p className="eyebrow">{c.hero.eyebrow}</p>
          <h1>Центр размножения<br/><em>растений</em></h1>
          <p className="intro">{c.hero.intro}</p>
          <div className="actions"><button className="gold-btn" onClick={()=>setOrder(true)}>Сделать заказ <span>↗</span></button><a className="text-btn" href="#about">О питомнике <span>↓</span></a></div>
        </div>
        <svg className="contact-clip-defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id="contactCardClip" clipPathUnits="objectBoundingBox">
              <path d="M .055 0 H .79 C .812 0 .828 .007 .844 .024 L .978 .184 C .993 .202 1 .222 1 .248 V .94 C 1 .976 .976 1 .94 1 H .055 C .02 1 0 .976 0 .94 V .06 C 0 .024 .02 0 .055 0 Z"/>
            </clipPath>
          </defs>
        </svg>
        <aside className="hero-contact-card">
          <div className="contact-card-title"><p className="eyebrow gold">КОНТАКТЫ</p></div>

          <div className="contact-people">
            {contactPeople.map((x:{name:string,label:string,phone:string},i:number)=>{
              const shownLabel=i===0?(x.label||'').replace(/^8(?=\s*\()/,'+7'):x.label;
              return <div className="contact-person" key={x.name||i}>
                <span className="contact-glyph"><ContactIcon type="phone"/></span>
                <div className="contact-person-copy">
                  <small>{i===0?'Наталья Никулина':i===1?'Дарья Живанович':x.name}</small>
                  <div className="contact-person-value">{x.phone?<a href={phoneHref(x.phone)}>{shownLabel}</a>:<span>{x.label||'Уточняется'}</span>}</div>
                </div>
              </div>
            })}
          </div>

          <div className="contact-details">
            <div className="contact-detail">
              <span className="contact-glyph"><ContactIcon type="mail"/></span>
              <div className="contact-detail-copy"><small>Почта</small><a href={'mailto:'+c.email}>{c.email}</a></div>
            </div>

            <div className="contact-detail contact-detail-address">
              <div className="contact-detail-copy">
                <small>Адрес</small>
                <a className="contact-address-link" target="_blank" rel="noreferrer" href="https://yandex.ru/maps/org/tsentr_razmnozheniya_rasteniy/90072137290/?ll=35.662543%2C56.933847&z=17.78" title="Открыть в Яндекс Картах">{c.address}</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
    <section className="numbers"><div><b>6 га</b><span>маточных насаждений</span></div><div><b>144–96</b><span>ячеек в кассетах</span></div><div><b>Р9</b><span>готовые растения</span></div><div><b>Тверь</b><span>выращиваем с душой</span></div></section>
    <section className="about wrap" id="about"><p className="eyebrow gold">НАША СПЕЦИАЛИЗАЦИЯ</p><div className="two"><h2>{c.specialty.title}</h2><div><p>{c.specialty.paragraph1}</p><p>{c.specialty.paragraph2}</p><a className="line-link" href="#assortment">Посмотреть ассортимент <span>→</span></a></div></div></section>
    <section className="photo-band greenhouse" style={{backgroundImage:`linear-gradient(0deg,#180e0bcf,transparent 75%),url(${c.greenhouse.image})`}}><div><p className="eyebrow">ПРОИЗВОДСТВО</p><h2>{c.greenhouse.title}<br/><em>{c.greenhouse.accent}</em></h2><p>{c.greenhouse.text}</p></div></section>
    <section className="assortment wrap" id="assortment"><div className="section-head"><div><p className="eyebrow gold">КОЛЛЕКЦИЯ</p><h2>Ассортимент<br/>для красивых садов.</h2></div><a className="outline-btn" href={c.priceUrl}>Скачать прайс <span>↓</span></a></div><div className="plant-grid">{c.assortment.map((x:string,i:number)=><article key={x} className={'plant p'+i}><span>0{i+1}</span><h3>{x}</h3><p>{i===5?'Вейгела · ива · лапчатка · рябинник · снежноягодник':'Сортовые растения собственного производства'}</p><i>↗</i></article>)}</div></section>
    <section className="mother" style={{backgroundImage:`linear-gradient(90deg,#281914e8,#28191424),url(${c.mother.image})`}}><div className="wrap mother-copy"><p className="eyebrow">ОСНОВА КАЧЕСТВА</p><h2>{c.mother.title}<br/><em>{c.mother.accent}</em></h2><p>{c.mother.text}</p></div></section>
    <section className="gallery wrap" id="gallery"><div className="section-head"><div><p className="eyebrow gold">НАШИ РАСТЕНИЯ</p><h2>Фотографии<br/>наших черенков.</h2></div><a className="line-link" href="#order">Открыть галерею <span>→</span></a></div><div className="gallery-grid">{c.galleryImages.map((url:string,i:number)=>{const s=c.galleryImageSettings?.[i]||{scale:100,x:50,y:50};return <div key={url} style={{backgroundImage:`url(${url})`,backgroundSize:`${s.scale}%`,backgroundPosition:`${s.x}% ${s.y}%`}}/>})}</div></section>
    {c.videos.length>0&&<section className="videos wrap"><p className="eyebrow gold">ВИДЕО ИЗ ПИТОМНИКА</p><h2>Смотрите, как мы работаем</h2><div className="video-grid">{c.videos.map((v:any,i:number)=><article key={i}><iframe src={videoSrc(v.url)} title={v.title} allowFullScreen/><b>{v.title}</b></article>)}</div></section>}
    <section className="knowledge wrap" id="knowledge"><p className="eyebrow gold">ДЕЛИМСЯ ОПЫТОМ</p><h2>Полезная информация</h2><div className="knowledge-list">{c.resources.map((x:{title:string,url:string},i:number)=><a href={x.url} key={x.title}><span>0{i+1}</span><b>{x.title}</b><i>↗</i></a>)}</div></section>
    <section className="order wrap" id="order"><div><p className="eyebrow">СДЕЛАЕМ ПОДБОРКУ</p><h2>Готовы выбрать<br/><em>растения?</em></h2></div><div><p>Напишите нам — подберём культуры, объём и формат поставки для вашей задачи.</p><button className="gold-btn" onClick={()=>setOrder(true)}>Оформить заказ <span>↗</span></button><div className="help"><a href={'tel:+'+c.phoneLink}>{c.phone}</a><span>Ответим на вопросы и поможем, если возникла проблема.</span></div></div></section>
    <footer><div className="brand"><span className="brand-mark">ЦР</span><span>Центр<br/><b>размножения растений</b></span></div><div className="footer-contact">{contactPeople.map((x:{name:string,label:string,phone:string},i:number)=>{const shownLabel=i===0?(x.label||'').replace(/^8(?=\s*\()/,'+7'):x.label;return <div key={x.name}><small>{x.name}</small><a href={phoneHref(x.phone)}>{shownLabel}</a></div>})}<a href={'mailto:'+c.email}>{c.email}</a></div><a className="map" target="_blank" href={'https://yandex.ru/maps/?text='+encodeURIComponent(c.address)}>{c.address} ↗</a></footer>
    {order&&<div className="modal" onClick={()=>setOrder(false)}><form onClick={e=>e.stopPropagation()}><button className="close" type="button" onClick={()=>setOrder(false)}>×</button><p className="eyebrow gold">ЗАЯВКА</p><h2>Расскажите, что вам нужно</h2><input required placeholder="Ваше имя"/><input required type="tel" placeholder="Телефон для связи"/><textarea placeholder="Какие растения и какой объём интересуют?"/><button className="gold-btn" type="submit">Отправить заявку <span>↗</span></button><small>Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</small></form></div>}
    </main>
  </>
}