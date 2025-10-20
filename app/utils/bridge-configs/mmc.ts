export const mmc_testnet = {
  label: 'MMC',
  value: 'mmc',
  type: 'MMC',
  id: 987456123,
  icon: '',
  rpc: 'http://222.128.23.254:23134',
  network: 'Testnet',
  tokens: [
    {
      name: 'MMC',
      symbol: 'MMC',
      address: '0xEeffFAB068C4D59883158C373477FB8ad9E25815',
      chain: 'MMC',
      icon: '',
      decimals: 18,
      contract: { solana: { hyperTokenCollateral: '0xEeffFAB068C4D59883158C373477FB8ad9E25815' } },
    },
  ],
};

export default { mmc_testnet };
