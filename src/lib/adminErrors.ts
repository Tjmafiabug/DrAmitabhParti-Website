/**
 * Turn API error responses into plain-English sentences the doctor can act on.
 * Anything not recognised falls through to the server-supplied message, which
 * is sanitised by the API layer.
 */

const FRIENDLY: Record<string, string> = {
  auth:             'Your session expired. Please sign in again.',
  bad_json:         'Something went wrong on the browser side. Please reload and try again.',
  validation:       'Some fields need attention — please check the highlighted inputs.',
  bad_key:          'That page does not exist.',
  not_found:        'That item has been deleted or was never saved.',
  conflict:         'Someone else edited this at the same time. Reload to see their changes, or overwrite.',
  duplicate_slug:   'A post with this URL already exists. Change the slug and try again.',
  too_large:        'That file is larger than the 10 MB limit.',
  bad_type:         'That file type is not supported. Use JPEG, PNG, WebP, or AVIF.',
  bad_content:      'That file does not look like a valid image.',
  no_file:          'No file was attached.',
  process_failed:   'Could not read that image. Try a different file.',
  upload_failed:    'Could not save the image. Please try again in a moment.',
  env:              'The site is not fully configured. Please contact your developer.',
  db:               'We could not save that. Please try again in a moment — if it keeps failing, contact your developer.',
};

export function friendlyError(err: unknown): string {
  if (!err) return 'Something went wrong. Please try again.';
  const anyErr = err as { code?: string; message?: string };
  if (typeof err === 'string') return err;
  if (anyErr.code && FRIENDLY[anyErr.code]) return FRIENDLY[anyErr.code];
  if (anyErr.message) return anyErr.message;
  return 'Something went wrong. Please try again.';
}

/**
 * Helper to throw friendly errors from a fetch Response body. Usage:
 *   if (!res.ok) throw await friendlyFetchError(res);
 */
export async function friendlyFetchError(res: Response): Promise<Error> {
  if (res.status === 401) return new Error(FRIENDLY.auth);
  let data: unknown = null;
  try { data = await res.json(); } catch { /* ignore */ }
  const apiError = (data as { error?: { code?: string; message?: string } } | null)?.error;
  const msg = friendlyError(apiError ?? { message: `Request failed (${res.status})` });
  const out = new Error(msg);
  if (apiError?.code === 'conflict') (out as Error & { conflict?: boolean }).conflict = true;
  if ((data as { server_updated_at?: string } | null)?.server_updated_at) {
    (out as Error & { server_updated_at?: string }).server_updated_at = (data as { server_updated_at: string }).server_updated_at;
  }
  return out;
}
