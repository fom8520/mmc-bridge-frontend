import {
  SystemProgram,
  TransactionInstruction,
  type Connection,
  type Transaction,
  PublicKey,
  type AccountMeta,
} from '@solana/web3.js';
import { struct, u32, blob as u8blob } from '@solana/buffer-layout';
import { u64 as blU64 } from '@solana/buffer-layout-utils';

// 你已经有的 PDA 种子函数（示例）
function mailboxInboxPdaSeeds(): Buffer[] {
  return [Buffer.from('hyperlane'), Buffer.from('-'), Buffer.from('inbox')];
}
function mailboxOutboxPdaSeeds(): Buffer[] {
  return [Buffer.from('hyperlane'), Buffer.from('-'), Buffer.from('outbox')];
}

/**
 * MailboxInstruction::Init(InitMailbox { ... }) 的 data 编码器
 * data = tag(1B) + local_domain(u32 LE) + default_ism(32B) + max_protocol_fee(u64 LE) + protocol_fee(...)
 *
 * - tag：默认 0（Init），如果合约里不同，请覆盖
 * - protocolFee：若你只需要一个 u64，传 protocolFeeU64 即可；
 *                若合约的 ProtocolFee 是更复杂结构，直接把正确的序列化字节放到 protocolFeeRaw
 */
export function encodeMailboxInitData(args: {
  localDomain: number;
  defaultIsm: PublicKey;
  maxProtocolFee: bigint;
  protocolFeeU64?: bigint;
  protocolFeeRaw?: Uint8Array; // 若提供则优先生效
  tag?: number; // 默认 0
}): Buffer {
  if (args.localDomain < 0 || args.localDomain > 0xffffffff) {
    throw new Error('localDomain must be a u32');
  }
  const TAG = Buffer.from([args.tag ?? 0]);

  // 头部：u32 + 32B + u64
  type Head = { local_domain: number; default_ism: Uint8Array; max_protocol_fee: bigint };
  const HeadLayout = struct<Head>([
    u32('local_domain'),
    u8blob(32, 'default_ism'),
    blU64('max_protocol_fee'),
  ]);
  const headBuf = Buffer.alloc(HeadLayout.span);
  HeadLayout.encode(
    {
      local_domain: args.localDomain >>> 0,
      default_ism: args.defaultIsm.toBuffer(),
      max_protocol_fee: args.maxProtocolFee,
    } as any,
    headBuf,
  );

  // ProtocolFee：优先用 raw；否则用一个 u64（常见默认 0）
  let feeBuf: Buffer;
  if (args.protocolFeeRaw) {
    feeBuf = Buffer.from(args.protocolFeeRaw);
  } else {
    const FeeLayout = struct<{ fee: bigint }>([blU64('fee')]);
    feeBuf = Buffer.alloc(FeeLayout.span);
    FeeLayout.encode({ fee: args.protocolFeeU64 ?? 0n } as any, feeBuf);
  }

  return Buffer.concat([TAG, headBuf, feeBuf]);
}

/**
 * initialize_mailbox（不发送，只往 txs 里追加一条指令）
 *
 * 等价于 Rust:
 * Instruction {
 *   program_id: mailbox_program_id,
 *   accounts: [
 *     system_program (readonly),
 *     payer (signer, writable),
 *     inbox_pda (writable),
 *     outbox_pda (writable),
 *   ],
 *   data: MailboxInstruction::Init(InitMailbox{...}).encode()
 * }
 */
export function appendInitializeMailboxIx(
  txs: Transaction,
  params: {
    mailboxProgramId: PublicKey;
    payer: PublicKey;
    localDomain: number;
    defaultIsm: PublicKey;
    maxProtocolFee: bigint;
    // 二选一：简单场景用 protocolFeeU64；复杂结构自己序列化放 protocolFeeRaw
    protocolFeeU64?: bigint;
    protocolFeeRaw?: Uint8Array;
    // 如果合约里 Init 的枚举 tag 不是 0，可以改这里
    tagOverride?: number;
  },
) {
  const { mailboxProgramId, payer } = params;

  // 派生 PDA
  const [inboxPda] = PublicKey.findProgramAddressSync(
    mailboxInboxPdaSeeds(),
    mailboxProgramId,
  );
  const [outboxPda] = PublicKey.findProgramAddressSync(
    mailboxOutboxPdaSeeds(),
    mailboxProgramId,
  );

  // 账户列表（顺序/读写/签名 与 Rust 一致）
  const keys: AccountMeta[] = [
    {
      pubkey: SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    }, // 0
    {
      pubkey: payer,
      isWritable: true,
      isSigner: true,
    }, // 1
    {
      pubkey: inboxPda,
      isWritable: true,
      isSigner: false,
    }, // 2
    {
      pubkey: outboxPda,
      isWritable: true,
      isSigner: false,
    }, // 3
  ];

  // 指令 data
  const data = encodeMailboxInitData({
    localDomain: params.localDomain,
    defaultIsm: params.defaultIsm,
    maxProtocolFee: params.maxProtocolFee,
    protocolFeeU64: params.protocolFeeU64,
    protocolFeeRaw: params.protocolFeeRaw,
    tag: params.tagOverride ?? 0,
  });

  const ix = new TransactionInstruction({
    programId: mailboxProgramId,
    keys,
    data,
  });

  txs.add(ix);

  return {
    inbox: inboxPda,
    outbox: outboxPda,
  };
}

export async function initializeMailbox(
  connection: Connection,
  // txs: Transaction,
  params: {
    mailboxProgramId: PublicKey;
    // payer: PublicKey;
    // localDomain: number;
    // defaultIsm: PublicKey;
    // maxProtocolFee: bigint;
    // protocolFeeU64?: bigint;
    // protocolFeeRaw?: Uint8Array;
    // tagOverride?: number;
  },
) {
  const { mailboxProgramId } = params;

  const [inboxPda] = PublicKey.findProgramAddressSync(
    mailboxInboxPdaSeeds(),
    mailboxProgramId,
  );
  const [outboxPda] = PublicKey.findProgramAddressSync(
    mailboxOutboxPdaSeeds(),
    mailboxProgramId,
  );

  // ✅ 检查 inbox 或 outbox 是否已存在
  const inboxInfo = await connection.getAccountInfo(inboxPda);
  const outboxInfo = await connection.getAccountInfo(outboxPda);
  console.log('initializeMailbox', outboxInfo, inboxInfo, inboxPda.toBase58(), outboxPda.toBase58());

  if (inboxInfo && outboxInfo) {
    console.log(`[Mailbox] Already initialized, skip Init`);
    return {
      inbox: inboxPda,
      outbox: outboxPda,
      // newlyCreated: false,
    };
  }

  console.log(`[Mailbox] Not initialized, appending Init instruction`);

  // appendInitializeMailboxIx(txs, params);

  return {
    inbox: inboxPda,
    outbox: outboxPda,
    // newlyCreated: true,
  };
}
