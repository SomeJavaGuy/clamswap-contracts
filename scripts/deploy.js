async function main() {
  const accounts = await ethers.getSigners();
	const adminAddress = accounts[0].address;
	const devAddress = accounts[1].address;
	const feeAddress = accounts[2].address;
  const minimum_delay = 6 * 60 * 60;
  const clamPerBlock = 100;
  const startBlock = 1;

  const ClamToken = await ethers.getContractFactory("ClamToken");
  const clamToken = await ClamToken.deploy();
  console.log("ClamToken deployed to:", clamToken.address);

  const Pearl = await ethers.getContractFactory("Pearl");
  const pearl = await Pearl.deploy(clamToken.address);
  console.log("Pearl deployed to:", pearl.address);

  const MasterChef = await ethers.getContractFactory("MasterChef");
  const masterChef = await MasterChef.deploy(clamToken.address, pearl.address, devAddress, feeAddress, clamPerBlock, startBlock);
  console.log("MasterChef deployed to:", masterChef.address);

  const Timelock = await ethers.getContractFactory("Timelock");
  const timelock = await Timelock.deploy(adminAddress, minimum_delay);
  console.log("Timelock deployed to:", timelock.address);

  const Multicall = await ethers.getContractFactory("Multicall");
  const multicall = await Multicall.deploy();
  console.log("Multicall deployed to:", multicall.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
