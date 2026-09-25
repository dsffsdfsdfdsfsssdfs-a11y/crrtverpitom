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
      </head>
      <body>{children}</body>
    </html>
  );
}