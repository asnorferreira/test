export type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

function resolveBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    return 'http://localhost:3000/';
  }

  let sanitized = raw.replace(/;+$/, '');
  if (!sanitized.endsWith('/')) {
    sanitized = `${sanitized}/`;
  }

  try {
    const url = new URL(sanitized);
    return url.toString();
  } catch (error) {
    console.warn(
      `Invalid NEXT_PUBLIC_API_URL ("${raw}") - falling back to http://localhost:3000/`,
      error,
    );
    return 'http://localhost:3000/';
  }
}

export async function apiFetch<TResponse = unknown>(
  path: string,
  { skipAuth = false, headers, body, ...init }: ApiFetchOptions = {},
): Promise<TResponse> {
  const baseUrl = resolveBaseUrl();

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers ?? {}),
  };

  if (!skipAuth && typeof window !== 'undefined') {
    const token = window.localStorage.getItem('intermedius::token');
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const targetUrl = new URL(normalizedPath, baseUrl);

  const response = await fetch(targetUrl.toString(), {
    ...init,
    headers: finalHeaders,
    body:
      body && typeof body !== 'string'
        ? JSON.stringify(body)
        : (body as BodyInit | null | undefined),
  });

  if (!response.ok) {
    const message = await safeParseError(response);
    throw new Error(
      message ?? `Request to ${path} failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const text = await response.text();
  if (!text) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return JSON.parse(text) as TResponse;
  }

  return text as unknown as TResponse;
}

async function safeParseError(response: Response): Promise<string | null> {
  try {
    const data = await response.json();
    if (typeof data === 'string') {
      return data;
    }
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
    return null;
  } catch {
    return null;
  }
}


