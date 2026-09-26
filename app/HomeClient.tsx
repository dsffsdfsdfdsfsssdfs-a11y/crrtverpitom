'use client';
import Image from 'next/image';
import { useEffect, useLayoutEffect, useState } from 'react';

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
  const [c,setContent]=useState<any>(initialContent);
  useLayoutEffect(()=>{
    if('scrollRestoration' in history) history.scrollRestoration='manual';
    if(window.location.hash) history.replaceState(null,'',window.location.pathname+window.location.search);
    window.scrollTo(0,0);
    requestAnimationFrame(()=>window.scrollTo(0,0));
    const t=window.setTimeout(()=>window.scrollTo(0,0),80);
    return()=>window.clearTimeout(t);
  },[]);
  useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin===window.location.origin&&event.data?.type==='crr-preview'&&event.data.content)setContent(event.data.content)};window.addEventListener('message',receive);if(window.parent!==window)window.parent.postMessage({type:'crr-preview-ready'},window.location.origin);return()=>window.removeEventListener('message',receive)},[]);
  const num=(v:any,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
  const logoSize=clamp(num(c.header.logoSize,53),28,180);
  const logoX=clamp(num(c.header.logoX,0),-1500,1500);
  const logoY=clamp(num(c.header.logoY,0),-1500,1500);
  const textX=clamp(num(c.header.textX,0),-1500,1500);
  const textY=clamp(num(c.header.textY,0),-1500,1500);
  const logoSlot=Math.max(68,logoSize+Math.abs(logoX)+16);
  const fontStyles={'--headingFont':`${c.appearance.headingFont}, Georgia, serif`,'--bodyFont':`${c.appearance.bodyFont}, Arial, sans-serif`} as React.CSSProperties;
  const videoSrc=(url:string)=>url.includes('watch?v=')?url.replace('watch?v=','embed/'):url;
  const optimizeImage=(url:string)=>url?.includes('images.unsplash.com')?url.replace(/w=\d+/,'w=1600').replace(/q=\d+/,'q=72'):url;
  const phoneHref=(phone:string)=>{const digits=(phone||'').replace(/\D/g,'');if(!digits)return '';return 'tel:'+(digits.startsWith('8')?'+7'+digits.slice(1):'+'+digits)};
  const mediaSrc=(url:string)=>url?.startsWith('/uploads/')?'https://crr-tver.ru'+url:url;
  const logoSrc=mediaSrc(c.header.logoImage);
  const heroSrc=mediaSrc(c.hero.image);
  const heroTitle1=c.hero.title??'';
  const heroTitle2=c.hero.title2??'';
  const heroAccent=c.hero.accent??'';
  const heroSubtitle=c.hero.subtitle??'';
  const heroLineStyle=(key:string,defaults:{size:number,x:number,y:number,font:string})=>({
    fontFamily:`${c.hero[key+'Font']||defaults.font}, Georgia, serif`,
    fontSize:`${clamp(num(c.hero[key+'Size'],defaults.size),10,240)}%`,
    transform:`translate(${clamp(num(c.hero[key+'X'],defaults.x),-1500,1500)}px,${clamp(num(c.hero[key+'Y'],defaults.y),-1500,1500)}px)`,
    whiteSpace:'pre-wrap',
    overflowWrap:'break-word',
    letterSpacing:`${num(c.hero[key+'Spacing'],0)}em`,
    color:c.hero[key+'Color']||(key==='accent'?'#d5ad68':key==='subtitle'?'#efe2cf':'#ffffff')
  } as React.CSSProperties);
  const contactPeople=(c.contacts||[]).filter((x:{phone?:string})=>Boolean((x.phone||'').trim()));
  return <>
    <main style={fontStyles}>
    <header className="topbar" data-editor-key="headerBg" style={{backgroundColor:c.header.bgColor||undefined,color:c.header.textColor||undefined}}>
      <a className="brand header-brand" href="/" aria-label="Обновить страницу" onClick={(e)=>{e.preventDefault();window.location.reload()}}><span className="brand-logo-slot" style={{width:logoSlot}}>{logoSrc&&<span data-editor-key="logo"><Image src={logoSrc} alt="" aria-hidden="true" priority width={160} height={160} quality={65} className="brand-image brand-image-img" style={{width:logoSize,height:logoSize,transform:`translate(${logoX}px,${logoY}px)`}}/></span>}</span><span data-editor-key="brandText" className="brand-copy" style={{fontSize:`${c.header.textSize}%`,fontFamily:`${c.header.textFont||'Manrope'}, Arial, sans-serif`,transform:`translate(${textX}px,${textY}px)`,color:c.header.textColor||undefined,letterSpacing:`${num(c.header.textSpacing,0)}em`}}>{c.header.title}<br/><b>{c.header.subtitle}</b></span></a>
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
    <section className="hero hero-contacts" id="top">
      <span data-editor-key="heroImage" className="hero-bg-editor"><Image className="hero-bg hero-bg-image" src={heroSrc} alt="" aria-hidden="true" priority fill quality={65} sizes="100vw" style={{objectFit:'cover',objectPosition:`${c.hero.imageX}% ${c.hero.imageY}%`,transform:`scale(${Math.max(1,Number(c.hero.imageScale||100)/100)})`}}/></span>
      <div className="hero-overlay"/>
      <div className="hero-contact-layout">
        <div className="hero-contact-main">
          <svg className="hero-botanical-accent" viewBox="0 0 180 270" fill="none" aria-hidden="true">
            <path d="M90 258C89 210 83 164 92 119C98 86 113 54 137 22" />
            <path d="M91 211C69 199 53 183 40 161M89 183C110 171 126 156 139 136M91 150C70 139 55 122 45 100M97 119C117 107 132 91 142 71M106 87C91 77 81 65 74 50M119 58C132 50 143 39 151 27" />
            <path d="M47 166C35 160 29 151 30 141C41 141 51 147 57 157C55 162 52 165 47 166ZM134 142C145 135 157 134 167 139C163 150 153 158 141 160C136 156 134 150 134 142ZM49 105C37 101 29 93 27 83C38 80 49 84 57 92C56 97 53 102 49 105ZM137 76C148 69 160 69 169 75C165 86 155 93 143 95C139 90 137 84 137 76ZM77 54C67 47 62 37 64 27C75 28 84 34 90 44C87 49 83 52 77 54Z" />
          </svg>
          <h1 className="hero-title">
            {heroTitle1!==''&&<span data-editor-key="line1" className="hero-title-line hero-title-first" style={heroLineStyle('line1',{size:100,x:0,y:0,font:'Georgia'})}>{heroTitle1}</span>}
            {heroTitle2!==''&&<span data-editor-key="line2" className="hero-title-line hero-title-second" style={heroLineStyle('line2',{size:112,x:0,y:0,font:'Georgia'})}>{heroTitle2}</span>}
            {heroAccent!==''&&<em data-editor-key="accent" className="hero-title-line hero-title-accent" style={heroLineStyle('accent',{size:95,x:0,y:0,font:'Georgia'})}>{heroAccent}</em>}
          </h1>
          {heroSubtitle!==''&&<p data-editor-key="subtitle" className="hero-subtitle" style={heroLineStyle('subtitle',{size:100,x:0,y:0,font:'Manrope'})}>{heroSubtitle}</p>}
          <p className="intro">{c.hero.intro}</p>
          
        </div>

        <aside data-editor-key="contactDock" className="hero-contact-dock" aria-label="Контакты питомника" style={{transform:`translate(${Number(c.hero.contactX||0)}px,${Number(c.hero.contactY||0)}px) scale(${Number(c.hero.contactScale||100)/100})`,transformOrigin:'center',background:c.hero.contactBgColor||undefined}}> 
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

            <a className="hero-contact-item" href="tel:+79201557717">
              <span className="hero-contact-item-icon"><HeroContactIcon type="phone"/></span>
              <span className="hero-contact-item-copy">
                <small>Алла Жарняк</small>
                <b>+7 (920) 155-77-17</b>
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