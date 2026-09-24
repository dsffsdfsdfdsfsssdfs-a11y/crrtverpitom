import HomeClient from './HomeClient';
import { readContent } from '@/lib/local-content';

export const revalidate = false;

export default async function Home() {
  const content = await readContent();
  return <HomeClient initialContent={content} />;
}
