import {vi} from 'vitest';

type JsonBody = unknown;

export function jsonResponse(body: JsonBody, init: {ok?: boolean; status?: number} = {}) {
  const {ok = true, status = ok ? 200 : 400} = init;
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

/** Queues one Response per call, in order, for sequential fetch() calls made by a component. */
export function mockFetchSequence(...responses: Response[]) {
  const fetchMock = vi.fn();
  responses.forEach(response => fetchMock.mockImplementationOnce(() => Promise.resolve(response)));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/**
 * Routes fetch() calls by matching a substring of the URL (or the "PATCH"/"POST"/"DELETE" method
 * as a fallback key) to a canned JSON body. Useful when a component/page fires several requests
 * to different endpoints and the exact call order isn't worth pinning down.
 */
export function mockFetchByRoute(routes: Record<string, unknown>) {
  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    const method = init?.method;
    const urlMatch = Object.keys(routes).find(key => url.includes(key));
    const key = urlMatch ?? (method && routes[method] !== undefined ? method : undefined);
    return Promise.resolve(jsonResponse(key !== undefined ? routes[key] : []));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function buildJwt(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

