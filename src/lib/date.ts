// src/lib/date.ts
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '未知' : `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function formatCountdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  if (isNaN(diff)) return '';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? `${days} 天後` : days === 0 ? '今天' : '';
}
