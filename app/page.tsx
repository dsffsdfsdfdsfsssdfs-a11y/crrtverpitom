import HomeClient from './HomeClient';
import { readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const content = await readContent();
  return <HomeClient initialContent={content} />;
}
