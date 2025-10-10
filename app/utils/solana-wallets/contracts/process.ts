import type { PublicKey } from '@solana/web3.js';

// mailbox_inbox_pda_seeds
export function mailboxInboxPdaSeeds(bumpSeed?: number) {
  return [
    Buffer.from('hyperlane'),
    Buffer.from('-'),
    Buffer.from('inbox'),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// mailbox_outbox_pda_seeds
export function mailboxOutboxPdaSeeds(bumpSeed?: number) {
  return [
    Buffer.from('hyperlane'),
    Buffer.from('-'),
    Buffer.from('outbox'),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// hyperlane_token_pda_seeds
export function hyperlaneTokenPdaSeeds(bumpSeed?: number) {
  return [
    Buffer.from('hyperlane_message_recipient'),
    Buffer.from('-'),
    Buffer.from('handle'),
    Buffer.from('-'),
    Buffer.from('account_metas'),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// mailbox_process_authority_pda_seeds
export function mailboxProcessAuthorityPdaSeeds(recipientPubkey: PublicKey, bumpSeed?: number) {
  return [
    Buffer.from('hyperlane'),
    Buffer.from('-'),
    Buffer.from('process_authority'),
    Buffer.from('-'),
    recipientPubkey.toBuffer(),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// mailbox_message_dispatch_authority_pda_seeds
export function mailboxMessageDispatchAuthorityPdaSeeds(bumpSeed?: number) {
  return [
    Buffer.from('hyperlane_dispatcher'),
    Buffer.from('-'),
    Buffer.from('dispatch_authority'),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// hyperlane_token_escrow_pda_seeds
export function hyperlaneTokenEscrowPdaSeeds(bumpSeed?: number) {
  return [
    Buffer.from('hyperlane_token'),
    Buffer.from('-'),
    Buffer.from('escrow'),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// hyperlane_token_ata_payer_pda_seeds
export function hyperlaneTokenAtaPayerPdaSeeds(bumpSeed?: number) {
  return [
    Buffer.from('hyperlane_token'),
    Buffer.from('-'),
    Buffer.from('ata_payer'),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// mailbox_dispatched_message_pda_seeds
export function mailboxDispatchedMessagePdaSeeds(uniqueMessagePubkey: PublicKey, bumpSeed?: number) {
  return [
    Buffer.from('hyperlane'),
    Buffer.from('-'),
    Buffer.from('dispatched_message'),
    Buffer.from('-'),
    uniqueMessagePubkey.toBuffer(),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// igp_program_data_pda_seeds
export function igpProgramDataPdaSeeds(bumpSeed?: number) {
  return [
    Buffer.from('hyperlane_igp'),
    Buffer.from('-'),
    Buffer.from('program_data'),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// igp_pda_seeds
export function igpPdaSeeds(salt: PublicKey, bumpSeed?: number) {
  return [
    Buffer.from('hyperlane_igp'),
    Buffer.from('-'),
    Buffer.from('igp'),
    Buffer.from('-'),
    salt.toBuffer(),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// overhead_igp_pda_seeds
export function overheadIgpPdaSeeds(salt: PublicKey, bumpSeed?: number) {
  return [
    Buffer.from('hyperlane_igp'),
    Buffer.from('-'),
    Buffer.from('overhead_igp'),
    Buffer.from('-'),
    salt.toBuffer(),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// igp_gas_payment_pda_seeds
export function igpGasPaymentPdaSeeds(uniqueGasPaymentPubkey: PublicKey, bumpSeed?: number) {
  return [
    Buffer.from('hyperlane_igp'),
    Buffer.from('-'),
    Buffer.from('gas_payment'),
    Buffer.from('-'),
    uniqueGasPaymentPubkey.toBuffer(),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}

// hyperlane_token_mint_pda_seeds
export function tokenMintPdaSeeds(bumpSeed?: number) {
  return [
    Buffer.from('hyperlane_token'),
    Buffer.from('-'),
    Buffer.from('mint'),
    ...(bumpSeed !== undefined ? [Buffer.from([bumpSeed])] : []),
  ];
}
