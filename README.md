# 🏗 Scaffold-ETH

## Mainnet

```bash
% yarn deploy --network mainnet
yarn run v1.22.15
$ yarn workspace @scaffold-eth/hardhat deploy --network mainnet
$ hardhat deploy --export-all ../react-app/src/contracts/hardhat_contracts.json --network mainnet
Nothing to compile
chainId: 1
deploying "GTCStaking" (tx: 0x6e216e10215a4d505ab622e2cc81df9e3a45c8d77f22368f4e73ded745c13538)...: deployed at 0x195acfcF9f06e43410a3ad177665F358E659cDA6 with 880762 gas
$ hardhat run scripts/publish.js
✅  Published contracts to the subgraph package.
✨  Done in 18.08s.
```

Verified [here on Etherscan](https://etherscan.io/address/0x195acfcF9f06e43410a3ad177665F358E659cDA6#code)

Mainnet subgraph: https://thegraph.com/studio/subgraph/gtc-conviction-voting-mainnet/

Temporary query URL: https://api.studio.thegraph.com/query/20308/gtc-conviction-voting-mainnet/v0.0.2

The permanent query URL is: https://gateway.thegraph.com/api/[api-key]/subgraphs/id/27N5qfvJ7eRS3aD2yWs9ey8FEffd3Ssow8aUM3Q3wdbF

## Optimism

```bash
% yarn deploy --network optimism
yarn run v1.22.15
$ yarn workspace @scaffold-eth/hardhat deploy --network optimism
$ hardhat deploy --export-all ../react-app/src/contracts/hardhat_contracts.json --network optimism
Nothing to compile
chainId: 10
deploying "GTCStaking" (tx: 0xd4156fec20b7314c93e83b6e39a06db28635e4040f4d06dc1ffefa364c123db3)...: deployed at 0xbBb02E07bd83947e920D746b25a067B9424537b7 with 880762 gas
$ hardhat run scripts/publish.js
✅  Published contracts to the subgraph package.
✨  Done in 7.19s.
```

Verified [here on Etherscan](https://optimistic.etherscan.io/address/0xbBb02E07bd83947e920D746b25a067B9424537b7#code)

The graph endpoint:
https://api.thegraph.com/subgraphs/name/danielesalatti/gtc-conviction-voting-optimism

## Rinkeby

```bash
% yarn deploy --network rinkeby
yarn run v1.22.15
$ yarn workspace @scaffold-eth/hardhat deploy --network rinkeby
$ hardhat deploy --export-all ../react-app/src/contracts/hardhat_contracts.json --network rinkeby
Compiling 6 files with 0.8.4
Compilation finished successfully
chainId: 4
Not on mainnet
reusing "GTC" at 0x67775cBe9e73aa255Fc8e6A992Ed340e3b28D926
Sending GTC...
GTC address is 0x67775cBe9e73aa255Fc8e6A992Ed340e3b28D926
deploying "GTCStaking" (tx: 0xc35f94a47a9a00d63f418328d471e8f396b02eb2b3d5e5311650d5812954a570)...: deployed at 0x51250297F56779a86B15046bEf38f75Fa05266ba with 880762 gas
$ hardhat run scripts/publish.js
✅  Published contracts to the subgraph package.
✨  Done in 61.68s.
```

Local subgraph endpoint:
http://localhost:8000/subgraphs/name/gtc-conviction-subgraph-eth

On the graph:
https://api.thegraph.com/subgraphs/name/danielesalatti/gtc-conviction-voting-rinkeby

## Subgraph raw notes

1. Clean up previous data: `yarn clean-graph-node`
2. Spin up a local graph node by running: `yarn run-graph-node`
3. Create your local subgraph by running: `yarn graph-create-local` <= this is only required once
4. Deploy your local subgraph by running: `yarn graph-ship-local`
5. Edit your local subgraph in packages/subgraph/src
6. Deploy your contracts and your subgraph in one go by running: `yarn deploy-and-graph`

### Sample GraphQL Queries

```graphql
query getVoterById {
  voter(id: "0x523d007855b3543797e0d3d462cb44b601274819") {
    id
  }
}

query getRunningRecordsByVoterId {
  runningVoteRecords(
    where: { voter: "0x523d007855b3543797e0d3d462cb44b601274819" }
  ) {
    id
    voter {
      id
    }
    votes {
      id
      voteId
    }
    grantId
    voteCount
    totalStaked
    createdAt
    updatedAt
  }
}

query getVotesByVoterId {
  votes(where: { voter: "0x523d007855b3543797e0d3d462cb44b601274819" }) {
    id
    voteId
    voter {
      id
    }
    amount
    grantId
    createdAt
  }
}

query getVotesByGrantId {
  votes(where: { grantId: 2062 }) {
    id
    voteId
    voter {
      id
    }
    amount
    grantId
    createdAt
  }
}

query getRunningRecordsByGrantId {
  runningVoteRecords(where: { grantId: 2062 }) {
    id
    voter {
      id
    }
    grantId
    voteCount
    totalStaked
    createdAt
    updatedAt
  }
}

query getReleasesByVoterId {
  releases(where: { voter: "0x523d007855b3543797e0d3d462cb44b601274819" }) {
    id
    voter {
      id
    }
    voteId
    amount
    createdAt
  }
}

query getReleases {
  releases {
    id
    voter {
      id
    }
    voteId
    amount
    createdAt
  }
}
```

> everything you need to build on Ethereum! 🚀

🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd scaffold-eth
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd scaffold-eth
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)

# 🍦 Other Flavors

- [scaffold-eth-typescript](https://github.com/scaffold-eth/scaffold-eth-typescript)
- [scaffold-nextjs](https://github.com/scaffold-eth/scaffold-eth/tree/scaffold-nextjs)
- [scaffold-chakra](https://github.com/scaffold-eth/scaffold-eth/tree/chakra-ui)
- [eth-hooks](https://github.com/scaffold-eth/eth-hooks)
- [eth-components](https://github.com/scaffold-eth/eth-components)
- [scaffold-eth-expo](https://github.com/scaffold-eth/scaffold-eth-expo)

# 🔭 Learning Solidity

📕 Read the docs: https://docs.soliditylang.org

📚 Go through each topic from [solidity by example](https://solidity-by-example.org) editing `YourContract.sol` in **🏗 scaffold-eth**

- [Primitive Data Types](https://solidity-by-example.org/primitives/)
- [Mappings](https://solidity-by-example.org/mapping/)
- [Structs](https://solidity-by-example.org/structs/)
- [Modifiers](https://solidity-by-example.org/function-modifier/)
- [Events](https://solidity-by-example.org/events/)
- [Inheritance](https://solidity-by-example.org/inheritance/)
- [Payable](https://solidity-by-example.org/payable/)
- [Fallback](https://solidity-by-example.org/fallback/)

📧 Learn the [Solidity globals and units](https://docs.soliditylang.org/en/latest/units-and-global-variables.html)

# 🛠 Buidl

Check out all the [active branches](https://github.com/scaffold-eth/scaffold-eth/branches/active), [open issues](https://github.com/scaffold-eth/scaffold-eth/issues), and join/fund the 🏰 [BuidlGuidl](https://BuidlGuidl.com)!

- 🚤 [Follow the full Ethereum Speed Run](https://medium.com/@austin_48503/%EF%B8%8Fethereum-dev-speed-run-bd72bcba6a4c)

- 🎟 [Create your first NFT](https://github.com/scaffold-eth/scaffold-eth/tree/simple-nft-example)
- 🥩 [Build a staking smart contract](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-1-decentralized-staking)
- 🏵 [Deploy a token and vendor](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-2-token-vendor)
- 🎫 [Extend the NFT example to make a "buyer mints" marketplace](https://github.com/scaffold-eth/scaffold-eth/tree/buyer-mints-nft)
- 🎲 [Learn about commit/reveal](https://github.com/scaffold-eth/scaffold-eth-examples/tree/commit-reveal-with-frontend)
- ✍️ [Learn how ecrecover works](https://github.com/scaffold-eth/scaffold-eth-examples/tree/signature-recover)
- 👩‍👩‍👧‍👧 [Build a multi-sig that uses off-chain signatures](https://github.com/scaffold-eth/scaffold-eth/tree/meta-multi-sig)
- ⏳ [Extend the multi-sig to stream ETH](https://github.com/scaffold-eth/scaffold-eth/tree/streaming-meta-multi-sig)
- ⚖️ [Learn how a simple DEX works](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90)
- 🦍 [Ape into learning!](https://github.com/scaffold-eth/scaffold-eth/tree/aave-ape)

# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# 🏃💨 Speedrun Ethereum

Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

### Automated with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/scaffold-eth/scaffold-eth)
