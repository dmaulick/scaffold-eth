const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My Dapp", function () {
  let externalContract;
  let stakerContract;

  describe("StakerContract", function () {
    it("Should deploy StakerContract", async function () {
      // Factories
      const externalContractFactory = await ethers.getContractFactory(
        "ExampleExternalContract"
      );
      const stakerContractFactory = await ethers.getContractFactory("Staker");

      // Deploy
      externalContract = await externalContractFactory.deploy();
      stakerContract = await stakerContractFactory.deploy(
        externalContract.address
      );

      const [owner, ...addrs] = await ethers.getSigners();

      console.log(
        "owner",
        owner.address,
        "addrs",
        addrs.map((it) => it.address)
      );

      console.log("externalContract.address", externalContract.address);
      console.log("stakerContract.address", stakerContract.address);
      // console.log(
      //   "passed address",
      //   stakerContract.exampleExternalContractAddress.address
      // );

      // Assert address of example smart contract
      // const externalAddress = await stakerContract
      //   .exampleExternalContractAddress.address;
      // expect(externalAddress).to.equal(externalContract);
    });

    // describe("stake()", function () {
    //   it("Should be able to set a new purpose", async function () {
    //     const newPurpose = "Test Purpose";

    //     await stakerContract.stake();
    //     expect(await myContract.purpose()).to.equal(newPurpose);
    //   });
    // });
  });
});
