'use client';
import { useState } from 'react';

const contacts = [
  ['Наталья Никулина', '8 (916) 796-44-60', '89167964460'],
  ['Дарья Живанович', '+7 (920) 683-44-60', '79206834460'],
  ['Алла Жарняк', 'уточняется', '']
];

export default function Home() {
  const [menu,setMenu]=useState(false);
  const [order,setOrder]=useState(false);
  return <main>
    <header className="topbar">
      <a className="brand" href="#top"><span className="brand-mark">ЦР</span><span>Центр<br/><b>размножения растений</b></span></a>
      <nav className={menu?'open':''}><a href="#about">О питомнике</a><a href="#assortment">Ассортимент</a><a href="#gallery">Фотографии</a><a href="#knowledge">Полезное</a></nav>
      <a className="phone desktop" href="tel:+79167964460">+7 916 796-44-60</a><button className="burger" aria-label="Открыть меню" onClick={()=>setMenu(!menu)}>☰</button>
    </header>
    <section className="hero" id="top">
      <div className="hero-overlay"/><div className="hero-copy">
        <p className="eyebrow">ТВЕРСКАЯ ОБЛАСТЬ · ДЕРЕВНЯ КОЗИНО</p><h1>Растения, выращенные<br/><em>с заботой о результате.</em></h1>
        <p className="intro">Профессиональный питомник декоративных лиственных и хвойных растений. Укоренённые черенки для садовых центров, ландшафтных проектов и питомников.</p>
        <div className="actions"><button className="gold-btn" onClick={()=>setOrder(true)}>Сделать заказ <span>↗</span></button><a className="text-btn" href="#about">Узнать больше <span>↓</span></a></div>
      </div>
      <div className="hero-note"><span>5000</span><small>м² тепличного<br/>комплекса</small></div>
    </section>
    <section className="numbers"><div><b>6 га</b><span>маточных насаждений</span></div><div><b>144–96</b><span>ячеек в кассетах</span></div><div><b>Р9</b><span>готовые растения</span></div><div><b>Тверь</b><span>выращиваем с душой</span></div></section>
    <section className="about wrap" id="about"><p className="eyebrow gold">НАША СПЕЦИАЛИЗАЦИЯ</p><div className="two"><h2>Здоровый старт<br/>для каждого растения.</h2><div><p>Мы занимаемся вегетативным размножением декоративных лиственных и хвойных растений в кассетах. Контролируем весь путь: от маточника до готового к доращиванию черенка.</p><p>Выращиваем укоренённые черенки в кассетах <b>144, 104, 96 ячеек</b> и в горшках <b>Р9</b>.</p><a className="line-link" href="#assortment">Посмотреть ассортимент <span>→</span></a></div></div></section>
    <section className="photo-band greenhouse"><div><p className="eyebrow">ПРОИЗВОДСТВО</p><h2>Тепличный комплекс<br/><em>5 000 м²</em></h2><p>Современные теплицы позволяют поддерживать стабильные условия для качественного укоренения черенков.</p></div></section>
    <section className="assortment wrap" id="assortment"><div className="section-head"><div><p className="eyebrow gold">КОЛЛЕКЦИЯ</p><h2>Ассортимент<br/>для красивых садов.</h2></div><a className="outline-btn" href="#order">Запросить прайс <span>↓</span></a></div><div className="plant-grid">{['Туя','Гортензия','Дёрен','Пузыреплодник','Спирея','Другие культуры'].map((x,i)=><article key={x} className={'plant p'+i}><span>0{i+1}</span><h3>{x}</h3><p>{i===5?'Вейгела · ива · лапчатка · рябинник · снежноягодник':'Сортовые растения собственного производства'}</p><i>↗</i></article>)}</div></section>
    <section className="mother"><div className="wrap mother-copy"><p className="eyebrow">ОСНОВА КАЧЕСТВА</p><h2>Маточник<br/><em>6 гектаров</em></h2><p>Собственная база здоровых маточных растений — основа стабильного качества каждой партии.</p></div></section>
    <section className="gallery wrap" id="gallery"><div className="section-head"><div><p className="eyebrow gold">НАШИ РАСТЕНИЯ</p><h2>Фотографии<br/>наших черенков.</h2></div><a className="line-link" href="#order">Открыть галерею <span>→</span></a></div><div className="gallery-grid"><div/><div/><div/><div/></div></section>
    <section className="knowledge wrap" id="knowledge"><p className="eyebrow gold">ДЕЛИМСЯ ОПЫТОМ</p><h2>Полезная информация</h2><div className="knowledge-list">{['Агротехника доращивания черенков в Р9','Теплицы, техника и оборудование в питомнике','Реалити-шоу «Будни питомниковода»'].map((x,i)=><a href="#" key={x}><span>0{i+1}</span><b>{x}</b><i>↗</i></a>)}</div></section>
    <section className="order wrap" id="order"><div><p className="eyebrow">СДЕЛАЕМ ПОДБОРКУ</p><h2>Готовы выбрать<br/><em>растения?</em></h2></div><div><p>Напишите нам — подберём культуры, объём и формат поставки для вашей задачи.</p><button className="gold-btn" onClick={()=>setOrder(true)}>Оформить заказ <span>↗</span></button><div className="help"><a href="tel:+79167964460">+7 916 796-44-60</a><span>Ответим на вопросы и поможем, если возникла проблема.</span></div></div></section>
    <footer><div className="brand"><span className="brand-mark">ЦР</span><span>Центр<br/><b>размножения растений</b></span></div><div className="footer-contact">{contacts.map(([n,p,t])=><div key={n}><small>{n}</small>{t?<a href={'tel:+'+t}>{p}</a>:<span>{p}</span>}</div>)}<a href="mailto:crr.tver@gmail.com">crr.tver@gmail.com</a></div><a className="map" target="_blank" href="https://yandex.ru/maps/?text=Тверская%20область%2C%20деревня%20Козино">Тверская область,<br/>деревня Козино ↗</a></footer>
    {order&&<div className="modal" onClick={()=>setOrder(false)}><form onClick={e=>e.stopPropagation()}><button className="close" type="button" onClick={()=>setOrder(false)}>×</button><p className="eyebrow gold">ЗАЯВКА</p><h2>Расскажите, что вам нужно</h2><input required placeholder="Ваше имя"/><input required type="tel" placeholder="Телефон для связи"/><textarea placeholder="Какие растения и какой объём интересуют?"/><button className="gold-btn" type="submit">Отправить заявку <span>↗</span></button><small>Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</small></form></div>}
  </main>
}
