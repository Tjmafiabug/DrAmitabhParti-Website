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

export function sanitizeBodyHtml(html: string, allowedImageOrigins: string[]): string {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
  });

  // Post-process: verify img src origins, force rel=noopener on external links.
  return clean
    .replace(/<img([^>]*?)>/gi, (match, attrs) => {
      const src = /src="([^"]+)"/i.exec(attrs)?.[1];
      if (!src) return '';
      const allowed = allowedImageOrigins.some((o) => src.startsWith(o));
      if (!allowed) return ''; // drop disallowed images entirely
      return match;
    })
    .replace(/<a\s([^>]*?)>/gi, (_m, attrs) => {
      const href = /href="([^"]+)"/i.exec(attrs)?.[1] ?? '';
      const isExternal = /^https?:\/\//i.test(href) && !href.includes(new URL(allowedImageOrigins[0] ?? 'https://amitabhparti.com').host);
      if (isExternal && !/rel=/.test(attrs)) {
        return `<a ${attrs} rel="noopener noreferrer" target="_blank">`;
      }
      return `<a ${attrs}>`;
    });
}
