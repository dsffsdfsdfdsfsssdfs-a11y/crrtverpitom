import HomeClient from './HomeClient';
import { readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function localizeRepoAssets(value: any): any {
  if (typeof value === 'string') {
    const match = value.match(/^https:\/\/raw\.githubusercontent\.com\/dsffsdfsdfdsfsssdfs-a11y\/crrtverpitom\/[^/]+\/public\/(.+)$/i);
    return match ? '/repo-assets/' + match[1].replace(/^uploads\//,'') : value;
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
