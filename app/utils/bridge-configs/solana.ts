export const solana_devnet = {
  label: 'Solana Devnet',
  value: 'solana',
  id: 741852,
  type: 'Solana',
  icon: '/chain/solana.svg',
  rpc: 'https://api.devnet.solana.com',
  symbol: 'SOL',
  network: 'Devnet',
  explorer: 'https://explorer.solana.com?cluster=devnet',
  tokens: [
    {
      name: 'MMV',
      symbol: 'MMV',
      chain: 'Solana Devnet',
      address: 'vU8i2ezhwScnmUvY2Muip5en2PwwmbzvE46AnAwHZY7',
      icon: '',
      decimals: 9,
      contract: {
        mmc: {
          hyperTokenCollateral: '7yrXzqfoiBouGkZSWA6NfviW2mrmTR1T8LpxmkUw2o1x',
          igp_program_id: '7YAokK9sdubYFJzKy1ndzTnj4MSiCefmq2CuxRMtfHdA',
          igp_account: 'FQDqxiQGyJAL8uxNQSBbbU5J3fp3knWdoPaAXY3FA4p2',
          overhead_igp_account: 'GbEjpjbfcXj5AMS6iKTASQq3vanSBHi279p1ejzKj655',
          mailbox: 'B8U9nh44rHmCgd2ogZwRaaKhZAergY9B8t4JDovVQziS',
          validator_announce: '2U2KLwozcuibfYWJLh8w4anpQAKv6BhRW3egrJ4h1MFN',
          multisig_ism_message_id: 'GbUxpW2mD9hrh2smdFvHYeGN2KNk1D7AKUHCsNJmqSSy',
        },
        // bnb: {
        //   hyperTokenCollateral: '7yrXzqfoiBouGkZSWA6NfviW2mrmTR1T8LpxmkUw2o1x',
        //   igp_program_id: '7YAokK9sdubYFJzKy1ndzTnj4MSiCefmq2CuxRMtfHdA',
        //   igp_account: 'FQDqxiQGyJAL8uxNQSBbbU5J3fp3knWdoPaAXY3FA4p2',
        //   overhead_igp_account: 'GbEjpjbfcXj5AMS6iKTASQq3vanSBHi279p1ejzKj655',
        //   mailbox: 'B8U9nh44rHmCgd2ogZwRaaKhZAergY9B8t4JDovVQziS',
        //   validator_announce: '2U2KLwozcuibfYWJLh8w4anpQAKv6BhRW3egrJ4h1MFN',
        //   multisig_ism_message_id: 'GbUxpW2mD9hrh2smdFvHYeGN2KNk1D7AKUHCsNJmqSSy',
        // },
      },
    },
  ],
};

export default { solana_devnet };
