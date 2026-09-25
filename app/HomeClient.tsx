'use client';
import { useEffect, useState } from 'react';

// Hero contact dock is intentionally kept on the first screen.
type HeroContactIconType='phone'|'mail'|'pin';
function HeroContactIcon({type}:{type:HeroContactIconType}){
  if(type==='phone') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.1 3.8 9.6 7l-1.5 2c1.2 2.5 3.1 4.4 5.6 5.6l2-1.5 3.2 2.5c.6.4.8 1.2.5 1.8l-.9 2c-.3.7-1 1.1-1.8 1-7-.8-12.6-6.4-13.4-13.4-.1-.8.3-1.5 1-1.8l2-.9c.6-.3 1.4-.1 1.8.5Z"/></svg>;
  if(type==='mail') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/></svg>;
}

export default function HomeClient({initialContent}:{initialContent:any}) {
  const [menu,setMenu]=useState(false);
  const [order,setOrder]=useState(false);
  const [heroReady,setHeroReady]=useState(false);
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
  const optimizeImage=(url:string)=>url?.includes('images.unsplash.com')?url.replace(/w=\d+/,'w=1600').replace(/q=\d+/,'q=72'):url;
  const phoneHref=(phone:string)=>{const digits=(phone||'').replace(/\D/g,'');if(!digits)return '';return 'tel:'+(digits.startsWith('8')?'+7'+digits.slice(1):'+'+digits)};
  const logoSrc=c.header.logoImage;
  const contactPeople=(c.contacts||[]).filter((x:{phone?:string})=>Boolean((x.phone||'').trim()));
  return <>
    <div className="overscroll-bottom-backdrop" aria-hidden="true"/>
    <div className="overscroll-top-header" aria-hidden="true"/>
    <main style={fontStyles}>
    <header className="topbar">
      <a className="brand header-brand" href="/" aria-label="Обновить страницу" onClick={(e)=>{e.preventDefault();window.location.reload()}}><span className="brand-logo-slot" style={{width:logoSlot}}>{logoSrc&&<img src={logoSrc} alt="" aria-hidden="true" fetchPriority="high" decoding="async" className="brand-image brand-image-img" style={{width:logoSize,height:logoSize,transform:`translate(${logoX}px,${logoY}px)`}}/>}</span><span className="brand-copy" style={{fontSize:`${c.header.textSize}%`,transform:`translate(${textX}px,${textY}px)`}}>{c.header.title}<br/><b>{c.header.subtitle}</b></span></a>
      <nav className={menu?'open':''}><a href="#about">{c.header.nav[0]}</a><a href="#assortment">{c.header.nav[1]}</a><a href="#gallery">{c.header.nav[2]}</a><a href="#knowledge">{c.header.nav[3]}</a></nav>
      <div className="header-socials" aria-label="Социальные сети питомника">
        <a className="header-social header-social-vk" href="https://vk.ru/crr.tver" target="_blank" rel="noreferrer" aria-label="ВКонтакте" title="ВКонтакте">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.1 6.4h3.1c.3 0 .5.2.6.5.6 1.6 1.5 3 2.7 4.2.2.2.5.1.5-.2V7.2c0-.5.3-.8.8-.8h2.5c.5 0 .8.3.8.8v2.6c0 .4.3.5.6.2 1.1-1.1 2-2.3 2.6-3.6h3c.6 0 .9.5.6 1-.8 1.5-1.8 2.9-3 4.1-.3.3-.3.6 0 .9 1.3 1.1 2.4 2.5 3.3 4 .3.5 0 1-.6 1h-3.2c-.4 0-.7-.2-.9-.5-.7-1.1-1.6-2-2.6-2.8-.3-.3-.6-.2-.6.2v2.2c0 .5-.3.8-.8.8h-1.1c-4.2 0-7.5-2.7-9.3-8.1-.2-.5.2-.8.7-.8Z"/></svg>
        </a>
        <a className="header-social header-social-tg" href="https://t.me/crrtver" target="_blank" rel="noreferrer" aria-label="Telegram" title="Telegram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 4.1 3.8 10.5c-.8.3-.8 1.4.1 1.6l4.1 1 1.6 4.9c.3.8 1.3 1 1.8.3l2.5-3 4 3c.7.5 1.7.1 1.8-.8l1.7-12.3c.1-.8-.5-1.4-1.2-1.1Z"/><path d="m8.1 13.1 8.8-5.7-6.6 7.3-.7 3.3"/></svg>
        </a>
        <button className="header-order-btn" onClick={()=>setOrder(true)}>Сделать заказ</button>
      </div>
      <button className="burger" aria-label="Открыть меню" onClick={()=>setMenu(!menu)}>☰</button>
    </header>
    <section className={`hero hero-contacts ${heroReady?'hero-ready':'hero-loading'}`} id="top">
      <img className="hero-bg hero-bg-image" src={c.hero.image} alt="" aria-hidden="true" fetchPriority="high" decoding="async" onLoad={()=>setHeroReady(true)} onError={()=>setHeroReady(true)} style={{objectPosition:`${c.hero.imageX}% ${c.hero.imageY}%`,transform:`scale(${Math.max(1,Number(c.hero.imageScale||100)/100)})`}}/>
      <div className="hero-overlay"/>
      <div className="hero-contact-layout">
        <div className="hero-contact-main">
          <p className="eyebrow">{c.hero.eyebrow}</p>
          <h1>Центр размножения<br/><em>растений</em></h1>
          <p className="intro">{c.hero.intro}</p>
          <div className="actions"><a className="text-btn" href="#about">О питомнике <span>↓</span></a></div>
        </div>

        <aside className="hero-contact-dock" aria-label="Контакты питомника">
          <div className="hero-contact-dock-head">
            <span>Контакты</span>
          </div>

          <div className="hero-contact-dock-list">
            <a className="hero-contact-item" href="tel:+79167964460">
              <span className="hero-contact-item-icon"><HeroContactIcon type="phone"/></span>
              <span className="hero-contact-item-copy">
                <small>Наталья Никулина</small>
                <b>+7 (916) 796-44-60</b>
              </span>
            </a>

            <a className="hero-contact-item" href="tel:+79206834460">
              <span className="hero-contact-item-icon"><HeroContactIcon type="phone"/></span>
              <span className="hero-contact-item-copy">
                <small>Дарья Живанович</small>
                <b>+7 (920) 683-44-60</b>
              </span>
            </a>

            <a className="hero-contact-item" href={'mailto:'+c.email}>
              <span className="hero-contact-item-icon"><HeroContactIcon type="mail"/></span>
              <span className="hero-contact-item-copy">
                <small>Почта</small>
                <b>{c.email}</b>
              </span>
            </a>

            <a className="hero-contact-item hero-contact-item-address" target="_blank" rel="noreferrer" href="https://yandex.ru/maps/org/tsentr_razmnozheniya_rasteniy/90072137290/?ll=35.662543%2C56.933847&z=17.78">
              <span className="hero-contact-item-icon"><HeroContactIcon type="pin"/></span>
              <span className="hero-contact-item-copy">
                <small>Адрес</small>
                <b>Тверская область, деревня Козино</b>
              </span>
            </a>
          </div>
        </aside>
      </div>
    </section>
    <section className="numbers"><div><b>6 га</b><span>маточных насаждений</span></div><div><b>144–96</b><span>ячеек в кассетах</span></div><div><b>Р9</b><span>готовые растения</span></div><div><b>Тверь</b><span>выращиваем с душой</span></div></section>
    <section className="about wrap" id="about"><p className="eyebrow gold">НАША СПЕЦИАЛИЗАЦИЯ</p><div className="two"><h2>{c.specialty.title}</h2><div><p>{c.specialty.paragraph1}</p><p>{c.specialty.paragraph2}</p><a className="line-link" href="#assortment">Посмотреть ассортимент <span>→</span></a></div></div></section>
    <section className="photo-band greenhouse" style={{backgroundImage:`linear-gradient(0deg,#180e0bcf,transparent 75%),url(${optimizeImage(c.greenhouse.image)})`}}><div><p className="eyebrow">ПРОИЗВОДСТВО</p><h2>{c.greenhouse.title}<br/><em>{c.greenhouse.accent}</em></h2><p>{c.greenhouse.text}</p></div></section>
    <section className="assortment wrap" id="assortment"><div className="section-head"><div><p className="eyebrow gold">КОЛЛЕКЦИЯ</p><h2>Ассортимент<br/>для красивых садов.</h2></div><a className="outline-btn" href={c.priceUrl}>Скачать прайс <span>↓</span></a></div><div className="plant-grid">{c.assortment.map((x:string,i:number)=><article key={x} className={'plant p'+i}><span>0{i+1}</span><h3>{x}</h3><p>{i===5?'Вейгела · ива · лапчатка · рябинник · снежноягодник':'Сортовые растения собственного производства'}</p><i>↗</i></article>)}</div></section>
    <section className="mother" style={{backgroundImage:`linear-gradient(90deg,#281914e8,#28191424),url(${optimizeImage(c.mother.image)})`}}><div className="wrap mother-copy"><p className="eyebrow">ОСНОВА КАЧЕСТВА</p><h2>{c.mother.title}<br/><em>{c.mother.accent}</em></h2><p>{c.mother.text}</p></div></section>
    <section className="gallery wrap" id="gallery"><div className="section-head"><div><p className="eyebrow gold">НАШИ РАСТЕНИЯ</p><h2>Фотографии<br/>наших черенков.</h2></div><a className="line-link" href="#order">Открыть галерею <span>→</span></a></div><div className="gallery-grid">{c.galleryImages.map((url:string,i:number)=>{const s=c.galleryImageSettings?.[i]||{scale:100,x:50,y:50};return <div key={url} style={{backgroundImage:`url(${optimizeImage(url)})`,backgroundSize:`${s.scale}%`,backgroundPosition:`${s.x}% ${s.y}%`}}/>})}</div></section>
    {c.videos.length>0&&<section className="videos wrap"><p className="eyebrow gold">ВИДЕО ИЗ ПИТОМНИКА</p><h2>Смотрите, как мы работаем</h2><div className="video-grid">{c.videos.map((v:any,i:number)=><article key={i}><iframe src={videoSrc(v.url)} title={v.title} allowFullScreen/><b>{v.title}</b></article>)}</div></section>}
    <section className="knowledge wrap" id="knowledge"><p className="eyebrow gold">ДЕЛИМСЯ ОПЫТОМ</p><h2>Полезная информация</h2><div className="knowledge-list">{c.resources.map((x:{title:string,url:string},i:number)=><a href={x.url} key={x.title}><span>0{i+1}</span><b>{x.title}</b><i>↗</i></a>)}</div></section>
    <section className="order wrap" id="order"><div><p className="eyebrow">СДЕЛАЕМ ПОДБОРКУ</p><h2>Готовы выбрать<br/><em>растения?</em></h2></div><div><p>Напишите нам — подберём культуры, объём и формат поставки для вашей задачи.</p><button className="gold-btn" onClick={()=>setOrder(true)}>Оформить заказ <span>↗</span></button><div className="help"><a href={'tel:+'+c.phoneLink}>{c.phone}</a><span>Ответим на вопросы и поможем, если возникла проблема.</span></div></div></section>
    <footer><div className="brand"><span className="brand-mark">ЦР</span><span>Центр<br/><b>размножения растений</b></span></div><div className="footer-contact">{contactPeople.map((x:{name:string,label:string,phone:string},i:number)=>{const shownLabel=i===0?(x.label||'').replace(/^8(?=\s*\()/,'+7'):x.label;return <div key={x.name}><small>{x.name}</small><a href={phoneHref(x.phone)}>{shownLabel}</a></div>})}<a href={'mailto:'+c.email}>{c.email}</a></div><a className="map" target="_blank" href={'https://yandex.ru/maps/?text='+encodeURIComponent(c.address)}>{c.address} ↗</a></footer>
    {order&&<div className="modal" onClick={()=>setOrder(false)}><form onClick={e=>e.stopPropagation()}><button className="close" type="button" onClick={()=>setOrder(false)}>×</button><p className="eyebrow gold">ЗАЯВКА</p><h2>Расскажите, что вам нужно</h2><input required placeholder="Ваше имя"/><input required type="tel" placeholder="Телефон для связи"/><textarea placeholder="Какие растения и какой объём интересуют?"/><button className="gold-btn" type="submit">Отправить заявку <span>↗</span></button><small>Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</small></form></div>}
    </main>
  </>
}