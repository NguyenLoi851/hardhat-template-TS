import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { PoolStaking } from "../typechain-types/contracts/staking/PoolStaking";
import { PoolStaking__factory } from "../typechain-types/factories/contracts/staking/PoolStaking__factory";

describe("Pool Staking", () => {
  async function deployFixture() {
    let deployer: SignerWithAddress;
    let poolStaking: PoolStaking
    [deployer] = await ethers.getSigners();
    // poolStaking = await new PoolStaking__factory(deployer).deploy();
    return { deployer };
  }
  it("Should deploy successfully", async () => {
    const { deployer } = await loadFixture(deployFixture);
    console.log(deployer.address);
  });
});
