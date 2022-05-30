// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

// const sleep = (ms) =>
//   new Promise((r) =>
//     setTimeout(() => {
//       console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
//       r();
//     }, ms)
//   );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // TODO: implement better way of handling chainId and contract addresses
  let gtcAddress = "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f";

  gtcAddress =
    chainId === "10"
      ? "0x1EBA7a6a72c894026Cd654AC5CDCF83A46445B08"
      : gtcAddress;

  console.log("chainId:", chainId);

  if (chainId !== "1" || chainId !== "10") {
    console.log("Not on Ethereum Mainnet or Optimism");
    const tokenDeployment = await deploy("GTC", {
      // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
      from: deployer,
      /*args: [ "0x18fFE4dADcCe63A074Ef9cfe327cAb9AD4Ad9f76" ],*/
      log: true,
    });

    // Getting a previously deployed contract
    const GTC = await ethers.getContract("GTC", deployer);

    console.log("Sending GTC...");

    const tx1 = await GTC.transfer(
      "0x523d007855B3543797E0d3D462CB44B601274819", // salatti.eth
      ethers.utils.parseEther("1000")
    );
    await tx1.wait();

    const tx2 = await GTC.transfer(
      "0x3045313ad5d09035C69dA75E59a163c754D1b442", // second address
      ethers.utils.parseEther("10")
    );
    await tx2;

    const tx3 = await GTC.transfer(
      "0x34aA3F359A9D614239015126635CE7732c18fDF3", // atg.eth
      ethers.utils.parseEther("1000")
    );
    await tx3.wait();

    const tx4 = await GTC.transfer(
      "0x00de4b13153673bcae2616b67bf822500d325fc3", // owocki.eth
      ethers.utils.parseEther("1000")
    );
    await tx4.wait();

    console.log("GTC address is", GTC.address);
    gtcAddress = GTC.address;
  }

  await deploy("GTCStaking", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [gtcAddress],
    log: true,
  });

  // Getting a previously deployed contract
  // const YourContract = await ethers.getContract("YourContract", deployer);
  /*

    To take ownership of yourContract using the ownable library uncomment next line and add the
    address you want to be the owner.
    // await yourContract.transferOwnership(YOUR_ADDRESS_HERE);

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  // Verify from the command line by running `yarn verify`

  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  // try {
  //   if (chainId !== localChainId) {
  //     await run("verify:verify", {
  //       address: YourContract.address,
  //       contract: "contracts/YourContract.sol:YourContract",
  //       contractArguments: [],
  //     });
  //   }
  // } catch (error) {
  //   console.error(error);
  // }
};
module.exports.tags = ["GTCStaking"];
