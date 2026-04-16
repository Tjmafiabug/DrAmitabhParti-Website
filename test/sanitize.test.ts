import { describe, it, expect } from 'vitest';
import { sanitizeBodyHtml } from '../src/lib/sanitize';

const origins = [
  'https://test.supabase.co/storage/v1/object/public/post-images/',
  'https://amitabhparti.com/',
];

describe('sanitizeBodyHtml — XSS and injection', () => {
  it('strips <script> tags entirely', () => {
    const out = sanitizeBodyHtml('<p>hi</p><script>alert(1)</script>', origins);
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert(1)');
    expect(out).toContain('<p>hi</p>');
  });

  it('drops javascript: hrefs', () => {
    const out = sanitizeBodyHtml('<a href="javascript:alert(1)">x</a>', origins);
    expect(out).not.toMatch(/href="javascript:/i);
  });

  it('drops <style>, <iframe>, <object>, <embed>', () => {
    const out = sanitizeBodyHtml(
      '<style>body{display:none}</style><iframe src="x"></iframe><object></object><embed />',
      origins,
    );
    expect(out).not.toContain('<style');
    expect(out).not.toContain('<iframe');
    expect(out).not.toContain('<object');
    expect(out).not.toContain('<embed');
  });
});

describe('sanitizeBodyHtml — image allowlist', () => {
  it('keeps images from the allowlisted Supabase Storage origin', () => {
    const src = 'https://test.supabase.co/storage/v1/object/public/post-images/abc.webp';
    const out = sanitizeBodyHtml(`<img src="${src}" alt="x"/>`, origins);
    expect(out).toContain(src);
  });

  it('drops images from non-allowlisted origins', () => {
    const out = sanitizeBodyHtml('<img src="https://evil.example/x.png"/>', origins);
    expect(out).not.toContain('evil.example');
    expect(out).not.toContain('<img');
  });
});

describe('sanitizeBodyHtml — external link hardening', () => {
  it('adds rel="noopener noreferrer" and target="_blank" on external http(s) links', () => {
    const out = sanitizeBodyHtml('<a href="https://example.com/x">x</a>', origins);
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
  });

  it('does NOT add target=_blank on same-origin links', () => {
    const out = sanitizeBodyHtml('<a href="https://amitabhparti.com/about">a</a>', origins);
    expect(out).not.toContain('target="_blank"');
  });

  it('does NOT treat amitabhparti.com.evil.example as same-origin (exact host match)', () => {
    const out = sanitizeBodyHtml('<a href="https://amitabhparti.com.evil.example/x">a</a>', origins);
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
  });

  it('leaves malformed hrefs alone without throwing', () => {
    expect(() => sanitizeBodyHtml('<a href="::malformed::">x</a>', origins)).not.toThrow();
  });

  it('leaves mailto: links untouched', () => {
    const out = sanitizeBodyHtml('<a href="mailto:office@amitabhparti.com">mail</a>', origins);
    expect(out).toContain('href="mailto:office@amitabhparti.com"');
    expect(out).not.toContain('target="_blank"');
  });
});
