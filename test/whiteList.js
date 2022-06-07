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
    await USDC.mint(accounts[0], getAmount(1000));
    await USDC.mint(accounts[1], getAmount(1000));
    console.log('minted');
  });

  it('add whiteList', async () => {
    await marketplace.addWhiteList(accounts[1]);
    console.log('white list success');
  });

  it('listing fail because of whitelist', async () => {
    try {
      await marketplace.listToken(airplane1.address, '10', {
        from: accounts[2],
      });
    } catch (err) {
      console.log('Listing failed because: ', err.message);
    }
  });
});