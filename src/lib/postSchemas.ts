/**
 * Zod shapes for the /api/posts endpoint. Extracted from the route so they
 * can be unit-tested without spinning up the API.
 */

import { z } from 'zod';

export const postCategoryEnum = z.enum(['Essay', 'Awareness', 'Reflection']);
export const postStatusEnum   = z.enum(['draft', 'published']);

export const postSlugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const postBaseSchema = z.object({
  title:           z.string().min(1).max(200).transform((s) => s.trim()),
  slug:            z.string().min(1).max(96).regex(postSlugRe, 'Slug must be lowercase, hyphen-separated'),
  excerpt:         z.string().max(500).nullable().optional(),
  category:        postCategoryEnum,
  body_json:       z.unknown(),
  body_html:       z.string().max(300_000),
  status:          postStatusEnum,
  pull_quote:      z.string().max(500).nullable().optional(),
  reading_time:    z.string().max(32).nullable().optional(),
  cover_image_url: z.string().url().max(500).nullable().optional(),
});

export const postCreateSchema = postBaseSchema;

export const postUpdateSchema = postBaseSchema.extend({
  id: z.string().uuid(),
  // Optimistic concurrency token — matched against DB's updated_at.
  expected_updated_at: z.string().optional(),
});

export const postDeleteSchema = z.object({ id: z.string().uuid() });
