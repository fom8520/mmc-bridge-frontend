export const bnb_testnet = {
  label: 'BNB Smart Chain Testnet',
  value: 'bnb',
  id: 97,
  type: 'EVM',
  icon: '/chain/bnb.svg',
  symbol: 'BNB',
  network: 'Testnet',
  rpc: 'https://bsc-testnet-dataseed.bnbchain.org',
  explorer: 'https://testnet.bscscan.com',
  tokens: [
    {
      name: 'MMC',
      symbol: 'MMC',
      chain: 'BNB Smart Chain Testnet',
      address: '0x05B8Fd90863803849C9C7dD0FBEeeF8f7873d4f9',
      icon: '',
      decimals: 18,
      contract: {
        mmc: {
          hyperTokenCollateral: '0x503b896c0d5546a1addBf9dEF7967E5DCf99000f',
          igp_program_id: '',
          igp_account: '',
          overhead_igp_account: '',
          mailbox: '0xa561ea8925ee32778D42497007f696909C6b3579',
          validator_announce: '0xe70b3380D68Fdbd1e083eb6AbA6931831C73CBb9',
          multisig_ism_message_id: '0x5A81134643488d30F0A39054aB6BC5087697ac9C',
        },
        // solana: {
        //   hyperTokenCollateral: '0x503b896c0d5546a1addBf9dEF7967E5DCf99000f',
        //   igp_program_id: '',
        //   igp_account: '',
        //   overhead_igp_account: '',
        //   mailbox: '0xa561ea8925ee32778D42497007f696909C6b3579',
        //   validator_announce: '0xe70b3380D68Fdbd1e083eb6AbA6931831C73CBb9',
        //   multisig_ism_message_id: '0x5A81134643488d30F0A39054aB6BC5087697ac9C',
        // },
      },
    },
  ],
};

export default { bnb_testnet };
