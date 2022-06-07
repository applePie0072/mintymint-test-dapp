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
    await marketplace.addWhiteList(accounts[1]);
    await airplane1.mint('5');
    await airplane2.mint('5');
    await airplane3.mint('5');
    console.log(getAmount(1000), accounts[1]);
    await USDC.mint(accounts[0], getAmount(1000));
    await USDC.mint(accounts[1], getAmount(1000));
    console.log('minted');

    await airplane1.approve(marketplace.address, '1');
    await marketplace.listToken(airplane1.address, '1');
    console.log('listed');
  });

  it('Buy Token Success', async () => {
    const cost = await airplane1.cost.call();
    console.log('cost', cost.toString());

    await USDC.approve(marketplace.address, cost.toString(), {
      from: accounts[1],
    });
    console.log('approved from account 1');
    await marketplace.buyToken(airplane1.address, '1', { from: accounts[1] });
    console.log('bought');
    const newOwner = await airplane1.ownerOf('1');
    console.log('Buy Success');
    console.log('New owner is ', newOwner);
  });

  it('Buy Token Fail case 1:', async () => {
    const cost = await airplane1.cost.call();
    console.log('cost', cost.toString());

    await USDC.approve(marketplace.address, cost.toString(), {
      from: accounts[1],
    });
    console.log('approved from account 1');
    try {
      await marketplace.buyToken(airplane1.address, '2', { from: accounts[1] });
    } catch (err) {
      console.log('Buy failed because: ', err.message);
    }
  });

  it('Buy Token Fail case 2:', async () => {
    const cost = await airplane1.cost.call();
    console.log('cost', cost.toString());

    await USDC.approve(marketplace.address, cost.toString(), {
      from: accounts[0],
    });
    console.log('approved from account 0');
    try {
      await marketplace.buyToken(airplane1.address, '1', { from: accounts[0] });
    } catch (err) {
      console.log('Buy failed because: ', err.message);
    }
  });
});