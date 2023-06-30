import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { Escrow } from "../typechain-types/contracts/escrow/Escrow"
import { Escrow__factory } from "../typechain-types/factories/contracts/escrow/Escrow__factory"

import { EscrowToken } from "../typechain-types/contracts/escrow/EscrowToken"
import { EscrowToken__factory } from "../typechain-types/factories/contracts/escrow/EscrowToken__factory"
import { BigNumber } from "ethers"
import { parseUnits } from "ethers/lib/utils"
import { expect } from "chai"

describe("Escrow",()=>{
    async function deployFixture() {
        let deployer: SignerWithAddress
        let user1: SignerWithAddress
        let user2: SignerWithAddress
        let escrow: Escrow
        let escrowToken1: EscrowToken
        let escrowToken2: EscrowToken

        [deployer, user1, user2] = await ethers.getSigners()
        escrow = await new Escrow__factory(deployer).deploy()
        escrowToken1 = await new EscrowToken__factory(deployer).deploy("Token1","TK1")
        escrowToken2 = await new EscrowToken__factory(deployer).deploy("Token2","TK2")

        return {deployer, user1, user2, escrow, escrowToken1, escrowToken2}
    }

    it("Should run", async() => {
        // user1: 20 TK1 - user2: 30 TK2
        const {deployer, user1, user2, escrow, escrowToken1, escrowToken2} = await loadFixture(deployFixture)
        await escrowToken1.mint(user1.address, parseUnits("100", 18))
        await escrowToken2.mint(user2.address, parseUnits("100", 18))

        await escrowToken1.connect(user1).approve(escrow.address, parseUnits("20", 18))
        const deadline1 = BigNumber.from((Date.now()/1000).toFixed()).add(3*24*60*60)
        await escrow.connect(user1).initEscrowItem(
            escrowToken1.address, escrowToken2.address,
            parseUnits("20", 18), parseUnits("30", 18),
            deadline1
        )

        let fetchEscrowItem0 = await escrow.escrowItemList(0)
        expect(fetchEscrowItem0.owner).to.be.equal(user1.address)
        expect(fetchEscrowItem0.token1).to.be.equal(escrowToken1.address)
        expect(fetchEscrowItem0.token2).to.be.equal(escrowToken2.address)
        expect(fetchEscrowItem0.amount1).to.be.equal(await escrowToken1.allowance(user1.address, escrow.address))
        expect(fetchEscrowItem0.amount2).to.be.equal(parseUnits("30", 18))
        expect(fetchEscrowItem0.executed).to.be.false
        expect(fetchEscrowItem0.canceled).to.be.false

        await escrowToken2.connect(user2).approve(escrow.address, parseUnits("30", 18))
        await escrow.connect(user2).executeEscrow(0, parseUnits("20", 18))

        fetchEscrowItem0 = await escrow.escrowItemList(0)
        expect(fetchEscrowItem0.executed).to.be.true
        expect(await escrowToken1.balanceOf(user1.address)).to.be.equal(parseUnits("80", 18))
        expect(await escrowToken1.balanceOf(user2.address)).to.be.equal(parseUnits("20", 18))
        expect(await escrowToken2.balanceOf(user1.address)).to.be.equal(parseUnits("30", 18))
        expect(await escrowToken2.balanceOf(user2.address)).to.be.equal(parseUnits("70", 18))

        // user1: 50 TK1 - user2: 40 TK2
        await escrowToken1.connect(user1).transfer(escrow.address, parseUnits("50", 18))

        await escrow.connect(user1).initEscrowItem(
            escrowToken1.address, escrowToken2.address,
            parseUnits("50", 18), parseUnits("40", 18),
            deadline1
        )

        await escrowToken2.connect(user2).transfer(escrow.address, parseUnits("40", 18))

        let fetchEscrowItem1 = await escrow.escrowItemList(1)
        expect(fetchEscrowItem1.owner).to.be.equal(user1.address)
        expect(fetchEscrowItem1.token1).to.be.equal(escrowToken1.address)
        expect(fetchEscrowItem1.token2).to.be.equal(escrowToken2.address)

        await escrow.connect(user2).executeEscrow2(1, parseUnits("50", 18))

        fetchEscrowItem1 = await escrow.escrowItemList(1)
        expect(fetchEscrowItem1.executed).to.be.true
        expect(await escrowToken1.balanceOf(user1.address)).to.be.equal(parseUnits("30", 18))
        expect(await escrowToken1.balanceOf(user2.address)).to.be.equal(parseUnits("70", 18))
        expect(await escrowToken2.balanceOf(user1.address)).to.be.equal(parseUnits("70", 18))
        expect(await escrowToken2.balanceOf(user2.address)).to.be.equal(parseUnits("30", 18))
    })
})