import type { RpcApiParams, RpcApiPath, RpcApiResult } from '~/types/rpc';
import { HttpFetch } from './http-fetch';
import rpcApiJson from '~/utils/mcc-wallets/mmc-rpc-api.json';
import { ERC20 } from '../evm';
import { ethers } from 'ethers';
import type { AccountToken } from '../mcc-wallets/account-token';

export class MMCRpcApi extends HttpFetch {
  nonce = 1;
  version = '2.0';

  post = async <K extends RpcApiPath>(
    method: K,
    params: RpcApiParams<K>,
    options?: { outputResult?: boolean },
  ): Promise<RpcApiResult<K>> => {
    const path = `/rpc-api/${method}`;

    const data = await this.httpPost(path, JSON.stringify(params));
    const result = data.result;

    if (options?.outputResult) {
      return result;
    }

    if (result?.code !== 0) {
      const message = result.message;
      const errorMsg = rpcApiJson[method]['error'];
      const code = result.code as keyof typeof errorMsg;

      const msg = errorMsg[code] ?? message;
      if (code === -300) {
        const msgcode = message?.split('output:')?.[1]?.trim() ?? '';

        const errorByte: string = (
          msgcode.replace(/\(([-\d]+)\)$/, '') ?? ''
        ).substring(136);
        let errMsg = '';
        try {
          Buffer.from(errorByte.substring(136), 'hex').toString('utf8');
        } catch {
          errMsg = msg;
        }

        if (!errMsg) {
          throw new Error(msg);
        }
        throw new Error(errMsg);
      } else if (msg) {
        throw new Error(msg);
      } else {
        throw new Error(message);
      }
    }
    return result;
  };

  call = async <K extends RpcApiPath>(
    method: K,
    params: RpcApiParams<K>,
    options?: { outputResult?: boolean },
  ): Promise<RpcApiResult<K>> => {
    const param = {
      params: {},
      ...params,
      id: this.nonce.toString(),
      jsonrpc: this.version,
      method: method,
    };
    this.nonce++;

    return await this.post(method, param, options);
  };

  estimatedGas = async <K extends RpcApiPath>(
    method: K,
    params: RpcApiParams<K>,
  ) => {
    const res = (await this.call(method, {
      ...params,
      params: {
        ...(params as any)['params'],
        istochain: 'true',
      },
    }, { outputResult: true })) as any;

    if (res?.code !== 0) {
      throw new Error(res.message);
    } else {
      const val = res.txJson
        ? (JSON.parse(res.txJson)
            ?.utxos?.flatMap((u: any) => u.vout || [])
            ?.find((v: any) => v.addr === 'VirtualBurnGas' && v.value)?.value
            ?? '0')
        : '0';

      return val;
    }
  };

  getTokenInfo = async (param: {
    token: AccountToken;
    from: string;
  }): Promise<AccountToken> => {
    const contract = param.token.address;
    const erc20 = new ERC20(contract);
    const symbolData = await erc20.getFunction('symbol');
    const params = {
      addr: param.from,
      args: symbolData!.data!,
      contractAddress: contract,
      deployer: param.token.deployer,
      deployutxo: param.token.deployutxo,
      gasTrade: [param.from, 'Vote'],
      isFindUtxo: false,
      istochain: 'false',
      money: '0',
      pubstr: '',
      tip: '0',
      txInfo: 'info',
      sleeptime: '15',
      isGasTrade: false,
    };

    const symbolTxData = await this.call('CreateCallContractTransaction', {
      method: 'CreateCallContractTransaction',
      params,
    });
    const symbolTxJson = JSON.parse(symbolTxData['txJson'] || '{}');
    const symbolOut = JSON.parse(symbolTxJson['data'])?.['txinfo']?.['output'];

    const decimalsData = await erc20.getFunction('decimals');

    const decimalsTxData = await this.call('CreateCallContractTransaction', {
      method: 'CreateCallContractTransaction',
      params: {
        ...params,
        args: decimalsData!.data!,
      },
    });

    const decimalsTxJson = JSON.parse(decimalsTxData['txJson'] || '{}');
    const decimalsOut = JSON.parse(decimalsTxJson['data'])?.['txinfo']?.[
      'output'
    ];

    const abidecode = new ethers.utils.AbiCoder();

    return {
      ...param.token,
      address: contract,
      decimals: Number(abidecode.decode(['uint256'], '0x' + decimalsOut).toString()),
      symbol: abidecode.decode(['string'], '0x' + symbolOut).toString(),
    } as AccountToken;
  };

  confirmTx = async (hash: string) => {
    const heightRes = await this.call('GetBlockHeight', {});
    const res = await this.call('ConfirmTransaction', {
      params: {
        txhash: hash,
        height: heightRes.height,
      },
    });
    if (Number(res.percent || '0') >= 0.7) {
      return true;
    } else {
      throw new Error('Transaction failed');
    }
  };

