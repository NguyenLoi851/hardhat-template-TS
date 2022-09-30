import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"
import { ethers } from "hardhat"
import { Lock, Lock__factory } from "../typechain-types"

describe("Contract", ()=>{
    async function deployFixture(){
        let deployer: SignerWithAddress
        let lockContract: Lock

        [deployer] = await ethers.getSigners();
        lockContract = await new Lock__factory(deployer).deploy(BigNumber.from('1'+'0'.repeat(18)))

        return {deployer, lockContract}
    }

    it("Should run", async()=>{
        const {deployer, lockContract} = await loadFixture(deployFixture)
        console.log(deployer.address);
        console.log(lockContract.address);
        
    })
})