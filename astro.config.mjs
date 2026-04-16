// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://amitabhparti.com',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  // Sitemap is served dynamically from src/pages/sitemap.xml.ts so post slugs
  // appear as soon as they're published, without a rebuild. @astrojs/sitemap
  // is intentionally not wired up — it runs at build time and would miss
  // dynamic posts + leak admin routes.
  integrations: [mdx(), react()],
});
