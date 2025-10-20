import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'vue-sonner';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(at: number, format = 'YYYY/MM/DD HH:mm:ss') {
  return dayjs(at).format(format);
}
export function shortAddress(address?: string, length: number = 6) {
  if (address == null) return '';
  return (
    address.substring(0, length)
    + '...'
    + address.substring(address.length - length)
  );
}

export async function copyText(str: string) {
  document.addEventListener('copy', (e) => {
    e.clipboardData?.setData('text/plain', str);
    e.preventDefault();
  });
  const isCopy = document.execCommand('copy');
  if (!isCopy) {
    if (!navigator.clipboard) throw Error;
    await navigator.clipboard.writeText(str);
  }

  toast.success('Copied');
  return true;
}

export function formatAmount(value: string, decimal = 6) {
  return BigNumber(value).dp(decimal)
    .toFormat();
}
