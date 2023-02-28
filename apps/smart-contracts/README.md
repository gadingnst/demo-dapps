# Sample Hardhat Project

## Installation
### Install depedencies
```npm install```

### Install from Scratch
#### install hardhat
```npm install --save-dev hardhat```

#### setup project
```npx hardhat```

--------------------------------

## Getting Started
### Setup network and account
Create `.env` file within the template `.env.example`
Change `ALCHEMY_KEY` and `ACCOUNT_PRIVATE_KEY` with your own

### Compile
```npm run contract:compile```

### Artifacts
It will produce two folders, `artifacts` and `cache`.
To get ABI and Bytecode, go to `artifacts/contracts/{CONTRACT_NAME}/{CONTRACT_NAME}.json`

### Deploy contracts
To deploy the bytecode of smart contract into default network, you just run:
```
npm run contract:deploy:Election
```

Or if you want to deploy in custom network, you can run:
```
npx hardhat run scripts/{YOUR_DEPLOYER_FILE} --network {YOUT_NETWORK_NAME}
```

if you want to deploy into testnet or mainnet just configure the network and deploy to network name

--------------------------------

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
