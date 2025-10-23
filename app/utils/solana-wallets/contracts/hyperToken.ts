import {
  Connection,
  PublicKey,
  // SystemProgram,
} from '@solana/web3.js';
// import type {
//   Keypair,
//   AccountMeta,
// } from '@solana/web3.js';

import type { SolanaWalletController } from '../controller';
import type { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
  MultiProtocolProvider,
  SealevelHypCollateralAdapter,
} from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';
// import {
//   initializeHyperlaneToken,
//   initializeIgpAccounts,
//   initializeMailbox,
// } from './lib';
// import {
//   igpGasPaymentPdaSeeds,
//   mailboxDispatchedMessagePdaSeeds,
// } from './process';
// import { SPL_NOOP_PROGRAM_ID } from './common';

export class HyperTokenCollateral {
  constructor(
    hyperToken: string,
    args: {
      rpc: string;
      network: WalletAdapterNetwork;
      chainId: number;
      destination_domain: number;
    },
  ) {
    this.hyperToken = new PublicKey(hyperToken);
    this.connection = new Connection(args.rpc);
    this._rpc = args.rpc;
    this.network = args.network;
    this.chainId = args.chainId;
    this.destination_domain = args.destination_domain;

    this.multiProvider = MultiProtocolProvider.createTestMultiProtocolProvider({
      solana: {
        chainId: this.chainId,
        domainId: args.destination_domain,
        name: 'solana',
        protocol: ProtocolType.Sealevel,
        rpcUrls: [{ http: this._rpc }],
      },
    });
  }

  _rpc!: string;
  chainId!: number;
  hyperToken!: PublicKey;
  connection!: Connection;
  network!: WalletAdapterNetwork;
  destination_domain!: number;

  multiProvider!: MultiProtocolProvider;

  async transferRemote(
    provider: SolanaWalletController,
    param: {
      payer: string;
      recipient: string;
      amount: bigint;

      token: string;
      mailbox: string;
      igp_program_id: string;
      multisig_ism_message_id: string; // 作为 default ISM 传给 InitMailbox
    },
  ) {
    const connection: Connection = this.connection;
    const hypCollateralAdapter = new SealevelHypCollateralAdapter(
      'solana',
      this.multiProvider,
      {
        token: param.token,
        warpRouter: this.hyperToken.toBase58(),
        mailbox: param.mailbox,
      },
    );

    const _tx = await hypCollateralAdapter.populateTransferRemoteTx({
      weiAmountOrId: param.amount,
      destination: this.destination_domain,
      recipient: param.recipient,
      fromAccountOwner: param.payer,
    });

    const sig = await provider.sendTransaction(_tx, connection);

    return sig;
  }

  async getTokenProgramId(token: PublicKey) {
    const mintInfo = await this.connection.getAccountInfo(new PublicKey(token));
    if (!mintInfo) {
      throw new Error(`Provided SVM account ${token} does not exist`);
    }

    return mintInfo.owner;
  }

  // async deriveAssociatedTokenAccount(param: {
  //   owner: PublicKey;
  //   token: PublicKey;
  // }): Promise<PublicKey> {
  //   const tokenProgramId = await this.getTokenProgramId(param.token);

  //   return getAssociatedTokenAddressSync(
  //     param.token,
  //     param.owner,
  //     true,
  //     tokenProgramId,
  //   );
  // }

  // /**
  //  * 暂不使用
  //  * @param param
  //  * @returns
  //  */
  // async getTransferInstructionKeys(param: {
  //   token: string;
  //   payer: PublicKey; // 付款/发送者
  //   recipient: string; // EVM 0x... 或 base58(Solana)
  //   destination_domain: number; // 目标链 domain（如 741852）
  //   amount: bigint; // u128 最小单位
  //   uniqueKeypair: Keypair;
  //   mailbox: string;
  //   igp_program_id: string;
  //   multisig_ism_message_id: string; // 作为 default ISM 传给 InitMailbox
  // }) {
  //   const payer = param.payer;
  //   const tokenProgramId = new PublicKey(param.token);
  //   const hyperTokenProgramId = this.hyperToken; // D8w6...
  //   const mailboxProgramId = new PublicKey(param.mailbox); // 4TP5...
  //   const igpProgramId = new PublicKey(param.igp_program_id); // N4qx...

