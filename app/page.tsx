import HomeClient from './HomeClient';
import { readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function inlineOptimizedImage(src:string,width:number,quality:number){
  if(!src) return '';
  try{
    const absolute=src.startsWith('/uploads/')?`https://crr-tver.ru${src}`:src;
    const optimized=`https://crr-tver.ru/_next/image?url=${encodeURIComponent(absolute)}&w=${width}&q=${quality}`;
    const response=await fetch(optimized,{cache:'force-cache'});
    if(!response.ok) return '';
    const type=response.headers.get('content-type')||'image/webp';
    const buffer=Buffer.from(await response.arrayBuffer());
    return `data:${type};base64,${buffer.toString('base64')}`;
  }catch{
    return '';
  }
}

export default async function Home() {
  const content = await readContent();

  const [logoInline,heroInline]=await Promise.all([
    inlineOptimizedImage(content?.header?.logoImage||'',256,75),
    inlineOptimizedImage(content?.hero?.image||'',1600,75)
  ]);

  const readyContent={
    ...content,
    header:{...content.header,logoImage:logoInline||content.header.logoImage},
    hero:{...content.hero,image:heroInline||content.hero.image}
  };

  return <HomeClient initialContent={readyContent} />;
}
