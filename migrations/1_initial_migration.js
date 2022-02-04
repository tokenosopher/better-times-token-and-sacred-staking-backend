const Migrations = artifacts.require("Migrations");

var publicChains = ['ethereum_live', 'ethereum_live-fork', 'development'];

module.exports = function (deployer, network) {
  console.log(network);
  if(publicChains.includes(network)) {
    return; //We don't want a Migrations contract on the mainnet, don't waste gas.
  }
  deployer.deploy(Migrations);
};
