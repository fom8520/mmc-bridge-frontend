import { PublicKey } from '@solana/web3.js';
import { igpPdaSeeds, igpProgramDataPdaSeeds, overheadIgpPdaSeeds } from '../process';

export function initializeIgpAccounts(programId: PublicKey) {
  const [program_data, program_data_bump_seed]
    = PublicKey.findProgramAddressSync(igpProgramDataPdaSeeds(), programId);

  const salt = new PublicKey(Buffer.alloc(32, 0));

  const [igp_pda, igp_pda_bump_seed] = PublicKey.findProgramAddressSync(
    igpPdaSeeds(salt),
    programId,
  );
  const [overhead_igp, overhead_igp_bump_seed]
    = PublicKey.findProgramAddressSync(overheadIgpPdaSeeds(salt), programId);

  return {
    programId,
    program_data,
    program_data_bump_seed,
    igp_pda,
    igp_pda_bump_seed,
    overhead_igp,
    overhead_igp_bump_seed,
  };
}
