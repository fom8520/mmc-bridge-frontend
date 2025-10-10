import type { Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import {
  hyperlaneTokenPdaSeeds,
  mailboxProcessAuthorityPdaSeeds,
  mailboxMessageDispatchAuthorityPdaSeeds,
  hyperlaneTokenEscrowPdaSeeds,
  hyperlaneTokenAtaPayerPdaSeeds,

} from '../process';
// import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// async function resolveMintProgramId(conn: Connection, mint: PublicKey) {
//   const info = await conn.getAccountInfo(mint);
//   if (!info) throw new Error('mint not found');
//   if (info.owner.equals(TOKEN_PROGRAM_ID)) return TOKEN_PROGRAM_ID;
//   if (info.owner.equals(TOKEN_2022_PROGRAM_ID)) return TOKEN_2022_PROGRAM_ID;
//   throw new Error('mint owner not SPL token program');
// }

// function encodeInitData(args: {
//   mailbox: PublicKey;
//   interchainSecurityModule: null;
//   igp?: { igpProgram: PublicKey; overheadIgp: PublicKey } | null;

//   decimals: number; // u8
//   remoteDecimals: number; // u8
// }): Buffer {
//   const parts: Buffer[] = [];

//   // 1) tag
//   parts.push(Buffer.from([0x00]));

//   // 2) mailbox: Pubkey(32)
//   parts.push(args.mailbox.toBuffer());

//   // 3) interchain_security_module: Option<...>  None
//   parts.push(Buffer.from([0x00])); // None

//   // 4) interchain_gas_paymaster: Option<(Pubkey, InterchainGasPaymasterType)>
//   if (!args.igp) {
//     // None
//     parts.push(Buffer.from([0x00]));
//   } else {
//     // Some((igp_program, OverheadIgp(overhead_igp)))
//     parts.push(Buffer.from([0x01])); // Option::Some
//     parts.push(args.igp.igpProgram.toBuffer()); // igp program Pubkey(32)
//     parts.push(Buffer.from([0x01])); // enum: OverheadIgp
//     parts.push(args.igp.overheadIgp.toBuffer()); // overhead_igp Pubkey(32)
//   }

//   // 5) decimals (u8)
//   parts.push(Buffer.from([args.decimals & 0xff]));

//   // 6) remote_decimals (u8)
//   parts.push(Buffer.from([args.remoteDecimals & 0xff]));

//   return Buffer.concat(parts);
// }

export async function initializeHyperlaneToken(
  connection: Connection,
  param: {
    programId: PublicKey;
    mailboxProgramId: PublicKey;
    // payer: PublicKey;
    // mint: PublicKey;
    // igp: {
    //   programId: PublicKey;
    //   program_data: PublicKey;
    //   igp_pda: PublicKey;
    //   overhead_igp: PublicKey;
    // };
  },
) {
  const { programId, mailboxProgramId } = param;

  const [token_account_key, token_account_bump_seed]
    = PublicKey.findProgramAddressSync(hyperlaneTokenPdaSeeds(), programId);

  const [mailbox_process_authority_key] = PublicKey.findProgramAddressSync(
    mailboxProcessAuthorityPdaSeeds(programId),
    mailboxProgramId,
  );

  const [dispatch_authority_key, dispatch_authority_seed]
    = PublicKey.findProgramAddressSync(
      mailboxMessageDispatchAuthorityPdaSeeds(),
      programId,
    );

  const [escrow_account_key, escrow_account_bump_seed]
    = PublicKey.findProgramAddressSync(hyperlaneTokenEscrowPdaSeeds(), programId);

  const [ata_payer_account_key, ata_payer_account_bump_seed]
    = PublicKey.findProgramAddressSync(
      hyperlaneTokenAtaPayerPdaSeeds(),
      programId,
    );

  const tokenPdaInfo = await connection.getAccountInfo(token_account_key);
  console.log(tokenPdaInfo);

  // if (!tokenPdaInfo) {
  //   const slpProgramId = await resolveMintProgramId(connection, mint);
  //   const keys: AccountMeta[] = ([
  //     [SystemProgram.programId, false, false], // 0. `[executable]` The system program.
  //     [token_account_key, true, false], //  1. `[writable]` The token PDA account.
  //     [dispatch_authority_key, true, false], //  2. `[writable]` The dispatch authority PDA account.
  //     [payer, false, true], //  3. `[signer]` The payer.
  //     [slpProgramId, false, false], // 4. `[executable]` The SPL token program for the mint, i.e. either SPL token program or the 2022 version.
  //     [mint, true, false], // 5. `[]` The mint.
  //     [SYSVAR_RENT_PUBKEY, false, false], // 6. `[executable]` The Rent sysvar program.
  //     [escrow_account_key, true, false], // 7. `[writable]` The escrow PDA account.
  //     [ata_payer_account_key, true, false], // 8. `[writable]` The ATA payer PDA account.
  //   ] as [PublicKey, boolean, boolean][]).map(([pubkey, isWritable, isSigner]) => ({
  //     pubkey,
  //     isWritable,
  //     isSigner,
  //   }));

  //   const data = encodeInitData({
  //     mailbox: mailboxProgramId,
  //     decimals: LOCAL_DECIMALS,
  //     remoteDecimals: REMOTE_DECIMALS,
  //     interchainSecurityModule: null,
  //     igp: {
  //       igpProgram: igp.programId,
  //       overheadIgp: igp.overhead_igp,
  //     },
  //   });

  //   const ix = new TransactionInstruction({
  //     programId,
  //     keys,
  //     data,
  //   });

  //   txs.add(ix);
  // }

  return {
    token_pda: token_account_key,
    token_pda_bump: token_account_bump_seed,
    mailbox_process_authority: mailbox_process_authority_key,
    dispatch_authority: dispatch_authority_key,
    dispatch_authority_bump: dispatch_authority_seed,
    escrow: escrow_account_key,
    escrow_bump: escrow_account_bump_seed,
    ata_payer: ata_payer_account_key,
    ata_payer_bump: ata_payer_account_bump_seed,
  };
}
