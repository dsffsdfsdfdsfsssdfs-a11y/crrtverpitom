import { promises as fs } from 'fs';
import path from 'path';

const dataDir = process.env.CRR_DATA_DIR || '/var/lib/crr-tver';
const contentFile = path.join(dataDir, 'site.json');
const uploadsDir = path.join(dataDir, 'uploads');
const fallbackFile = path.join(process.cwd(), 'data', 'site.json');

async function ensureStorage() {
  await fs.mkdir(uploadsDir, { recursive: true });
  try {
    await fs.access(contentFile);
  } catch {
    const initial = await fs.readFile(fallbackFile, 'utf8');
    await fs.writeFile(contentFile, initial, 'utf8');
  }
}

export async function readContent() {
  await ensureStorage();
  return JSON.parse(await fs.readFile(contentFile, 'utf8'));
}

export async function saveContent(content: unknown) {
  await ensureStorage();
  const temp = contentFile + '.tmp';
  await fs.writeFile(temp, JSON.stringify(content, null, 2) + '\n', 'utf8');
  await fs.rename(temp, contentFile);
}

export async function uploadFile(name: string, base64: string) {
  await ensureStorage();
  const clean = (name || 'image')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(-120);
  const filename = `${Date.now()}-${clean || 'image'}`;
  await fs.writeFile(path.join(uploadsDir, filename), Buffer.from(base64, 'base64'));
  return `/uploads/${filename}`;
}
