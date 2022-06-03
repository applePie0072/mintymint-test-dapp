var Airplane = artifacts.require('Airplane.sol');
var XYZToken = artifacts.require('XYZToken.sol');
var marketplace = artifacts.require('marketplace.sol');

module.exports = async function (deployer) {
  deployer.deploy(Airplane, 'SeaPlane', 'SeaPlane', '/seaplane/', '');
  deployer.deploy(Airplane, 'Boeing 747', 'Boeing', '/boeing/', '');
  deployer.deploy(Airplane, 'Airbus', 'Airbus', '/airbus', '');
  await deployer.deploy(XYZToken);
  await deployer.deploy(marketplace, XYZToken.address);
};
