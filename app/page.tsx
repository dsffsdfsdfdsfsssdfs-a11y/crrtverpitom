import HomeClient from './HomeClient';
import { readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const content = await readContent();
  const heroImage = typeof content?.hero?.image === 'string' ? content.hero.image : '';
  return (
    <>
      {heroImage ? <link rel="preload" as="image" href={heroImage} /> : null}
      <HomeClient initialContent={content} />
    </>
  );
}
