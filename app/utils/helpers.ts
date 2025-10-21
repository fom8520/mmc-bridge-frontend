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

export const errorHandling = (error: any): Error => {
  console.log(error);

  if (error instanceof Error) {
    let message = error.message;

    try {
      const errs = error.message
        ?.split?.('info=')?.[1]
        ?.split?.(', code=')?.[0];
      const messageStr = JSON.parse(errs ?? '{}')?.error?.message;

      if (messageStr) {
        message = messageStr;
      } else {
        const m = error.message?.split?.('(')?.[0];
        message = m || message;
      }
    } catch {
      const errs = error.message?.split?.('(');
      message = errs?.[0] ?? error.message;
    }

    const messageSplit = message.split(':');

    if (messageSplit[messageSplit.length - 1]?.trim().includes('User denied request signature')) {
      throw new Error('User denied request signature');
    }
    throw new Error(message);
  } else {
    if ('message' in error) {
      if (error.message.includes('user rejected')) {
        throw new Error('User rejected the request');
      } else if (error.message === 'withdraw_paused') {
        throw new Error('Withdraw is temporarily suspended at the moment.');
      } else if (
        error.message.includes('insufficient funds for intrinsic transaction cost')
        || error.message === 'insufficient_balance'
      ) {
        throw new Error('Insufficient balance');
      } else if (
        error?.data?.message?.includes('gas required exceeds allowance')
      ) {
        throw new Error('Insufficient balance');
      } else if (
        error.message.includes('missing revert data in call exception')
      ) {
        throw new Error('JsonRpc error, please try again later');
      } else {
        throw new Error(error.message);
      }
    } else {
      throw new TypeError((
        (error as any)?.data?.message
        ?? (error as any).message
        ?? error
        ?? ''
      ).toString());
    }
  }
};
