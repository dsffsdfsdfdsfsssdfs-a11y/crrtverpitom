import HomeClient from './HomeClient';
import { inlineImage, readContent } from '@/lib/local-content';

export const revalidate = false;

export default async function Home() {
  const content = await readContent();
  const logoImage = typeof content?.header?.logoImage === 'string' ? content.header.logoImage : '';
  const inlineLogo = logoImage ? await inlineImage(logoImage) : '';

  return (
    <HomeClient
      initialContent={content}
      inlineLogo={inlineLogo}
      initialLogoUrl={logoImage}
    />
  );
}