  getBalance = async (param: RpcApiParams<'GetBalance'>['params']) => {
    const res = await this.call('GetBalance', {
      params: {
        ...param,
        assetType: param.assetType,
      },
    });

    return res.balance;
  };

  balanceOf = async (param: {
    from: string;
    to: string;
    token: AccountToken;
    pubkey: string;
  }) => {
    try {
      const erc20 = new ERC20(param.token.address);
      const data = await erc20.getFunction('balanceOf', param.from);

      const txData = await this.createContractTransaction({
        ...param,
        istochain: false,
        pubkey: param.pubkey,
        args: data!.data!,
        amount: '0',
      });

      const txJson = JSON.parse(txData['txJson'] || '{}');
      const output = JSON.parse(txJson['data'])?.['txinfo']?.['output'];

      return BigInt(output.startsWith('0x') ? output : `0x${output}`);
    } catch {
      return 0n;
    }
  };

  getAddressAssets = async (address: string) => {
    const assets = await this.call('getAssetType', {});
    const assetsInfo = await Promise.all(assets.assertType.map(hex =>
      this.call('GetAssetTypeInfo', { params: { assetType: hex } })));
    const assetList = [
      {
        name: 'Vote',
        symbol: 'Vote',
        decimals: 8,
        balance: '0',
        assetType: 'Vote',
        icon: '',
        proposalInfo: undefined,
        isNative: true,
        revokeProposalInfo: [],
      },
      ...assetsInfo.map((item, index) => {
        const proposalInfo = JSON.parse(item.proposalInfo);

        return {
          balance: '0',
          isNative: false,
          icon: '',
          decimals: 8,
          symbol: Buffer.from(proposalInfo.Name, 'base64').toString(),
          name: Buffer.from(proposalInfo.Name, 'base64').toString(),

          assetType: assets.assertType[index]!,
          proposalInfo: {
            ...proposalInfo,
            deployer: Buffer.from(proposalInfo.Identifier, 'base64').toString(),
          },
          revokeProposalInfo: item.revokeProposalInfo.map(x => JSON.parse(x)),
        };
      }),
    ];

    const balances = await Promise.all(assetList.map(item =>
      this.getBalance({
        addr: address,
        assetType: item.assetType,
      })));

    return assetList.map((item, index) => {
      item.balance = balances[index] || '0';
      return item;
    });
  };

  createTransaction = async (param: {
    from: string;
    to: string;
    amount: bigint | string;
    token: AccountToken;
    gasToken: AccountToken;
  }) => {
    const { from, to, amount, token, gasToken } = param;
    const gasAsset = gasToken.assetType;
    const tokenAsset = token.address;

    const _from = from;
    const _to = to;
    const txData = await this.call('CreateTransaction', {
      method: '',
      gasTrade: {
        gasFromAddr: _from,
        gasType: gasAsset,
      },
      params: {
        isFindUtxo: false,
        isGasTrade: gasAsset !== tokenAsset,
        sleeptime: '3',
        txInfo: '',
      },
      txAsset: [
        {
          assetType: tokenAsset,
          fromAddr: [_from],
          toAddrAmount: [
            {
              addr: _to,
              value: Number(amount),
            },
          ],
        },
      ],
    });

    return txData;
  };

  createContractTransaction = async (param: {
    from: string;
    amount: bigint | string;
    token: AccountToken;
    gasToken?: AccountToken;
    pubkey: string;
    istochain: boolean;
    args: string; // contract data
    to?: string;
  }) => {
    const { from, token, gasToken, pubkey, istochain } = param;
    const gasAsset = gasToken?.assetType;

    const tokenAsset = token?.address;

    const _from = from;
    const deployer = token?.deployer;
    const txData = await this.call('CreateCallContractTransaction', {
      method: 'CreateCallContractTransaction',
      params: {
        addr: _from,
        to: param.to,
        args: param.args,
        contractAddress: tokenAsset,
        deployer: deployer || '',
        deployutxo: token?.deployutxo || '',
        gasTrade: [_from, gasAsset ?? 'Vote'],
        isFindUtxo: false,
        isGasTrade: gasAsset !== tokenAsset,
        istochain: istochain.toString(),
        money: '0',
        pubstr: pubkey,
        tip: '0',
        txInfo: 'info',
        sleeptime: '15',
      } as any,
    });

    return txData;
  };

  async isApprove(param: { token: AccountToken; owner: string; spender: string; amount: bigint; pubkey: string }) {
    const erc20 = new ERC20(param.token.address);
    const data = await erc20.getFunction('allowance', ...[param.owner, param.spender]);

    const txData = await this.createContractTransaction({
      ...param,
      from: param.owner,
      istochain: false,
      pubkey: param.pubkey,
      args: data!.data!,
      amount: '0',
    });

    const txJson = JSON.parse(txData['txJson'] || '{}');
    const output = JSON.parse(txJson['data'])?.['txinfo']?.['output'];
    const available = BigInt(output.startsWith('0x') ? output : `0x${output}`);
    console.log(available);

    return param.amount <= available;
  }
}
