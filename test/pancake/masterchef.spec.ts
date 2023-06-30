import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { CakeToken__factory } from "../../typechain-types/factories/contracts/pancake/CakeToken__factory"
import { CakeToken } from "../../typechain-types/contracts/pancake/CakeToken"
import { SyrupBar } from "../../typechain-types/contracts/pancake/SyrupBar"
import { SyrupBar__factory } from "../../typechain-types/factories/contracts/pancake/SyrupBar__factory"
import { MasterChef } from "../../typechain-types/contracts/pancake/MasterChef"
import { MasterChef__factory } from "../../typechain-types/factories/contracts/pancake/MasterChef__factory"
import { BigNumber, providers } from "ethers"
import { parseUnits } from "ethers/lib/utils"
import { time, mine, } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { MockERC20 } from "../../typechain-types/contracts/pancake/MockERC20"
import { MockERC20__factory } from "../../typechain-types/factories/contracts/pancake/MockERC20__factory"

describe("Masterchef", ()=>{

    type PoolInfo = {
        lpToken: string
        allocPoint: BigNumber
        lastRewardBlock: BigNumber
        accCakePerShare: BigNumber
    }

    async function deployFixture(){
        let owner: SignerWithAddress
        let dev: SignerWithAddress
        let users: SignerWithAddress[]
        let cake: CakeToken
        let syrupBar: SyrupBar
        let masterChef: MasterChef
        let provider = ethers.getDefaultProvider();
        let multiplier: BigNumber
        let poolInfo: PoolInfo[]
        let token1: MockERC20
        let token2: MockERC20

        [owner, dev, ...users] = await ethers.getSigners()
        cake = await new CakeToken__factory(owner).deploy()
        syrupBar = await new SyrupBar__factory(owner).deploy(cake.address)
        const startBlock = (await provider.getBlockNumber()) + 10
        masterChef = await new MasterChef__factory(owner).deploy(cake.address, syrupBar.address, dev.address, parseUnits("10", 18), startBlock)

        token1 = await new MockERC20__factory(owner).deploy("Token1", "TK1")
        token2 = await new MockERC20__factory(owner).deploy("Token2", "TK2")

        poolInfo = [
            {
                lpToken: token1.address,
                allocPoint: BigNumber.from("800"),
                lastRewardBlock: BigNumber.from("0"),
                accCakePerShare: BigNumber.from("0")
            },
            {
                lpToken: token2.address,
                allocPoint: BigNumber.from("500"),
                lastRewardBlock: BigNumber.from("0"),
                accCakePerShare: BigNumber.from("0")
            }
        ]

        multiplier = BigNumber.from("10")
        return {owner, dev, users, cake, syrupBar, masterChef, provider, multiplier, poolInfo}
    }

    it("Should run", async()=>{
        const {owner, dev, users, cake, syrupBar, masterChef, provider, multiplier, poolInfo} = await loadFixture(deployFixture)
        expect(await masterChef.poolLength()).to.be.equal(1)
        expect((await masterChef.poolInfo(0)).lpToken).to.be.equal(cake.address)
        expect((await masterChef.poolInfo(0)).allocPoint).to.be.equal(BigNumber.from("1000"))

        // set multiplier
        await masterChef.connect(owner).updateMultiplier(multiplier)
        expect(await masterChef.BONUS_MULTIPLIER()).to.be.equal(multiplier)

        // add first lp token
        await masterChef.connect(owner).add(poolInfo[0].allocPoint, poolInfo[0].lpToken, false)
        
        // add second lp token
        await masterChef.connect(owner).add(poolInfo[0].allocPoint, poolInfo[0].lpToken, true)

    })
})