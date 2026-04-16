import { describe, it, expect } from 'vitest';
import { friendlyError, friendlyFetchError } from '../src/lib/adminErrors';

describe('friendlyError', () => {
  it('maps a known code to its plain-English message', () => {
    expect(friendlyError({ code: 'validation' })).toMatch(/fields need attention/i);
    expect(friendlyError({ code: 'too_large' })).toMatch(/10 MB/);
    expect(friendlyError({ code: 'duplicate_slug' })).toMatch(/already exists/i);
  });

  it('falls through to the server message when the code is unknown', () => {
    expect(friendlyError({ code: 'unknown_code', message: 'bespoke server text' })).toBe('bespoke server text');
  });

  it('handles null / undefined / string inputs without throwing', () => {
    expect(friendlyError(null)).toMatch(/went wrong/i);
    expect(friendlyError(undefined)).toMatch(/went wrong/i);
    expect(friendlyError('verbatim')).toBe('verbatim');
  });
});

describe('friendlyFetchError', () => {
  it('returns the auth-expired message on 401 without reading the body', async () => {
    const res = new Response('{"whatever":true}', { status: 401 });
    const err = await friendlyFetchError(res);
    expect(err.message).toMatch(/session expired/i);
  });

  it('maps a server error.code from the JSON body', async () => {
    const res = new Response(JSON.stringify({ error: { code: 'conflict', message: 'x' } }), { status: 409 });
    const err = await friendlyFetchError(res);
    expect(err.message).toMatch(/edited this at the same time/i);
    expect((err as Error & { conflict?: boolean }).conflict).toBe(true);
  });

  it('falls back to a status-code hint when the body has no error field', async () => {
    const res = new Response('not json', { status: 500 });
    const err = await friendlyFetchError(res);
    expect(err.message).toMatch(/500/);
  });
});
