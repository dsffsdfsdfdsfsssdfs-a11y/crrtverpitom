import HomeClient from './HomeClient';
import { readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function localizeRepoAssets(value: any): any {
  if (typeof value === 'string') {
    if (value.startsWith('/uploads/1790339947673-cqh1vagodcf1qaiyvos_lfakf5iyjnikxncox5a1oq3svz13itpa62lbc0v59d6vxd4_jqdvhl68dwnqxv_uuwsz.webp')) {
      return '/hero-current-optimized.jpg?v=1';
    }
    const match = value.match(/^https:\/\/raw\.githubusercontent\.com\/dsffsdfsdfdsfsssdfs-a11y\/crrtverpitom\/[^/]+\/public\/(.+)$/i);
    if (!match) return value;
    const file = match[1].replace(/^uploads\//,'');
    if (file === '1790256543018-exlrj7ztuvop63wgjqkui7dsw_mc9mymnfcpw4fm_zeilo7u3mi8bbao1oj8hcepd43-chytw7r8ryrifxbfzw9k.jpg') {
      return '/favicon-v17.png?v=17';
    }
    if (file === '1790256146854-lyjh500c3dfczzpumdyigwunksyimztdsbhjlv1khcud4udhjd8rer980wfvtjt44dhpo1kcp-jgsej5jfmdaso7.jpg') {
      return '/hero-optimized.jpg?v=1';
    }
    return '/repo-assets/' + file;
  }
  if (Array.isArray(value)) return value.map(localizeRepoAssets);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeRepoAssets(item)]));
  }
  return value;
}

export default async function Home() {
  const content = localizeRepoAssets(await readContent());
  const criticalImages = [content?.header?.logoImage, content?.hero?.image].filter((src): src is string => typeof src === 'string' && src.length > 0);
  return (
    <>
      {criticalImages.map(src => <link key={src} rel="preload" as="image" href={src} />)}
      <HomeClient initialContent={content} />
    </>
  );
}