/* eslint-disable react/no-children-prop */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import Web3 from 'web3';
import TPFWeb from '@two-point-five/web3-sdk';
import { useEffect, useState } from 'react';
import { withMobileLayoutPage } from '../components/Layout';
import { Box, Button, Card, CardBody, CardHeader, Heading, Input, InputGroup, InputLeftAddon, Stack, StackDivider, Text, useToast } from '@chakra-ui/react';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../utils/contract';

// async function signTransaction() {
//   const web3 = initiateWeb3();
//   try {
//     const accounts = await connectWallet();
//     const result = await web3.eth.signTransaction({
//       from: accounts[0],
//       to: '0xd3AD842dC0036963BBf9752869dcF676590EFC5B',
//       value: '100000000000000000', // in wei
//       gas: 21000,
//       gasPrice: '1000000000'
//     });
//     console.log({ result });
//   } catch (err) {
//     console.error({ err });
//   }
// }

// async function signMessage() {
//   const web3 = initiateWeb3();
//   try {
//     const accounts = await connectWallet();
//     const result = await web3.eth.sign('Hello, Universe!', accounts[0]);
//     console.log({ result });
//   } catch (err) {
//     console.error({ err });
//   }
// }

// async function checkContract() {
//   const contract = initiateContract();
//   console.log({ contract });
// }

interface TransactionError {
  message: string;
  reason: string;
  receipt: {
    status: boolean;
    from: string;
    to: string;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    gasUsed: number;
    cumulativeGasUsed: number;
    effectiveGasPrice: number;
    logsBloom: string;
  };
}

function isTransactionError(err: unknown): err is TransactionError {
  const error: any = err;
  if (error?.receipt && error?.message?.includes('Transaction has been reverted by the EVM')) {
    return true;
  }
  return false;
}

function initiateWeb3() {
  const tpf: any = new TPFWeb('test', 'goerli', {
    environment: 'staging'
  });
  const web3 = new Web3(tpf.provider);
  web3.eth.handleRevert = true;
  return web3;
}

function initiateContract() {
  const web3 = initiateWeb3();
  const contract = new web3.eth.Contract(CONTRACT_ABI as any, CONTRACT_ADDRESS);
  contract.events.addCandidateEvent()
    .on('connected', function(subscriptionId: string) {
      console.log('onconnected:', subscriptionId);
    })
    .on('data', function(event: any) {
      console.log('ondata:', event); // same results as the optional callback above
    })
    .on('changed', function(_event: any) {
      // remove event from local database
    })
    .on('error', function(error: any, _receipt: any) {
      console.log(error);
    });
  return contract;
}

async function connectWallet() {
  const web3 = initiateWeb3();
  try {
    const accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0]);
    console.log({ accounts, balance });
    return accounts;
  } catch (err) {
    console.error({ err });
    return [];
  }
}

function Dashboard() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);

  const Toast = useToast();

  function handleConnectWallet() {
    connectWallet()
      .then((accounts) => {
        if (accounts.length) {
          setIsWalletConnected(true);
        }
      });
  }

  async function addCandidate() {
    if (!candidateName || !candidateParty) {
      return Toast({
        title: 'Candidate Name and Party must not be empty.',
        status: 'error',
        isClosable: true
      });
    }
    try {
      const accounts = await connectWallet();
      const name = candidateName;
      const party = candidateParty;
      const contract = initiateContract();
      await contract.methods.addCandidate(name, party).send({
        from: accounts[0],
        gas: 2000000,
        gasPrice: 2e10
      });
      setCandidateName('');
      setCandidateParty('');
      const intervalId = setInterval(async() => {
        const data = await getCandidates();
        if (JSON.stringify(data) !== JSON.stringify(candidates)) {
          setCandidates(data);
          clearInterval(intervalId);
        }
      }, 1000);
    } catch (err: any) {
      console.error(err.message);
      if (isTransactionError(err)) {
        Toast({
          title: err?.reason || err.message,
          status: 'error',
          isClosable: true
        });
      }
    }
  }

  async function vote(_candidateId: string|number) {
    if (_candidateId) {
      const contract = initiateContract();
      try {
        const accounts = await connectWallet();
        await contract.methods.vote(_candidateId).send({
          from: accounts[0],
          gas: 2000000,
          gasPrice: 2e10
        });
        const intervalId = setInterval(async() => {
          const data = await getCandidates();
          if (JSON.stringify(data) !== JSON.stringify(candidates)) {
            setCandidates(data);
            clearInterval(intervalId);
          }
        }, 1000);
      } catch (err: any) {
        console.error(err.message);
        if (isTransactionError(err)) {
          Toast({
            title: err?.reason || err.message,
            status: 'error',
            isClosable: true
          });
        }
      }
    }
  }

  async function getCandidate(_candidateId: string|number) {
    const contract = initiateContract();
    const candidate = await contract.methods.getCandidate(_candidateId).call();
    return candidate;
  }

  async function getCandidates() {
    const contract = initiateContract();
    const totalCandidate = await contract.methods.getCandidateTotal().call();
    const candidateIds = [];
    for (let i = 0; i < totalCandidate; i++) {
      candidateIds.push(i + 1);
    }
    const candidatesData = await Promise.all(candidateIds.map(getCandidate));
    return candidatesData;
  }

  useEffect(() => {
    const web3 = initiateWeb3();
    setIsWalletConnected((web3.currentProvider as any)?.isConnected());
    getCandidates().then(setCandidates);
  }, []);

  return (
    <div className="px-3 my-3">
      <div className="flex flex-col items-center justify-around">
        <Button
          className={`my-2 ${isWalletConnected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          colorScheme={isWalletConnected ? 'green' : 'blue'}
          disabled={isWalletConnected}
          onClick={!isWalletConnected ? handleConnectWallet : () => void 0}
        >
          {isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}
        </Button>
        {/* <Button
          className={`my-2 ${!isWalletConnected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          colorScheme="gray"
          disabled={!isWalletConnected}
          onClick={signMessage}
        >
          Simulate Sign Message
        </Button> */}
      </div>

      {/* Form Candidate */}
      <div className="mt-5 w-full">
        <Heading size="md" fontWeight="bold">Form Candidate</Heading>
        <InputGroup className="my-2">
          <InputLeftAddon children="Candidate Name" />
          <Input
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />
        </InputGroup>
        <InputGroup className="my-2">
          <InputLeftAddon children="Party Name" />
          <Input
            value={candidateParty}
            onChange={(e) => setCandidateParty(e.target.value)}
          />
        </InputGroup>
        <div className="w-full flex justify-end">
          <Button className="ml-auto text-right" colorScheme="blue" onClick={addCandidate}>Add Candidate</Button>
        </div>
      </div>

      <hr className="my-3" />

      {/** Candidate List */}
      <Card className="mt-5">
        <CardHeader className="pb-0">
          <Heading size="md" fontWeight="bold">Candidates</Heading>
        </CardHeader>
        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            {candidates.map((c) => (
              <Box key={c.id}>
                <Heading size="xs" textTransform="uppercase" fontWeight="bold">
                  ({c.id}) {c.name}
                </Heading>
                <Text pt="2" fontSize="sm" fontWeight="bold">
                  Party: {c.party}
                </Text>
                <Text pt="2" fontSize="xs">
                  Vote Count: {c.voteCount}
                </Text>
                <Button colorScheme="purple" className="w-full mt-3" onClick={() => vote(c.id)}>
                  Vote
                </Button>
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>

    </div>
  );
}

export default withMobileLayoutPage(Dashboard, {
  title: '(SDK Demo) Election Vote System'
});
