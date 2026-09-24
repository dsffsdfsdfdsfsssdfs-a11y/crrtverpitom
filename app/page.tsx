import HomeClient from './HomeClient';
import { readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const content = await readContent();
  const heroImage = typeof content?.hero?.image === 'string' ? content.hero.image : '';
  const logoImage = typeof content?.header?.logoImage === 'string' ? content.header.logoImage : '';
  return (
    <>
      {heroImage ? <link rel="preload" as="image" href={heroImage} fetchPriority="high" /> : null}
      {logoImage ? <link rel="preload" as="image" href={logoImage} fetchPriority="high" /> : null}
      <HomeClient initialContent={content} />
    </>
  );
}
