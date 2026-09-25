import HomeClient from './HomeClient';
import { readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const content = await readContent();
  const criticalImages = [content?.header?.logoImage, content?.hero?.image].filter((src): src is string => typeof src === 'string' && src.length > 0);
  return (
    <>
      {criticalImages.map(src => <link key={src} rel="preload" as="image" href={src} />)}
      <HomeClient initialContent={content} />
    </>
  );
}
