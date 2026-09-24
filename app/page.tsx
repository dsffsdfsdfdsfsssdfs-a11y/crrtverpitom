import HomeClient from './HomeClient';
import { readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function localizeRepoAssets(value: any): any {
  if (typeof value === 'string') {
    const match = value.match(/^https:\/\/raw\.githubusercontent\.com\/dsffsdfsdfdsfsssdfs-a11y\/crrtverpitom\/[^/]+\/public\/(.+)$/i);
    return match ? '/' + match[1] : value;
  }
  if (Array.isArray(value)) return value.map(localizeRepoAssets);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeRepoAssets(item)]));
  }
  return value;
}

export default async function Home() {
  const content = localizeRepoAssets(await readContent());
  return <HomeClient initialContent={content} />;
}
