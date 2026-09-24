import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Центр размножения растений — Тверь',
  description: 'Декоративные растения собственного производства в Тверской области.'
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//raw.githubusercontent.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Mono&family=Manrope:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
