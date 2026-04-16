import DOMPurify from 'isomorphic-dompurify';

/**
 * Strict HTML allowlist for post body content emitted by Tiptap.
 * Anything outside the allowlist is stripped. Images restricted to our domain.
 */
const ALLOWED_TAGS = [
  'p', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote', 'em', 'strong',
  'br', 'hr', 'img', 'code', 'pre',
];
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'rel', 'target'];

function safeOriginHost(origin: string | undefined): string {
  try {
    if (!origin) return 'amitabhparti.com';
    return new URL(origin).host;
  } catch {
    return 'amitabhparti.com';
  }
}

export function sanitizeBodyHtml(html: string, allowedImageOrigins: string[]): string {
  let clean: string;
  try {
    clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    });
  } catch (e) {
    console.error('[sanitize] DOMPurify failed, passing through plain text:', (e as Error).message);
    // Fallback: strip all HTML tags rather than reject the save.
    return html.replace(/<[^>]+>/g, '');
  }

  const primaryHost = safeOriginHost(allowedImageOrigins[0]);

  try {
    return clean
      .replace(/<img([^>]*?)>/gi, (match, attrs) => {
        const src = /src="([^"]+)"/i.exec(attrs)?.[1];
        if (!src) return '';
        const allowed = allowedImageOrigins.some((o) => src.startsWith(o));
        if (!allowed) return '';
        return match;
      })
      .replace(/<a\s([^>]*?)>/gi, (_m, attrs) => {
        const href = /href="([^"]+)"/i.exec(attrs)?.[1] ?? '';
        const isExternal = /^https?:\/\//i.test(href) && !href.includes(primaryHost);
        if (isExternal && !/rel=/.test(attrs)) {
          return `<a ${attrs} rel="noopener noreferrer" target="_blank">`;
        }
        return `<a ${attrs}>`;
      });
  } catch (e) {
    console.error('[sanitize] post-process failed, returning DOMPurify output:', (e as Error).message);
    return clean;
  }
}
