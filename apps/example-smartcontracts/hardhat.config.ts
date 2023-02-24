/* eslint-disable turbo/no-undeclared-env-vars */

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import DotEnv from 'dotenv';

DotEnv.config({ path: '.env' });

const {
  TPF_NODE_RPC_URL = '',
  ACCOUNT_PRIVATE_KEY = '',
  ALCHEMY_KEY = ''
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.17'
      }
    ]
  },
  defaultNetwork: 'sandbox2p5',
  networks: {
    sandbox2p5: {
      url: TPF_NODE_RPC_URL,
      chainId: 2525,
      accounts: [ACCOUNT_PRIVATE_KEY],
      gasPrice: 20000000000
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
      gasPrice: 20000000000
    },
    ganache: {
      url: 'http://127.0.0.1:7545'
      // gasLimit: 6000000000,
      // defaultBalanceEther: 10,
    }
  }
};

export default config;
