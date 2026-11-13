import { appConfig } from '@/config/app.config';

/**
 * API MIJOZI (versiyalangan: /api/v1/...)
 * Hozir server yo‘q, shuning uchun `enabled: false` va har qanday so‘rov
 * aniq xato qaytaradi — soxta "muvaffaqiyat" ko‘rsatilmaydi.
 * 3-bosqichda: token (Authorization header) va server manzili qo‘shiladi.
 */
export class ApiNotConnectedError extends Error {
  constructor(path: string) {
    super(`API hali ulanmagan (${path}). Server keyingi bosqichda qo‘shiladi.`);
    this.name = 'ApiNotConnectedError';
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiRequest<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const { baseUrl, version, enabled } = appConfig.api;
  const url = `${baseUrl}/${version}${path}`;
  if (!enabled) throw new ApiNotConnectedError(url);

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Organization-Id': appConfig.organization.id,
      'X-Subject-Id': appConfig.subject.id,
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API xatosi ${res.status}: ${url}`);
  return (await res.json()) as T;
}
