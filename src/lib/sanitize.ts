import sanitizeHtml from 'sanitize-html';

/**
 * Strict HTML allowlist for post / page body content emitted by Tiptap.
 * Anything outside the allowlist is stripped. Images restricted to our
 * own Supabase Storage bucket (or amitabhparti.com). External links get
 * rel="noopener noreferrer" and target="_blank".
 *
 * Uses `sanitize-html` (pure Node, no JSDOM / browser-polyfill churn) so
 * Vercel's serverless runtime doesn't hit ESM/CJS interop errors.
 */

const ALLOWED_TAGS = [
  'p', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote',
  'em', 'strong', 'br', 'hr', 'img', 'code', 'pre',
];

function safeOriginHost(origin: string | undefined): string {
  try {
    if (!origin) return 'amitabhparti.com';
    return new URL(origin).host;
  } catch {
    return 'amitabhparti.com';
  }
}

export function sanitizeBodyHtml(html: string, allowedImageOrigins: string[]): string {
  const primaryHost = safeOriginHost(allowedImageOrigins[0]);

  try {
    return sanitizeHtml(html, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {
        a:   ['href', 'title', 'rel', 'target'],
        img: ['src', 'alt', 'title'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesAppliedToAttributes: ['href', 'src'],
      disallowedTagsMode: 'discard',
      // Drop img elements whose src isn't in our allowlist.
      exclusiveFilter: (frame) => {
        if (frame.tag === 'img') {
          const src = frame.attribs?.src ?? '';
          return !allowedImageOrigins.some((o) => src.startsWith(o));
        }
        return false;
      },
      // Force rel + target on external links. External = absolute URL to a
      // host that isn't ours (exact host match, not substring).
      transformTags: {
        a: (tagName, attribs) => {
          const href = attribs.href ?? '';
          let isExternal = false;
          try {
            if (/^https?:\/\//i.test(href)) {
              isExternal = new URL(href).host !== primaryHost;
            }
          } catch { /* malformed URL — sanitize-html will drop it elsewhere */ }
          if (isExternal) {
            return {
              tagName,
              attribs: {
                ...attribs,
                rel: 'noopener noreferrer',
                target: '_blank',
              },
            };
          }
          return { tagName, attribs };
        },
      },
    });
  } catch (e) {
    console.error('[sanitize] sanitize-html failed, stripping all tags as fallback:', (e as Error).message);
    return html.replace(/<[^>]+>/g, '');
  }
}
