export const mmc_testnet = {
  label: 'MMC',
  value: 'mmc',
  type: 'MMC',
  id: 987456123,
  symbol: 'MMC',
  icon: '/chain/mmc.svg',
  rpc: 'http://222.128.23.254:23134',
  network: 'Testnet',
  explorer: '',
  tokens: [
    {
      name: 'MMV',
      symbol: 'MMV',
      address: '0xc01841F1477ce63BcC18f3C0536b5DB003317948',
      chain: 'MMC',
      icon: '',
      decimals: 18,
      contract: {
        solana: {
          hyperTokenCollateral: '0xc01841F1477ce63BcC18f3C0536b5DB003317948',
          igp_program_id: '',
          igp_account: '',
          overhead_igp_account: '',
          mailbox: '0x557041803E114d1188F19cc3b6A9408eef611F00',
          validator_announce: '0x9972770b60e77a8eCb3ae4387907f3Efe8Aecf7e',
          multisig_ism_message_id: '0x993353aDEB4a91B7bccA8766Db8Ab397508E7d75',
        },
      },
    },
    {
      name: 'MMC',
      symbol: 'MMC',
      address: '0x0c87367a94a448b521D68236BBD131ed068f0374',
      chain: 'MMC',
      icon: '',
      decimals: 18,
      contract: {
        bnb: {
          hyperTokenCollateral: '0x0c87367a94a448b521D68236BBD131ed068f0374',
          igp_program_id: '',
          igp_account: '',
          overhead_igp_account: '',
          mailbox: '0x557041803E114d1188F19cc3b6A9408eef611F00',
          validator_announce: '0x9972770b60e77a8eCb3ae4387907f3Efe8Aecf7e',
          multisig_ism_message_id: '0x993353aDEB4a91B7bccA8766Db8Ab397508E7d75',
        },
      },
    },
  ],
};

export default { mmc_testnet };
