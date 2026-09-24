import HomeClient from './HomeClient';
import { inlineImage, readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const content = await readContent();
  const logoImage = typeof content?.header?.logoImage === 'string' ? content.header.logoImage : '';
  const inlineLogo = logoImage ? await inlineImage(logoImage, 10000000) : '';

  return (
    <HomeClient
      initialContent={content}
      inlineLogo={inlineLogo}
      initialLogoUrl={logoImage}
    />
  );
}
