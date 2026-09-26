import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = { themeColor: '#f3eee4' };

export const metadata: Metadata = {
  title: 'Центр размножения растений — Тверь',
  description: 'Декоративные растения собственного производства в Тверской области.'
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon-v17.png?v=17" />
        <link rel="apple-touch-icon" href="/favicon-v17.png?v=17" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bad+Script&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Manrope&family=Montserrat&family=Roboto&family=Open+Sans&family=Lora&family=Merriweather&family=PT+Serif&family=PT+Sans&family=Raleway&family=Cormorant+Garamond&family=Cormorant&family=Noto+Serif&family=Noto+Sans&family=Ubuntu&family=Rubik&family=Oswald&family=Fira+Sans&family=Fira+Sans+Condensed&family=IBM+Plex+Sans&family=IBM+Plex+Serif&family=Source+Sans+3&family=Source+Serif+4&family=Alegreya&family=Alegreya+Sans&family=Old+Standard+TT&family=Spectral&family=Prata&family=Vollkorn&family=Philosopher&family=Tenor+Sans&family=Forum&family=Marck+Script&family=Bad+Script&family=Caveat&family=Comfortaa&family=Poiret+One&family=Yeseva+One&family=Russo+One&family=Unbounded&family=Golos+Text&family=Neucha&family=Pacifico&family=Lobster&family=Kelly+Slab&family=Jura&family=Exo+2&family=Play&family=Roboto+Slab&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}