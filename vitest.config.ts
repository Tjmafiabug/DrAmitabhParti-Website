import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // Dummy env vars so modules that import lib/supabase.ts don't throw at
    // load time. The tests here are pure-unit — no network — so these
    // values are never actually used.
    env: {
      PUBLIC_SUPABASE_URL:        'https://test.supabase.co',
      PUBLIC_SUPABASE_ANON_KEY:   'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY:  'test-service-key',
      ADMIN_EMAIL:                'test@example.com',
    },
  },
});