  //   // const mintAccounts = initializeMint(this.connection)
  //   const igpAccounts = initializeIgpAccounts(igpProgramId);
  //   const mailboxAccounts = await initializeMailbox(this.connection, { mailboxProgramId });
  //   const hyperTokenAccounts = await initializeHyperlaneToken(this.connection, {
  //     programId: hyperTokenProgramId,
  //     mailboxProgramId: mailboxProgramId,
  //   });

  //   const uniqueKeypair = param.uniqueKeypair;
  //   const uniquePubkey = uniqueKeypair.publicKey;
  //   const [dispatchedMessageKey] = PublicKey.findProgramAddressSync(
  //     mailboxDispatchedMessagePdaSeeds(uniquePubkey),
  //     mailboxProgramId,
  //   );
  //   const [gasPaymentPdaKey] = PublicKey.findProgramAddressSync(
  //     igpGasPaymentPdaSeeds(uniquePubkey),
  //     igpProgramId,
  //   );

  //   const splTokenProgramId = await this.getTokenProgramId(tokenProgramId);
  //   const senderAtaProgramId = await this.deriveAssociatedTokenAccount({
  //     owner: payer,
  //     token: tokenProgramId,
  //   });

  //   const keys: AccountMeta[] = [
  //     // 0.  `[executable]` The system program.
  //     {
  //       pubkey: SystemProgram.programId,
  //       isWritable: false,
  //       isSigner: false,
  //     },
  //     // 1.  `[executable]` The spl_noop program.
  //     {
  //       pubkey: SPL_NOOP_PROGRAM_ID,
  //       isWritable: false,
  //       isSigner: false,
  //     },
  //     // 2.  `[]` The token PDA account.
  //     {
  //       pubkey: hyperTokenAccounts.token_pda,
  //       isWritable: false,
  //       isSigner: false,
  //     },
  //     // 3.  `[executable]` The mailbox program.
  //     {
  //       pubkey: mailboxProgramId, // ✅
  //       isWritable: false,
  //       isSigner: false,
  //     },
  //     // 4.  `[writeable]` The mailbox outbox account.
  //     {
  //       pubkey: mailboxAccounts.outbox,
  //       isWritable: true,
  //       isSigner: false,
  //     },
  //     // 5.  `[]` Message dispatch authority.
  //     {
  //       pubkey: hyperTokenAccounts.dispatch_authority,
  //       isWritable: false,
  //       isSigner: false,
  //     },
  //     // 6.  `[signer]` The token sender and mailbox payer.
  //     {
  //       pubkey: payer,
  //       isWritable: false,
  //       isSigner: true,
  //     },
  //     // 7.   `[signer]` Unique message / gas payment account.
  //     {
  //       pubkey: uniquePubkey,
  //       isWritable: false,
  //       isSigner: true,
  //     },
  //     // 8.  `[writeable]` Message storage PDA.
  //     {
  //       pubkey: dispatchedMessageKey,
  //       isWritable: true,
  //       isSigner: false,
  //     },
  //     // 9.  `[executable]` The IGP program.
  //     {
  //       pubkey: igpProgramId, // ✅
  //       isWritable: false,
  //       isSigner: false,
  //     },
  //     // 10. `[writeable]` The IGP program data.
  //     {
  //       pubkey: igpAccounts.program_data,
  //       isWritable: true,
  //       isSigner: false,
  //     },
  //     // 11. `[writeable]` Gas payment PDA.
  //     {
  //       pubkey: gasPaymentPdaKey,
  //       isWritable: true,
  //       isSigner: false,
  //     },
  //     // 12. `[]` OPTIONAL - The Overhead IGP program, if the configured IGP is an Overhead IGP.
  //     {
  //       pubkey: igpAccounts.overhead_igp, // ✅
  //       isWritable: false,
  //       isSigner: false,
  //     },
  //     // 13. `[writeable]` The IGP account.
  //     {
  //       pubkey: igpAccounts.igp_pda, // ✅
  //       isWritable: true,
  //       isSigner: false,
  //     },
  //     // 14. `[executable]` The spl_token_2022 program.
  //     {
  //       pubkey: splTokenProgramId,
  //       isWritable: false,
  //       isSigner: false,
  //     },
  //     // 15. `[writeable]` The mint.
  //     {
  //       pubkey: tokenProgramId, // ✅
  //       isWritable: true,
  //       isSigner: false,
  //     },
  //     // 16. `[writeable]` The token sender's associated token account, from which tokens will be sent.
  //     {
  //       pubkey: senderAtaProgramId,
  //       isWritable: true,
  //       isSigner: false,
  //     },
  //     // 17. `[writeable]` The escrow PDA account.
  //     {
  //       pubkey: hyperTokenAccounts.escrow,
  //       isWritable: true,
  //       isSigner: false,
  //     },
  //   ];

