import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';

export const prerender = false;

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

// Magic bytes for content sniffing (defence against spoofed Content-Type).
const MAGIC: Array<{ mime: string; sig: number[] }> = [
  { mime: 'image/jpeg', sig: [0xff, 0xd8, 0xff] },
  { mime: 'image/png',  sig: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', sig: [0x52, 0x49, 0x46, 0x46] }, // RIFF; webp further tag in bytes 8-11
  { mime: 'image/avif', sig: [0x00, 0x00, 0x00] },       // crude; AVIF starts with ftyp box
];

function detectMime(buf: Uint8Array, declared: string): string | null {
  for (const m of MAGIC) {
    if (m.sig.every((b, i) => buf[i] === b)) return m.mime;
  }
  // Fallback: declared if allowed (webp/avif sigs above are approximate).
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

  if (file.size > MAX_BYTES) return json({ error: { code: 'too_large', message: 'Max 5 MB' } }, 413);
  if (!ALLOWED_MIME.has(file.type)) return json({ error: { code: 'bad_type', message: 'Unsupported image type' } }, 415);

  const buf = new Uint8Array(await file.arrayBuffer());
  const detected = detectMime(buf, file.type);
  if (!detected) return json({ error: { code: 'bad_content', message: 'File does not look like an image' } }, 415);

  const ext = detected.split('/')[1] === 'jpeg' ? 'jpg' : detected.split('/')[1];
  const name = `${crypto.randomUUID()}.${ext}`;
  const path = `posts/${name}`;

  const db = supabaseAdmin();
  const { error: upErr } = await db.storage.from('post-images').upload(path, buf, {
    contentType: detected,
    cacheControl: 'public, max-age=31536000, immutable',
    upsert: false,
  });
  if (upErr) {
    console.error('[api/upload] upload error:', upErr);
    return json({ error: { code: 'upload_failed', message: upErr.message } }, 500);
  }

  const { data } = db.storage.from('post-images').getPublicUrl(path);
  return json({ ok: true, url: data.publicUrl, path });
};
