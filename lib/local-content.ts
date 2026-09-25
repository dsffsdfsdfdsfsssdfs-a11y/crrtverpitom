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

function collectUploadNames(value: unknown, names = new Set<string>()) {
  if (typeof value === 'string' && value.startsWith('/uploads/')) {
    names.add(path.basename(value.split('?')[0]));
  } else if (Array.isArray(value)) {
    for (const item of value) collectUploadNames(item, names);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) collectUploadNames(item, names);
  }
  return names;
}

async function cleanupUnusedUploads(content: unknown) {
  try {
    const used = collectUploadNames(content);
    const files = await fs.readdir(uploadsDir);
    await Promise.all(
      files
        .filter(file => !used.has(file))
        .map(file => fs.unlink(path.join(uploadsDir, file)).catch(() => undefined))
    );
  } catch {}
}

export async function readContent() {
  try {
    return JSON.parse(await fs.readFile(contentFile, 'utf8'));
  } catch {
    return JSON.parse(await fs.readFile(fallbackFile, 'utf8'));
  }
}

export async function saveContent(content: unknown) {
  await ensureStorage();
  const temp = contentFile + '.tmp';
  await fs.writeFile(temp, JSON.stringify(content, null, 2) + '\n', 'utf8');
  await fs.rename(temp, contentFile);
  await cleanupUnusedUploads(content);
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


function mimeFromName(name: string) {
  const ext = path.extname(name.split('?')[0]).toLowerCase();
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.avif') return 'image/avif';
  return 'image/webp';
}

export async function inlineImage(url: string, maxBytes = 2500000) {
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;

  try {
    if (url.startsWith('/uploads/')) {
      await ensureStorage();
      const filename = path.basename(url.split('?')[0]);
      const file = path.join(uploadsDir, filename);
      const buf = await fs.readFile(file);
      if (buf.length > maxBytes) return '';
      return `data:${mimeFromName(filename)};base64,${buf.toString('base64')}`;
    }

    if (/^https?:\/\//i.test(url)) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(url, { signal: controller.signal, cache: 'force-cache' });
        if (!response.ok) return '';
        const declared = Number(response.headers.get('content-length') || 0);
        if (declared && declared > maxBytes) return '';
        const buf = Buffer.from(await response.arrayBuffer());
        if (buf.length > maxBytes) return '';
        const mime = response.headers.get('content-type')?.split(';')[0] || mimeFromName(url);
        if (!mime.startsWith('image/')) return '';
        return `data:${mime};base64,${buf.toString('base64')}`;
      } finally {
        clearTimeout(timer);
      }
    }
  } catch {}

  return '';
}