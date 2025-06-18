// src/lib/date.ts
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return isNaN(d.getTime()) ? '未知' : `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function formatCountdown(dateStr: string): string {
  const diff = parseLocalDate(dateStr).getTime() - new Date().getTime();
  if (isNaN(diff)) return '';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? `${days} 天後` : days === 0 ? '今天' : '';
}
