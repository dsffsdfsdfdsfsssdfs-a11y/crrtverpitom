import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = { themeColor: '#f3eee4' };

export const metadata: Metadata = {
  title: 'Центр размножения растений — Тверь',
  description: 'Декоративные растения собственного производства в Тверской области.',
  icons: {
    icon: [{ url: '/favicon-v13.png?v=13', type: 'image/png', sizes: '64x64' }],
    shortcut: ['/favicon-v13.png?v=13'],
    apple: [{ url: '/favicon-v13.png?v=13', type: 'image/png', sizes: '64x64' }]
  }
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon-v13.png?v=13" />
        <link rel="shortcut icon" type="image/png" href="/favicon-v13.png?v=13" />
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
