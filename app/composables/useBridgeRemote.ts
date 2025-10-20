import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
// // import { ERC20 } from '~/utils/evm';
import { HyperERC20Collateral } from '~/utils/evm/hypeErc20';
// // import { MAX_INTEGER } from '~/utils/common';
import { HyperToken } from '~/utils/solana-wallets/contracts/hyperToken';
import { bridgeChainsTestnet, type BridgeChain } from '~/utils/bridge-configs';
import { SolanaApi } from '~/utils/apis/solana-api';
import { SolanaWalletController } from '~/utils/solana-wallets';

const chains = bridgeChainsTestnet;

export function useBridgeRemote() {
  const fromChain = useState('bridge:from-chain', () => chains[0]);
  const toChain = useState('bridge:to-chain', () => chains[1]);
  const fromToken = useState<BridgeChain['tokens'][number] | null>(
    'bridge:token',
    () => null,
  );
  const amount = useState('bridge:amount', () => '');
  const recipient = useState('bridge:recipient', () => '');

  async function getBalance() {
    const _token = fromToken.value;
    const _chain = fromChain.value;
    try {
      if (_chain && _token) {
        if (_chain.type === 'MMC') {
          const { rpcApi, address, provider } = useMMCWallet();

          if (!address.value) {
            return 0n;
          }
          const pubkey = await provider.getPublicKey();
          console.log(pubkey);

          const utxoInfo = await rpcApi.call('GetUtxoDeployerByConAddr', { params: { contractAddr: _token.address } });
          console.log(pubkey, utxoInfo);

          const balanceRes = await rpcApi.balanceOf({
            from: address.value!,
            to: address.value!,
            token: {
              address: _token.address,
              deployer: utxoInfo.deployer,
              deployutxo: utxoInfo.utxo,
            } as any,
            pubkey,
          });
          console.log(balanceRes);
          return balanceRes;
        } else if (_chain.type === 'Solana') {
          const { address } = useSolanaWallet();
          if (!address.value) {
            return 0n;
          }
          const api = new SolanaApi(_chain.rpc);
          console.log(address.value, _token.address);

          const balanceRes = await api.getBalance({
            address: address.value,
            contract: _token.address,
          });
          console.log(balanceRes);
          return balanceRes;
        }
      }

      return 0n;
    } catch (err) {
      console.log(err);

      return 0n;
    }
  }

  async function transferMmcToSolana() {
    const { rpcApi, address, provider: mmcProvider } = useMMCWallet();

    try {
      if (!address.value) {
        return;
      }

      const _mmcChain = fromChain.value;
      const _fromToken = fromToken.value;
      const _solanaChain = toChain.value;

      if (!_fromToken || !_solanaChain || !_mmcChain) {
        return;
      }
      const _config = _fromToken.contract[_solanaChain.value];

      if (!_config) {
        return;
      }

      if (!SolanaWalletController.isValidSolanaAddress(recipient.value)) {
        throw new Error('Please enter the correct Solana recipient address.');
      }

      const hyperErc20 = new HyperERC20Collateral(_config.hyperTokenCollateral);
      const _amount = ethers.utils.parseUnits(amount.value, _fromToken.decimals).toBigInt();

      const pubkey = await mmcProvider.getPublicKey();

      const solAddr = new PublicKey(recipient.value)
        .toBuffer()
        .toString('hex');

      const txData = await hyperErc20.transferRemote({
        destination: _solanaChain.id.toString(),
        recipient: `0x${solAddr}`,
        amountOrId: _amount,
      });
      console.log(txData);

      const utxoInfo = await rpcApi.call('GetUtxoDeployerByConAddr', { params: { contractAddr: hyperErc20.address } });

      const params = {
        addr: address.value,
        args: txData!.data!,
        contractAddress: hyperErc20.address,
        deployer: utxoInfo.deployer,
        deployutxo: utxoInfo.utxo,
        isGasTrade: false,
        gasTrade: [
          address.value,
          'Vote',
          // '0xa6685d0768058e91da03880449e79b1bac47f731d1ddf0423e34c2e16e2dd6e8',
        ],
        isFindUtxo: false,
        istochain: 'true',
        money: '0',
        pubstr: pubkey,
        tip: '0',
        txInfo: 'info',
        sleeptime: '5',
      };

      const txRes = await mmcProvider.sendTransaction({
        method: 'CreateCallContractTransaction',
        data: params,
      });

      console.log(txRes);
      return txRes;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async function transferSolanaToMmc() {
    const { connectedWallet: solProvider } = useSolanaWallet();

    const _solanaChain = fromChain.value;
    const _fromToken = fromToken.value;
    const _toChain = toChain.value;

    if (!_fromToken || !_toChain || !_solanaChain) {
      return;
    }
    const _config = _fromToken.contract[_toChain.value];

    if (!_config) {
      return;
    }

    try {
      const hyperToken = new HyperToken(_config.hyperTokenCollateral, {
        rpc: _solanaChain.rpc,
        network: SolanaWalletController.requestSolanaNetworkType(_solanaChain.id),
        chainId: _solanaChain.id,
        destination_domain: _toChain.id,
      });
      const _amount = ethers.utils.parseUnits(amount.value, _fromToken.decimals).toBigInt();
      const res = await hyperToken.transferRemote(solProvider.value!, {
        token: _fromToken.address,
        igp_program_id: _config.igp_program_id!,
        mailbox: _config.mailbox!,
        recipient: recipient.value,
        amount: _amount,
        payer: solProvider.value!.address!,
        multisig_ism_message_id: _config.multisig_ism_message_id!,
      });

      console.log(res);
      return res;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  function solanaBridge() {
    const _toChain = toChain.value;

    if (_toChain?.type === 'MMC') {
      return transferSolanaToMmc();
    }
  }

  function mmcBridge() {
    const _toChain = toChain.value;

    if (_toChain?.type === 'Solana') {
      return transferMmcToSolana();
    }
  }

  function swap() {
    const _fromChain = fromChain.value;

    if (_fromChain?.type == 'Solana') {
      return solanaBridge();
    } else if (_fromChain?.type === 'MMC') {
      return mmcBridge();
    }
  }

  return {
    chains,
    fromChain,
    toChain,
    fromToken,
    amount,
    recipient,

    getBalance,
    swap,
    transferMmcToSolana,
    transferSolanaToMmc,
  };
}

// async function _approve(param: {
//   token: { address: string; deployer: string; deployutxo: string };
//   owner: string;
//   spender: string;
//   amount: bigint;
//   pubkey: string;
// }) {
//   const { rpcApi, address, provider: mmcProvider } = useMMCWallet();

//   let _isApprove = await rpcApi.isApprove(param as any);
//   if (_isApprove) {
//     return true;
//   }
//   const tokenContract = new ERC20(param.token.address);
//   const txData = await tokenContract.getFunction('approve', ...[param.spender, MAX_INTEGER]);
//   const params = {
//     addr: address.value!,
//     args: txData!.data!,
//     contractAddress: param.token.address,
//     deployer: param.token.deployer,
//     deployutxo: param.token.deployutxo,
//     isGasTrade: true,
//     gasTrade: [address.value!, '0xa6685d0768058e91da03880449e79b1bac47f731d1ddf0423e34c2e16e2dd6e8'],
//     isFindUtxo: false,
//     istochain: 'true',
//     money: '0',
//     pubstr: param.pubkey,
//     tip: '',
//     txInfo: 'info',
//     sleeptime: '10',
//   };
//   const txRes = await mmcProvider.sendTransaction({
//     method: 'CreateCallContractTransaction',
//     data: params,
//   });
//   await rpcApi.confirmTx(txRes['txHash']);

//   let i = 0;
//   while (_isApprove && i < 5) {
//     _isApprove = await rpcApi.isApprove(param as any);
//     if (_isApprove) {
//       continue;
//     }
//     i++;
//   }
//   return _isApprove;

//   // "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
//   // const contractTxData = await rpcApi.createContractTransaction({
//   //   from: address.value!,
//   //   amount: '0',
//   //   token: param.token as any,
//   //   pubkey: param.pubkey,
//   //   istochain: true,
//   //   args: txData.data,
//   //   gasToken: { assetType: '0xa6685d0768058e91da03880449e79b1bac47f731d1ddf0423e34c2e16e2dd6e8' } as any,
//   // });
//   // console.log(contractTxData);

//   // const txJson = contractTxData.txJson;
//   // const signedTxJson = await mmcProvider.signTransaction(txJson);
//   // const signedData = {
//   //   ...contractTxData,
//   //   txJson: signedTxJson,
//   // };
// }
