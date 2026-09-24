import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = { themeColor: '#1d1511' };

export const metadata: Metadata = {
  title: 'Центр размножения растений — Тверь',
  description: 'Декоративные растения собственного производства в Тверской области.',
  icons: {
    icon: [{ url: '/favicon.ico?v=8', type: 'image/x-icon', sizes: 'any' }],
    shortcut: ['/favicon.ico?v=8'],
    apple: [{ url: '/favicon.ico?v=8', type: 'image/x-icon' }]
  }
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico?v=8" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Mono&family=Manrope:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
