/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

let mnemonic = process.env.MNEMONIC;

module.exports = {
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    mainnetFork: {
      url: "http://127.0.0.1:8545",
      accounts: mnemonic ? { mnemonic } : undefined,
      default_balance_ether: 10000000000,
      total_accounts: 10,
      gasLimit: 20000000,
      fork: `https://bsc-dataseed.binance.org/ `,
      timeout: 200000000,
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s2.binance.org:8545/", // https://docs.binance.org/smart-chain/developer/rpc.html
      chainId: 97,
      gasPrice: 20000000000,
      accounts: mnemonic ? { mnemonic } : undefined,
      timeout: 200000000,
    },
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 10000000000,
      accounts: mnemonic ? { mnemonic } : undefined,
      timeout: 200000000,
    },
  },
};
