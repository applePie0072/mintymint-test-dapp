const ethers = require('ethers');
var Airplane = artifacts.require('Airplane.sol');
var XYZToken = artifacts.require('XYZToken.sol');
var Marketplace = artifacts.require('marketplace.sol');

require('chai').use(require('chai-as-promised')).should();

const getAmount = (_amount) => {
  return ethers.utils.parseUnits(_amount.toString(), 'ether').toString();
};

contract('Marketplace', (accounts) => {
  let airplane1;
  let airplane2;
  let airplane3;
  let USDC;
  let marketplace;

  before(async () => {
    airplane1 = await Airplane.new('SeaPlane', 'SeaPlane', '/seaplane/', '');
    airplane2 = await Airplane.new('Boeing 747', 'Boeing', '/boeing/', '');
    airplane3 = await Airplane.new('Airbus', 'Airbus', '/airbus', '');
    USDC = await XYZToken.deployed();
    marketplace = await Marketplace.new(USDC.address);
    console.log('deployed');
    await airplane1.mint('5');
    await airplane2.mint('5');
    await airplane3.mint('5');
    console.log(getAmount(1000), accounts[1]);
    await USDC.mint(accounts[0], getAmount(1000));
    await USDC.mint(accounts[1], getAmount(1000));
    console.log('minted');
  });

  it('NFT listing', async () => {
    // await USDC.approve(marketplace.address, '1000000000000000000000000000000');
    await airplane1.approve(marketplace.address, '1');
    await marketplace.listToken(airplane1.address, '1');
    console.log('listed');
    const listItem = await marketplace.getTokenListing(airplane1.address, '1');
    const num = await marketplace.numOfTokenListings(airplane1.address);
    console.log('listItem', listItem, num);

    const owner = await airplane1.ownerOf('1');
    console.log('owner of 1', owner);
    const cost = await airplane1.cost.call();
    console.log(cost);

    await USDC.approve(marketplace.address, cost.toString(), {
      from: accounts[1],
    });
    console.log('approved from account 1');
    await marketplace.buyToken(airplane1.address, '1', { from: accounts[1] });
    console.log('bought');
    const newOwner = await airplane1.ownerOf('1');
    console.log('new owner of 1', newOwner);
  });
});
