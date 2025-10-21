import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
// // import { ERC20 } from '~/utils/evm';
import { HyperERC20Collateral } from '~/utils/evm/hypeErc20';
// // import { MAX_INTEGER } from '~/utils/common';
import { HyperToken } from '~/utils/solana-wallets/contracts/hyperToken';
import { SolanaApi } from '~/utils/apis/solana-api';
import { SolanaWalletController } from '~/utils/solana-wallets';
import type { BridgeChain } from '~/utils/bridge-configs';
import { EvmApi } from '~/utils/apis/evm-api';
import { ERC20 } from '~/utils/evm';

export function useBridgeRemote() {
  const { chains } = useBridgeConfig();
  const { address: evmAddress, walletProvider: evmWalletProvider, switchNetwork } = useEvmWallet();
  const { rpcApi, address: mmcAddress, provider: mmcProvider } = useMMCWallet();
  const { address: solanaAddress } = useSolanaWallet();

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
      console.log(_chain && _token);

      if (_chain && _token) {
        if (_chain.type === 'MMC') {
          if (!mmcAddress.value) {
            return 0n;
          }
          const pubkey = await mmcProvider.getPublicKey();
          console.log(pubkey);

          const utxoInfo = await rpcApi.call('GetUtxoDeployerByConAddr', { params: { contractAddr: _token.address } });
          console.log(pubkey, utxoInfo);

          const balanceRes = await rpcApi.balanceOf({
            from: mmcAddress.value!,
            to: mmcAddress.value!,
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
          if (!solanaAddress.value) {
            return 0n;
          }
          const api = new SolanaApi(_chain.rpc);
          console.log(solanaAddress.value, _token.address);

          const balanceRes = await api.getBalance({
            address: solanaAddress.value,
            contract: _token.address,
          });
          console.log(balanceRes);
          return balanceRes;
        } else if (_chain.type === 'EVM') {
          if (!evmAddress.value) {
            return 0n;
          }
          const api = new EvmApi(_chain.rpc);

          return api.balanceOf(evmAddress.value, _token.address); ;
        }
      }

      return 0n;
    } catch (err) {
      console.log(err);

      return 0n;
    }
  }

  async function transferMmcToAll(_recipient: string) {
    try {
      if (!mmcAddress.value) {
        return;
      }

      const _mmcChain = fromChain.value;
      const _fromToken = fromToken.value;
      const _toChain = toChain.value;

      if (!_fromToken || !_toChain || !_mmcChain) {
        return;
      }
      const _config = _fromToken.contract[_toChain.value];

      if (!_config) {
        return;
      }

      const hyperErc20 = new HyperERC20Collateral(_config.hyperTokenCollateral);
      const _amount = ethers.utils.parseUnits(amount.value, _fromToken.decimals).toBigInt();

      const pubkey = await mmcProvider.getPublicKey();

      const txData = await hyperErc20.populateTransferRemote({
        destination: _toChain.id.toString(),
        recipient: _recipient,
        amountOrId: _amount,
      });
      console.log(txData);

      const utxoInfo = await rpcApi.call('GetUtxoDeployerByConAddr', { params: { contractAddr: hyperErc20.address } });

      const params = {
        addr: mmcAddress.value,
        args: txData!.data!,
        contractAddress: hyperErc20.address,
        deployer: utxoInfo.deployer,
        deployutxo: utxoInfo.utxo,
        isGasTrade: true,
        gasTrade: [
          mmcAddress.value,
          // 'Vote',
          '0x5b0a968d45eb5e13318e4580dcff1d44f945c3cd299f1d38612cf46f71920d07',
        ],
        isFindUtxo: false,
        istochain: 'true',
        money: '0',
        pubstr: pubkey,
        tip: '0',
        txInfo: 'info',
        sleeptime: '3',
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

  /**
   * Support mmc chain and evm chains
   * @returns
   */
  async function transferSolanaToEvm() {
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

      console.log(amount.value);

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

  async function transferEvmToAll(_recipient: string) {
    try {
      if (!evmAddress.value) {
        return;
      }

      const _fromChain = fromChain.value;
      const _fromToken = fromToken.value;
      const _toChain = toChain.value;
      if (!_fromToken || !_fromChain || !_toChain) {
        return;
      }
      const _config = _fromToken.contract[_toChain.value];
      if (!_config) {
        return;
      }
      await switchNetwork(_fromChain.id);

      const _provider = new ethers.providers.Web3Provider(evmWalletProvider.value!);
      const _amount = ethers.utils.parseUnits(amount.value, _fromToken.decimals).toBigInt();
      const erc20 = new ERC20(_fromToken.address, _fromChain.rpc);
      const hyperErc20 = new HyperERC20Collateral(_config.hyperTokenCollateral, _fromChain.rpc);

      await erc20.approve(_provider, {
        approvedAddress: hyperErc20.address,
        address: evmAddress.value,
        amount: _amount,
      });

      const res = await hyperErc20.transferRemote(
        _provider,
        {
          destination: _toChain.id.toString(),
          recipient: _recipient,
          amountOrId: _amount,
        },
      );

      return res;
    } catch (err) {
      console.log(err);
      throw errorHandling(err);
    }
  }

  function solanaBridge() {
    const _toChain = toChain.value;

    if (['MMC', 'EVM'].includes(_toChain?.type || '')) {
      return transferSolanaToEvm();
    }
  }

  function mmcBridge() {
    const _toChain = toChain.value;

    if (_toChain?.type === 'Solana') {
      if (!SolanaWalletController.isValidSolanaAddress(recipient.value)) {
        throw new Error('Please enter the correct Solana recipient address.');
      }
      const solAddr = new PublicKey(recipient.value)
        .toBuffer()
        .toString('hex');

      return transferMmcToAll(`0x${solAddr}`);
    } else if (_toChain?.type === 'EVM') {
      if (!ethers.utils.isAddress(recipient.value)) {
        throw new Error('Please enter the correct EVM recipient address.');
      }
      return transferMmcToAll(ethers.utils.hexZeroPad(recipient.value, 32));
    }
  }

  function evmBridge() {
    const _toChain = toChain.value;
    console.log(_toChain?.type);

    if (_toChain?.type === 'Solana') {
      if (!SolanaWalletController.isValidSolanaAddress(recipient.value)) {
        throw new Error('Please enter the correct Solana recipient address.');
      }
      const solAddr = new PublicKey(recipient.value)
        .toBuffer()
        .toString('hex');

      return transferEvmToAll(`0x${solAddr}`);
    } else if (['EVM', 'MMC'].includes(_toChain?.type || '')) {
      if (!ethers.utils.isAddress(recipient.value)) {
        throw new Error('Please enter the correct EVM/MMC recipient address.');
      }
      return transferEvmToAll(ethers.utils.hexZeroPad(recipient.value, 32));
    }
  }

  function swap() {
    const _fromChain = fromChain.value;

    if (_fromChain?.type == 'Solana') {
      return solanaBridge();
    } else if (_fromChain?.type === 'MMC') {
      return mmcBridge();
    } else if (_fromChain?.type === 'EVM') {
      return evmBridge();
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
    transferMmcToSolana: transferMmcToAll,
    transferMmcToAll,
    transferSolanaToMmc: transferSolanaToEvm,
    transferSolanaToEvm,
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
