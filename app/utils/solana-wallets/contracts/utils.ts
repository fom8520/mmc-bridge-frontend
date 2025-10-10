import { PublicKey, type Transaction } from '@solana/web3.js';
import { SystemProgram, Keypair } from '@solana/web3.js';
import { ethers } from 'ethers';

export function newFundedKeypair(
  txs: Transaction,
  from: PublicKey,
  lamports: number | bigint,
): Keypair {
  const keypair = Keypair.generate();
  txs.add(SystemProgram.transfer({
    fromPubkey: from,
    toPubkey: keypair.publicKey,
    lamports: typeof lamports === 'bigint' ? Number(lamports) : lamports,
  }));
  return keypair;
}

export function toEvmAddressBytes32(recipient: string): Uint8Array {
  if (recipient.startsWith('0x') && recipient.length === 42) {
    return Buffer.from(ethers.utils.hexZeroPad(recipient, 32).slice(2), 'hex');
  } else if (recipient.length >= 32) {
    return new PublicKey(recipient).toBuffer();
  } else {
    throw new Error('Invalid recipient format');
  }
}
