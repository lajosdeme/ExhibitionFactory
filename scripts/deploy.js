const hre = require("hardhat");

async function main() {
    const ImplementationConsumer = await hre.ethers.getContractFactory("ExhibitionConsumer");
    const implementationConsumer = await ImplementationConsumer.deploy();
    await implementationConsumer.deployed();

    console.log("Consumer master contract deployed at: ", implementationConsumer.address);

    const ImplementationExhibition = await hre.ethers.getContractFactory("Exhibition");
    const implementationExhibition = await ImplementationExhibition.deploy();
    await implementationExhibition.deployed();

    console.log("Exhibition master contract deployed at: ", implementationExhibition.address);

    const Factory = await hre.ethers.getContractFactory("ExhibitionFactory");
    const factory = await Factory.deploy(implementationConsumer.address, implementationExhibition.address);

    await factory.deployed();

    console.log("Exhibition Factory deployed at: ", factory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
