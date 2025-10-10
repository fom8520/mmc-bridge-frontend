import type { Connection, Transaction, Keypair, PublicKey } from '@solana/web3.js';
import { createAssociatedTokenAccountIdempotentInstruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

export async function createAndMintToAta(
  connection: Connection,
  txs: Transaction,
  params: {
    payer: PublicKey; // 付费者（钱包地址）
    mint: PublicKey; // Mint 地址
    mintAuthority: Keypair; // Mint Authority（后续需要参与签名）
    recipientWallet: PublicKey; // 接收人钱包（ATA owner）
    amount: bigint | number; // mint 数量（=0 仅创建 ATA）
    tokenProgramId?: PublicKey; // 默认 TOKEN_2022_PROGRAM_ID，可切换为 TOKEN_PROGRAM_ID
  },
): Promise<{
  ata: PublicKey;
  createdAta: boolean;
  appendedMint: boolean;
  // 发送时是否需要把 mintAuthority 作为本地 signer 传入（若你的 authority 在钱包中签，就不放这里）
  extraSigners: Keypair[];
}> {
  const {
    payer,
    mint,
    mintAuthority,
    recipientWallet,
    amount,
    tokenProgramId = TOKEN_2022_PROGRAM_ID,
  } = params;

  // 1) 计算 ATA
  const ata = await getAssociatedTokenAddress(
    mint,
    recipientWallet,
    false,
    tokenProgramId,
  );

  let createdAta = false;
  let appendedMint = false;

  // 2) 若 ATA 不存在则追加“创建 ATA（idempotent）”指令
  const ataInfo = await connection.getAccountInfo(ata);
  console.log(ataInfo, ata.toBase58());

  if (!ataInfo) {
    createdAta = true;
    try {
      txs.add(createAssociatedTokenAccountIdempotentInstruction(
        payer, // payer
        ata, // ata
        recipientWallet,
        mint,
        tokenProgramId,
      ));
    } catch {
      // 兼容老版本 @solana/spl-token
      txs.add(createAssociatedTokenAccountInstruction(
        payer,
        ata,
        recipientWallet,
        mint,
        tokenProgramId,
      ));
    }
  }

  // 3) 若 amount > 0 则追加 mintTo 指令
  const amt = typeof amount === 'bigint' ? amount : BigInt(amount);
  if (amt > 0n) {
    appendedMint = true;
    txs.add(createMintToInstruction(
      mint,
      ata,
      mintAuthority.publicKey,
      Number(amt), // 注意不要超过 2^53-1
      [],
      tokenProgramId,
    ));
  }

  return {
    ata,
    createdAta,
    appendedMint,
    // 如果你的 authority 是“本地 Keypair”，发送时把它放进 signers；
    // 如果是“钱包里托管的账户”，那就不要放到 signers，按钱包 SDK 的方式让它签。
    extraSigners: appendedMint ? [mintAuthority] : [],
  };
}
