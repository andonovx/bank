### CONTENT OF THE REPOSITORY

#./contracts contains the code of the contracts
#./tests contains the tests
#./migrations contains the migration script
#./truffle-config.js represents truffle's confiruation file
#./.secret file contains the seed phrase of the wallet the truffle is going to use
#./frontend contains the code for the dapp which can be used to interact with the smart contract

### PREREQUISITES

In order to compile the contracts using truffle, you must install Node.js, npm and Truffle.
Run npm install in order to install all the dependencies.
In order to run the tests locally you must install the Ganache or some other server that will set up a blockchain locally.
If you wish to deploy the contracts, paste your wallet seed phrase into './.secret' file. Be sure to have some ETH inside that wallet.
In order to run the frontend, you must have an http server installed, eg: Live Server extension for Visual Studio OR Python.

Details of wallets that posses ATRAC Rinkeby tokens, and thus can be used for testing the contracts are the following:

ADDRESS                                         ROLE                PRIVATE KEY                   
0x3d7A1592588212F949B4Aa9a2CFF44566143D0f4      ADMIN               fc37d758907b62f0d84329e87f1a237a3bd5168001ba284a9b340508cf4291d8
0x4CD8d1349B2bA7E941672FB7993a97940Eb59593      USER                3aaaccf19776699a11502fa972f517909f63fcc7df82362cf6651aa0583cc94e
0xB2BA3B8a08054F5c1525De7814ec7Ac78A3d0b81      USER                0b1d1b67eb98c9369c2667c34eb9bdfa67ff0627129855c2281414d5b54245c9

### CONTRACTS
Contracts are deployed to Rinkeby testnet and verified on Etherscan.

CONTRACT NAME           ADDRESS                                         ETHERSCAN LINK
BANK                    0x99Eb7a657382fF7050044B840Ec3e64d03040eB4      https://rinkeby.etherscan.io/address/0x99Eb7a657382fF7050044B840Ec3e64d03040eB4#code
ATRAC                   0x674c2f75414111997442F3e246ce32Ea9d978f80      https://rinkeby.etherscan.io/address/0x674c2f75414111997442F3e246ce32Ea9d978f80#code

The deferral period (or T as defined in the task's description) of the Bank contract is set to 24 hours. 

In case you wish to redeploy the contract in order to change the deferral period, paste the new Bank contract address into 'bankAddress' variable inside the './frontend/sc.js' file.

### COMPILING 

In order to compile the contracts, run the following command:
truffle compile

### RUNNING TESTS

In order to run the tests locally, run the following command:
truffle test

In the tests, the deferral (t) is set to 30 seconds.

### DEPLOYING

In order to deploy the contracts to the Rinkeby testnet, run the following command:
truffle migrate --network rinkeby

### USING THE DAPP 

In order to use the app, first put the contents of ./frontend on an http server.
Route of the /.frontend contents on the server should default to the index.html page.

In order to interact with the contracts (trigger transactions) you must connect your wallet, by clicking the connect button in the upper-right corner. MetaMask and WalletConnect-compatible wallets are supported. I provided my Infura endpoint so the dapp is able to read data from the contract even when no wallet is connected.

The 'home' page gives insight into details of the Bank contract: balances of the reward pools, deposit count and sum of all deposits that are currently staked on the contract.

Via the 'deposit' page, you may deposit your ATRAC tokens (during the deposit period).

Via the 'withdraw' page, you may withdraw tokens you have staked (during the deposit period, and after the lock period).

Via the 'pool top up' page, using the administrator wallet, you may top up the reward pool (until withdraw period has begun).

Via the 'withdraw admin' page, using the administrator wallet, you may withdraw the remaining money from the reward pools (if any), once all users have withdrawn their deposits and rewards.
