/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly ADMIN_EMAIL: string;
  readonly REVALIDATE_SECRET?: string;
  readonly VERCEL_DEPLOY_HOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email: string;
    };
  }
}
