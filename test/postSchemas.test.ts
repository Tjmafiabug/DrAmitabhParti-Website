import { describe, it, expect } from 'vitest';
import { postCreateSchema, postUpdateSchema, postDeleteSchema } from '../src/lib/postSchemas';

const validPost = {
  title:     'Hello world',
  slug:      'hello-world',
  excerpt:   'A short excerpt.',
  category:  'Essay' as const,
  body_json: { type: 'doc' },
  body_html: '<p>Hello world</p>',
  status:    'draft' as const,
};

describe('postCreateSchema', () => {
  it('accepts a minimal valid post', () => {
    expect(postCreateSchema.safeParse(validPost).success).toBe(true);
  });

  it('trims the title automatically', () => {
    const out = postCreateSchema.parse({ ...validPost, title: '  spaced  ' });
    expect(out.title).toBe('spaced');
  });

  it('rejects an uppercase slug', () => {
    const r = postCreateSchema.safeParse({ ...validPost, slug: 'Hello-World' });
    expect(r.success).toBe(false);
  });

  it('rejects a slug with leading/trailing hyphen', () => {
    expect(postCreateSchema.safeParse({ ...validPost, slug: '-hello' }).success).toBe(false);
    expect(postCreateSchema.safeParse({ ...validPost, slug: 'hello-' }).success).toBe(false);
  });

  it('rejects body_html over 300,000 chars', () => {
    const r = postCreateSchema.safeParse({ ...validPost, body_html: 'a'.repeat(300_001) });
    expect(r.success).toBe(false);
  });

  it('rejects an unknown category', () => {
    const r = postCreateSchema.safeParse({ ...validPost, category: 'Marketing' });
    expect(r.success).toBe(false);
  });

  it('rejects a non-URL cover_image_url', () => {
    const r = postCreateSchema.safeParse({ ...validPost, cover_image_url: 'not-a-url' });
    expect(r.success).toBe(false);
  });
});

describe('postUpdateSchema', () => {
  it('requires a UUID id', () => {
    const bad = postUpdateSchema.safeParse({ ...validPost, id: '123' });
    expect(bad.success).toBe(false);
    const good = postUpdateSchema.safeParse({ ...validPost, id: '11111111-2222-4333-8444-555555555555' });
    expect(good.success).toBe(true);
  });

  it('accepts an optional expected_updated_at for optimistic concurrency', () => {
    const r = postUpdateSchema.safeParse({
      ...validPost,
      id: '11111111-2222-4333-8444-555555555555',
      expected_updated_at: '2026-04-17T00:00:00Z',
    });
    expect(r.success).toBe(true);
  });
});

describe('postDeleteSchema', () => {
  it('requires a UUID id, nothing else', () => {
    expect(postDeleteSchema.safeParse({ id: '11111111-2222-4333-8444-555555555555' }).success).toBe(true);
    expect(postDeleteSchema.safeParse({ id: 'not-a-uuid' }).success).toBe(false);
    expect(postDeleteSchema.safeParse({}).success).toBe(false);
  });
});
