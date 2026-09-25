import HomeClient from './HomeClient';
import { inlineImage, readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const content = await readContent();

  const [logoInline, heroInline] = await Promise.all([
    inlineImage(content?.header?.logoImage || ''),
    inlineImage(content?.hero?.image || '')
  ]);

  const readyContent = {
    ...content,
    header: {
      ...content.header,
      logoImage: logoInline || content.header.logoImage
    },
    hero: {
      ...content.hero,
      image: heroInline || content.hero.image
    }
  };

  return <HomeClient initialContent={readyContent} />;
}
