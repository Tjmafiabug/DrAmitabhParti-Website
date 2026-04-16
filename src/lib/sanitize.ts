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

function parseHostSafe(origin: string | undefined, fallback: string): string {
  try {
    if (!origin) return fallback;
    return new URL(origin).host;
  } catch {
    return fallback;
  }
}

/**
 * Sanitize Tiptap-authored HTML for public rendering.
 *
 * @param html   the raw HTML string
 * @param allowedImageOrigins  origins whose <img src> values are kept; everything else is stripped
 * @param siteHost  the host used to decide whether an <a href> is "external"; pass 'amitabhparti.com' or whatever the live site is. Optional — if omitted, same-origin is inferred from allowedImageOrigins[1] (which in this codebase is the site URL). Same-host links are left untouched; external links get rel="noopener noreferrer" and target="_blank".
 */
export function sanitizeBodyHtml(
  html: string,
  allowedImageOrigins: string[],
  siteHost?: string,
): string {
  const primaryHost = siteHost ?? parseHostSafe(allowedImageOrigins[1], 'amitabhparti.com');

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
