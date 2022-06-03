# MarketplaceTest

# truffle run

Please turn on new terminal
`` truffle develop

Then you will see a development panel like this "truffle(develop)>"

- you can see account addresses and private keys. Please import them(at least first 2 accounts) on metamask
  And then change metamask network to localhost:8545
  On this panel
- you can test solidity file by
  `` test
- please deploy to local private network contracts by
  `compile` migrate
- you can see contract addresses(Three airplanes, XYZToken(will call it as USDC), Marketplace)
  Please copy these addresses and paste into client/src/contracts/tokens.js

  ex.
  export const NFTContracts = [
  '0x21A324498447c54eEaF7CBe21E370a5362927DD9', // airplane 1 address
  '0xD466eD337f90efaE4357Ee3596D45b5DD4cD3c17', // airplane 2 address
  '0x20073c68F6a1007428F34176CA50dF43BF522b1A', // airplane 3 address
  ];

      export const USDC = {
        address: '0x692e8E033Fd2084B6590df3722C849C3ee69EF2f',  // XYZ token address
        decimals: 18,
      };

      export const marketplaceAddress = '0x5873eE991A8CFc22000115255DeF4021F8EEa138'; // marketplace address

And then you can go to dpp now

# dapp

Please turn on new terminal

`cd client` npm install
`` npm start

There are three pages on this dapp for this test step.

- / : marketplace page . You can see listed items (for sale)
- /collection/:address (This address is just Airplane contract address). You can list and burn, remove, and so on.
  And you can mint with admin account(account 0).

  Please take care that you can mint only 5 airplanes at once.
  And you can mint with account 0 (This is owner wallet)

- /get-usdc: You can get USDC coin here. I made this part because I worked on local network. On Real network, we can use USDC coin and will remove this page.

- /add-whitelist: You can add whitelist account on this page

# contract

- XYZToken.sol: It is just local USDC coin, so when we work on mainnet(Ethereum, Polygon, ...) no need this part.
- Airplane.sol: This is security Token for airplane. This contract has some attributes what you want.
  Total supply, cost per token, name, symbol and so on. And it is supporting burning part.
- Marketplace.sol: This contract is using for list/buy/sell airplane with USDC coin.
