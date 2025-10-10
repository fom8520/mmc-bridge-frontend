import type rpcApiJson from '~/utils/mcc-wallets/mmc-rpc-api.json';

export type RpcApiType = typeof rpcApiJson;

export type RpcApiPath = keyof RpcApiType;

export type RpcApiParams<K extends RpcApiPath>
  = RpcApiType[K]['params'];
export type RpcApiResult<K extends RpcApiPath>
  = RpcApiType[K]['result'];
export type RpcApIError<K extends RpcApiPath>
  = RpcApiType[K]['error'];
