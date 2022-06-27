const Bank = artifacts.require("Bank");
const ATRAC = artifacts.require("ATRAC");

const deferral = 24 * 3600;

module.exports = async function (deployer) {

  await deployer.deploy(ATRAC, 70000000000000000n);
  
  let tokenAddress = (await ATRAC.deployed()).address;
  
  await deployer.deploy(Bank, deferral, tokenAddress);
  
};

//let tokenAddress = "0x674c2f75414111997442F3e246ce32Ea9d978f80";