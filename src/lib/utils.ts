// src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- className 工具 ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 自訂 fetch 錯誤 ---
export class FetchError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

// --- 強化版 fetch 工具 ---
export async function fetchWithErrorHandling<T = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);

  if (!res.ok) {
    let message = `請求失敗 (${res.status})`;

    switch (res.status) {
      case 429:
        message = '請求過於頻繁，請稍後再試 (429)';
        break;
      case 401:
        message = 'API 金鑰無效或權限錯誤 (401)';
        break;
      case 404:
        message = '找不到資料 (404)';
        break;
      default:
        if (res.status >= 500) {
          message = '伺服器錯誤，請稍後再試 (5xx)';
        }
        break;
    }

    throw new FetchError(res.status, message);
  }

  return res.json();
}
