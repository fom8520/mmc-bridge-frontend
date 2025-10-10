import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { ERC20 } from '~/utils/evm';
import { HyperERC20Collateral } from '~/utils/evm/hypeErc20';
import { MAX_INTEGER } from '~/utils/common';
import { HyperToken } from '~/utils/solana-wallets/contracts/hyperToken';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export function useBridgeRemote() {
  const { config, rpcApi, address, provider: mmcProvider } = useMMCWallet();
  const { connectedWallet: solProvider } = useSolanaWallet();

  async function _approve(param: {
    token: { address: string; deployer: string; deployutxo: string };
    owner: string;
    spender: string;
    amount: bigint;
    pubkey: string;
  }) {
    let _isApprove = await rpcApi.isApprove(param as any);
    if (_isApprove) {
      return true;
    }
    const tokenContract = new ERC20(param.token.address);
    const txData = await tokenContract.getFunction('approve', ...[param.spender, MAX_INTEGER]);
    const params = {
      addr: address.value!,
      args: txData.data,
      contractAddress: param.token.address,
      deployer: param.token.deployer,
      deployutxo: param.token.deployutxo,
      isGasTrade: true,
      gasTrade: [address.value!, '0xa6685d0768058e91da03880449e79b1bac47f731d1ddf0423e34c2e16e2dd6e8'],
      isFindUtxo: false,
      istochain: 'true',
      money: '0',
      pubstr: param.pubkey,
      tip: '',
      txInfo: 'info',
      sleeptime: '30',
    };
    const txRes = await mmcProvider.sendTransaction({
      method: 'CreateCallContractTransaction',
      data: params,
    });
    await rpcApi.confirmTx(txRes['txHash']);

    let i = 0;
    while (_isApprove && i < 5) {
      _isApprove = await rpcApi.isApprove(param as any);
      if (_isApprove) {
        continue;
      }
      i++;
    }
    return _isApprove;

    // "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    // const contractTxData = await rpcApi.createContractTransaction({
    //   from: address.value!,
    //   amount: '0',
    //   token: param.token as any,
    //   pubkey: param.pubkey,
    //   istochain: true,
    //   args: txData.data,
    //   gasToken: { assetType: '0xa6685d0768058e91da03880449e79b1bac47f731d1ddf0423e34c2e16e2dd6e8' } as any,
    // });
    // console.log(contractTxData);

    // const txJson = contractTxData.txJson;
    // const signedTxJson = await mmcProvider.signTransaction(txJson);
    // const signedData = {
    //   ...contractTxData,
    //   txJson: signedTxJson,
    // };
  }

  async function transferMmcToSolana() {
    try {
      if (!address.value) {
        return;
      }
      const hyperErc20 = new HyperERC20Collateral(config.mmc.hyperTokenCollateral);
      const amount = ethers.utils.parseUnits('0.1', 18).toBigInt();

      const pubkey = await mmcProvider.getPublicKey();
      console.log(pubkey);

      const solAddr = new PublicKey('AFZsaEA4qLUVF41kQZSiV7uAr5n6KuiCsGjE8TMyXRwM')
        .toBuffer()
        .toString('hex');
      console.log(solAddr, amount);
      console.log({
        destination: config.solana.chainId.toString(),
        recipient: `0x${solAddr}`,
        amountOrId: amount,
      });

      const txData = await hyperErc20.transferRemote({
        destination: config.solana.chainId.toString(),
        recipient: `0x${solAddr}`,
        amountOrId: amount,
      });
      console.log(txData);

      const utxoInfo = await rpcApi.call('GetUtxoDeployerByConAddr', { params: { contractAddr: hyperErc20.address } });

      const b = await rpcApi.balanceOf({
        from: address.value!,
        to: address.value!,
        token: {
          address: hyperErc20.address,
          deployer: utxoInfo.deployer,
          deployutxo: utxoInfo.utxo,
        } as any,
        pubkey,
      });

      console.log(b);

      const params = {
        addr: address.value,
        args: txData!.data!,
        contractAddress: hyperErc20.address,
        deployer: utxoInfo.deployer,
        deployutxo: utxoInfo.utxo,
        isGasTrade: true,
        gasTrade: [
          address.value,
          // 'Vote',
          '0xa6685d0768058e91da03880449e79b1bac47f731d1ddf0423e34c2e16e2dd6e8',
        ],
        isFindUtxo: false,
        istochain: 'true',
        money: '0',
        pubstr: pubkey,
        tip: '0',
        txInfo: 'info',
        sleeptime: '15',
      };

      const txRes = await mmcProvider.sendTransaction({
        method: 'CreateCallContractTransaction',
        data: params,
      });

      console.log(txRes);
    } catch (err) {
      console.log(err);
    }
  }

  async function transferSolanaToMmc() {
    try {
      const solMMC = config.solana.mmc;
      const hyperToken = new HyperToken(solMMC.hyperTokenCollateral, {
        rpc: config.solana.rpc,
        network: WalletAdapterNetwork.Devnet,
        chainId: config.solana.chainId,
        destination_domain: config.mmc.chainId,
      });
      const amount = ethers.utils.parseUnits('0.1', 9).toBigInt();
      const res = await hyperToken.transferRemote(solProvider.value!, {
        token: solMMC.token,
        igp_program_id: solMMC.igp_program_id,
        mailbox: solMMC.mailbox,
        recipient: address.value!,
        amount: amount,
        payer: solProvider.value!.address!,
        multisig_ism_message_id: solMMC.multisig_ism_message_id,
      });

      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

  return {
    transferMmcToSolana,
    transferSolanaToMmc,
  };
}
