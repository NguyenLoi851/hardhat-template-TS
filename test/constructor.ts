// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
// import { ethers } from "hardhat"
// import { Constructor__factory } from "../typechain-types/factories/contracts/estimateGas/Constructor__factory"
// import { Constructor } from "../typechain-types/contracts/estimateGas/Constructor"
// import { BigNumberish } from "ethers"
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

// describe("Constructor", ()=>{
//     async function deployFixture(){
//         let deployer: SignerWithAddress
//         let constructorSc: Constructor
//         [deployer] = await ethers.getSigners();

//         let LENGTH = 12
//         let paymentDates: BigNumberish[] = new Array(LENGTH)
//         for(var i = 0;i<paymentDates.length;i++) { 
//             paymentDates[i] = i
//         }
//         constructorSc = await new Constructor__factory(deployer).deploy(paymentDates)

//         return {deployer, paymentDates, constructorSc, LENGTH}
//     }

//     it("Should run with 12 elements", async()=>{
//         const {constructorSc, LENGTH} = await loadFixture(deployFixture)
//         for(var i = 0;i<LENGTH;i++) {
//             console.log(await constructorSc.paymentDates(i))
//         }
//     })
// })

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { Constructor__factory } from "../typechain-types/factories/contracts/estimateGas/Constructor__factory"
import { Constructor } from "../typechain-types/contracts/estimateGas/Constructor"
import { BigNumberish } from "ethers"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

describe("Constructor", () => {
    async function deployFixture() {
        let deployer: SignerWithAddress
        let constructorSc: Constructor
        [deployer] = await ethers.getSigners();

        let ROW_LENGTH = 12
        let COL_LENGTH = 3
        let paymentDates: BigNumberish[][] = []
        for (let i = 0; i < ROW_LENGTH; i++) {
            paymentDates[i] = [];
            for (let j = 0; j < COL_LENGTH; j++) {
                paymentDates[i][j] = i + j;
            }
        }
        constructorSc = await new Constructor__factory(deployer).deploy(paymentDates)

        return { deployer, paymentDates, constructorSc, ROW_LENGTH, COL_LENGTH }
    }

    it("Should run with 12 elements", async () => {
        const { constructorSc, ROW_LENGTH, COL_LENGTH } = await loadFixture(deployFixture)
        for (let i = 0; i < ROW_LENGTH; i++) {
            for (let j = 0; j < COL_LENGTH; j++) {
                console.log(await constructorSc.paymentDates(i, j))
            }
        }
    })
})