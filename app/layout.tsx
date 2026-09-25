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
        <link rel="preload" as="image" href="/repo-assets/1790256146854-lyjh500c3dfczzpumdyigwunksyimztdsbhjlv1khcud4udhjd8rer980wfvtjt44dhpo1kcp-jgsej5jfmdaso7.jpg" />
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
