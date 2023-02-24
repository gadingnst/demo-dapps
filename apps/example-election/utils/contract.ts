/* eslint-disable turbo/no-undeclared-env-vars */
import ElectionContract from '../public/Election.json';

export const CONTRACT_ABI = ElectionContract.abi;
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x77873b12d6B485a8C1f623A4e16CC1d004666225'; // sandbox
