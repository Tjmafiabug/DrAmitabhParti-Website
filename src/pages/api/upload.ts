import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { supabaseAdmin } from '../../lib/supabase';

export const prerender = false;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB raw ceiling — we resize down server-side.
const TARGET_MAX_WIDTH = 1800;       // Max dimension we serve on public pages.
const WEBP_QUALITY = 82;

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
]);

// Magic-byte signatures we can verify cheaply. AVIF's signature lives at
// offset 4 ('ftyp' + brand) and requires more than a simple prefix check, so
// we delegate its verification to sharp below instead of a fake check here.
const MAGIC: Array<{ mime: string; sig: number[] }> = [
  { mime: 'image/jpeg', sig: [0xff, 0xd8, 0xff] },
  { mime: 'image/png',  sig: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', sig: [0x52, 0x49, 0x46, 0x46] },
];

function detectMime(buf: Uint8Array, declared: string): string | null {
  for (const m of MAGIC) {
    if (m.sig.every((b, i) => buf[i] === b)) return m.mime;
  }
  // AVIF: bytes 4..11 are "ftypavif" or "ftypavis" (image sequence).
  if (buf.length >= 12 &&
      buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 &&
      buf[8] === 0x61 && buf[9] === 0x76 && buf[10] === 0x69 &&
      (buf[11] === 0x66 || buf[11] === 0x73)) {
    return 'image/avif';
  }
  return ALLOWED_MIME.has(declared) ? declared : null;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return json({ error: { code: 'auth', message: 'Unauthorized' } }, 401);

  const form = await ctx.request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: { code: 'no_file', message: 'No file' } }, 400);

  if (file.size > MAX_BYTES) return json({ error: { code: 'too_large', message: 'Max 10 MB' } }, 413);
  if (!ALLOWED_MIME.has(file.type)) return json({ error: { code: 'bad_type', message: 'Unsupported image type' } }, 415);

  const srcBuf = Buffer.from(await file.arrayBuffer());
  const detected = detectMime(srcBuf, file.type);
  if (!detected) return json({ error: { code: 'bad_content', message: 'File does not look like an image' } }, 415);

  // Resize + convert to WebP. Strip EXIF for privacy.
  let processed: Buffer;
  let width: number | undefined;
  let height: number | undefined;
  try {
    const pipeline = sharp(srcBuf, { failOn: 'error' })
      .rotate()           // honour EXIF orientation, then strip metadata
      .resize({ width: TARGET_MAX_WIDTH, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: WEBP_QUALITY });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    processed = data;
    width = info.width;
    height = info.height;
  } catch (e) {
    console.error('[api/upload] sharp error:', e);
    return json({ error: { code: 'process_failed', message: 'Could not process image' } }, 422);
  }

  const name = `${crypto.randomUUID()}.webp`;
  const path = `posts/${name}`;

  const db = supabaseAdmin();
  const { error: upErr } = await db.storage.from('post-images').upload(path, processed, {
    contentType: 'image/webp',
    cacheControl: 'public, max-age=31536000, immutable',
    upsert: false,
  });
  if (upErr) {
    console.error('[api/upload] upload error:', upErr);
    const publicMsg = import.meta.env.DEV ? upErr.message : 'Could not save the image. Please try again.';
    return json({ error: { code: 'upload_failed', message: publicMsg } }, 500);
  }

  const { data } = db.storage.from('post-images').getPublicUrl(path);
  return json({ ok: true, url: data.publicUrl, path, width, height });
};