  //   keys.forEach((item, index) => {
  //     console.log(index, item.pubkey.toBase58());
  //   });

  //   return keys;
  // }

  // async transferRemote(
  //   provider: SolanaWalletController,
  //   param: {
  //     payer: string; //
  //     recipient: string; //)
  //     destination_domain: number; //
  //     amount: bigint; //

  //     token: string;
  //     mailbox: string;
  //     igp_program_id: string;
  //     multisig_ism_message_id: string; // 作为 default ISM 传给 InitMailbox
  //   },
  // ) {
  //   const connection: Connection = this.connection;

  //   const hyperTokenProgramId = this.hyperToken;
  //   const payer = new PublicKey(param.payer);
  //   const recipient32 = toEvmAddressBytes32(param.recipient);
  //   const uniqueKeypair = Keypair.generate();

  //   const keys: AccountMeta[] = await this.getTransferInstructionKeys({
  //     ...param,
  //     payer,
  //     uniqueKeypair,
  //   });

  //   const setComputeLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({ units: 1000000 });

  //   const setPriorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 0 });

  //   const recentBlockhash = (
  //     await this.connection.getLatestBlockhash('finalized')
  //   ).blockhash;

  //   const txs = new Transaction({
  //     feePayer: payer,
  //     recentBlockhash,
  //   }).add(setComputeLimitInstruction)
  //     .add(setPriorityFeeInstruction);

  //   const multiProvider = MultiProtocolProvider.createTestMultiProtocolProvider({
  //     solana: {
  //       chainId: 101,
  //       domainId: 1399811149,
  //       name: 'solana',
  //       protocol: ProtocolType.Sealevel,
  //       rpcUrls: [{ http: this._rpc }],
  //     },
  //   });
  //   const hypCollateralAdapter = new SealevelHypCollateralAdapter('solana', multiProvider, {
  //     token: param.token,
  //     warpRouter: this.hyperToken.toBase58(),
  //     mailbox: param.mailbox,
  //   });

  //   const _tx = await hypCollateralAdapter.populateTransferRemoteTx({
  //     weiAmountOrId: param.amount,
  //     destination: param.destination_domain,
  //     recipient: param.recipient,
  //     fromAccountOwner: param.payer,
  //   });

  //   const value = new SealevelInstructionWrapper({
  //     instruction: HypTokenInstruction.TransferRemote,
  //     data: new SealevelTransferRemoteInstruction({
  //       destination_domain: param.destination_domain,
  //       recipient: recipient32,
  //       amount_or_id: param.amount,
  //     }),
  //   });

  //   console.log(value);

  //   const serializedData = serialize(SealevelTransferRemoteSchema, value);

  //   // const data = encodeTransferRemote(param.destination_domain, recipient32, param.amount);
  //   // console.log(data.toHex(), Buffer.from(data), Buffer.from(data.toHex(), 'hex'));
  //   // console.log(Buffer.from(data.buffer, 'hex'));
  //   console.log(serializedData, serializedData.toHex());

  //   const ix = new TransactionInstruction({
  //     programId: hyperTokenProgramId,
  //     keys,
  //     // data: Buffer.from(data),
  //     data: Buffer.concat([
  //       Buffer.from([1, 1, 1, 1, 1, 1, 1, 1]),
  //       Buffer.from(serializedData),
  //     ]),
  //   });
  //   txs.add(ix);

  //   const sig = await provider.sendTransaction(_tx, connection);

  //   return sig;
  // }
}
