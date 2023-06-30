import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"

import { PoolTokens } from "../../typechain-types/contracts/goldfinch-v2.0/protocol/core/PoolTokens"
import { PoolTokens__factory } from "../../typechain-types/factories/contracts/goldfinch-v2.0/protocol/core/PoolTokens__factory"

import { GoldfinchConfig } from "../../typechain-types/contracts/goldfinch-v2.0/protocol/core/GoldfinchConfig"
import { GoldfinchConfig__factory } from "../../typechain-types/factories/contracts/goldfinch-v2.0/protocol/core/GoldfinchConfig__factory"

import { Borrower } from "../../typechain-types/contracts/goldfinch-v2.0/protocol/periphery/Borrower"
import { Borrower__factory } from "../../typechain-types/factories/contracts/goldfinch-v2.0/protocol/periphery/Borrower__factory"

import { CreditLine } from "../../typechain-types/contracts/goldfinch-v2.0/protocol/core/CreditLine"
import { CreditLine__factory, CreditLineLibraryAddresses } from "../../typechain-types/factories/contracts/goldfinch-v2.0/protocol/core/CreditLine__factory"

import { TranchedPool } from "../../typechain-types/contracts/goldfinch-v2.0/protocol/core/TranchedPool"
import { TranchedPool__factory } from "../../typechain-types/factories/contracts/goldfinch-v2.0/protocol/core/TranchedPool__factory"

import { Accountant } from "../../typechain-types/contracts/goldfinch-v2.0/protocol/core/Accountant"
import { Accountant__factory } from "../../typechain-types/factories/contracts/goldfinch-v2.0/protocol/core/Accountant__factory"

import { GoldfinchFactory } from "../../typechain-types/contracts/goldfinch-v2.0/protocol/core/GoldfinchFactory"
import { GoldfinchFactory__factory } from "../../typechain-types/factories/contracts/goldfinch-v2.0/protocol/core/GoldfinchFactory__factory"
import { BigNumber } from "ethers"
import { parseUnits } from "ethers/lib/utils"

import { ERC20Token } from "../../typechain-types/contracts/goldfinch-v2.0/test/ERC20Token"
import { ERC20Token__factory } from "../../typechain-types/factories/contracts/goldfinch-v2.0/test/ERC20Token__factory"

import { OneSplitAudit } from "../../typechain-types/contracts/goldfinch-v2.0/test/OneInch.sol"
import { OneSplitAudit__factory } from "../../typechain-types/factories/contracts/goldfinch-v2.0/test/OneInch.sol"

describe("Goldfinch-v2.0", () => {

    type PoolInfo = {
        borrower: string
        juniorFeePercent: BigNumber
        limit: BigNumber
        interestApr: BigNumber
        paymentPeriodInDays: BigNumber
        termInDays: BigNumber
        lateFeeApr: BigNumber
    }

    type USDCBalanceInit = {
        owner: string,
        balances: BigNumber
    }

    enum Tranches { Reserved, Senior, Junior }


    async function deployFixture() {
        const logSpace = "\n=========================================\n"
        const zeroAddress = '0x' + '0'.repeat(40)
        let poolInfo: PoolInfo[]
        let deployer: SignerWithAddress
        let owner: SignerWithAddress
        let protocolAdmin: SignerWithAddress
        let borrower1: SignerWithAddress
        let backer1: SignerWithAddress
        let lper1: SignerWithAddress
        let lper2: SignerWithAddress
        let lper3: SignerWithAddress

        let goldfinchConfig: GoldfinchConfig
        let poolTokens: PoolTokens
        let creditLineImplementation: CreditLine
        let tranchedPoolImplementation: TranchedPool
        let borrowerImplementation: Borrower
        let accountant: Accountant
        let goldfinchFactory: GoldfinchFactory
        let USDC: ERC20Token
        let oneInch: OneSplitAudit
        let usdcBalanceInit: USDCBalanceInit[]
        let usdcDecimal: BigNumber

        [deployer, protocolAdmin, owner, borrower1, backer1, lper1, lper2, lper3] = await ethers.getSigners()

        usdcDecimal = BigNumber.from("6")
        USDC = await new ERC20Token__factory(deployer).deploy("USD Coin", "USDC", usdcDecimal)
        goldfinchConfig = await new GoldfinchConfig__factory(deployer).deploy()
        poolTokens = await new PoolTokens__factory(deployer).deploy()
        accountant = await new Accountant__factory(deployer).deploy();
        creditLineImplementation = await new CreditLine__factory({
            ["contracts/goldfinch-v2.0/protocol/core/Accountant.sol:Accountant"]: accountant.address
        }, deployer).deploy()
        borrowerImplementation = await new Borrower__factory(deployer).deploy()
        tranchedPoolImplementation = await new TranchedPool__factory(deployer).deploy()
        goldfinchFactory = await new GoldfinchFactory__factory(deployer).deploy()
        oneInch = await new OneSplitAudit__factory(deployer).deploy(zeroAddress)

        poolInfo = [
            {
                borrower: borrower1.address,
                juniorFeePercent: BigNumber.from("8000"),
                limit: parseUnits("1000", usdcDecimal),
                interestApr: BigNumber.from("800"),
                paymentPeriodInDays: BigNumber.from("30"),
                termInDays: BigNumber.from("360"),
                lateFeeApr: BigNumber.from("500")
            }
        ]

        usdcBalanceInit = [
            {
                owner: lper1.address,
                balances: parseUnits("900", usdcDecimal)
            },
            {
                owner: lper2.address,
                balances: parseUnits("600", usdcDecimal)
            },
            {
                owner: lper3.address,
                balances: parseUnits("800", usdcDecimal)
            }
        ]

        await goldfinchConfig.connect(deployer).initialize(owner.address)
        await goldfinchFactory.connect(deployer).initialize(owner.address, goldfinchConfig.address)
        await poolTokens.connect(deployer).__initialize__(owner.address, goldfinchConfig.address)

        // mint USDC for lpers
        await Promise.all(usdcBalanceInit.map(async(item): Promise<any> => await USDC.mint(item.owner, item.balances)))

        return {logSpace, usdcDecimal, protocolAdmin, oneInch, USDC, poolTokens, poolInfo, goldfinchFactory, deployer, owner, borrower1, backer1, lper1, lper2, lper3, goldfinchConfig, creditLineImplementation, borrowerImplementation, tranchedPoolImplementation }

    }

    it("Should run", async () => {
        const {logSpace, usdcDecimal, protocolAdmin, oneInch, USDC, poolTokens, poolInfo, goldfinchFactory, deployer, owner, borrower1, backer1, lper1, lper2, lper3, goldfinchConfig, creditLineImplementation, borrowerImplementation, tranchedPoolImplementation } = await loadFixture(deployFixture)
        let tx;
        let rs;
        await goldfinchConfig.connect(owner).setGoldfinchConfig(goldfinchConfig.address)
        await goldfinchConfig.connect(owner).setCreditLineImplementation(creditLineImplementation.address)
        await goldfinchConfig.connect(owner).setBorrowerImplementation(borrowerImplementation.address)
        await goldfinchConfig.connect(owner).setAddress(13, tranchedPoolImplementation.address)
        await goldfinchConfig.connect(owner).setAddress(7, protocolAdmin.address)
        await goldfinchConfig.connect(owner).setAddress(12, poolTokens.address)
        await goldfinchConfig.connect(owner).setAddress(2, goldfinchFactory.address)
        await goldfinchConfig.connect(owner).setAddress(5, USDC.address)
        await goldfinchConfig.connect(owner).setAddress(8, oneInch.address)

        // grant owner role for backer1
        await goldfinchFactory.connect(owner).grantRole(await goldfinchFactory.OWNER_ROLE(), backer1.address)

        // borrower create borrower contract
        tx = await goldfinchFactory.connect(borrower1).createBorrower(borrower1.address)
        rs = await tx.wait()
        const borrower1ContractAddr = (rs.events as any)[(rs.events as any).length-1].args['borrower']
        const borrower1Contract = new Borrower__factory(borrower1).attach(borrower1ContractAddr)

        // create pool1
        const pool1Info = poolInfo[0]
        tx = await goldfinchFactory.connect(backer1).createPool(borrower1Contract.address, pool1Info.juniorFeePercent, pool1Info.limit, pool1Info.interestApr, pool1Info.paymentPeriodInDays, pool1Info.termInDays, pool1Info.lateFeeApr)
        rs = await tx.wait()
        const pool1Addr = ((rs.events as any)[(rs.events as any).length - 1] as any).args['pool']
        console.log(logSpace, "pool1Addr", pool1Addr)
        const pool1 = new TranchedPool__factory(deployer).attach(pool1Addr)
        let seniorTranchePool1Info = await pool1.getTranche(Tranches.Senior)
        console.log(logSpace, "seniorTranchePool1Info", seniorTranchePool1Info)
        let juniorTranchePool1Info = await pool1.getTranche(Tranches.Junior)
        console.log(logSpace, "juniorTranchePool1Info", juniorTranchePool1Info)

        // liquidity provider deposit
        // >> owner add lpers to goList ???
        await goldfinchConfig.connect(owner).addToGoList(lper1.address)
        await USDC.connect(lper1).approve(pool1.address, ethers.constants.MaxUint256)
        tx = await pool1.connect(lper1).deposit(Tranches.Junior, parseUnits("400", usdcDecimal))
        rs = await tx.wait()
        const tokenIdLper1Pool1 = ((rs.events as any)[(rs.events as any).length - 1].args['tokenId'])
        const lper1TokenInfo = await poolTokens.tokens(tokenIdLper1Pool1)
        console.log(logSpace, "lper1TokenInfo", lper1TokenInfo)
        console.log(logSpace, await poolTokens.ownerOf(tokenIdLper1Pool1), lper1.address)
        
        await goldfinchConfig.connect(owner).addToGoList(lper2.address)
        await USDC.connect(lper2).approve(pool1.address, ethers.constants.MaxUint256)
        tx = await pool1.connect(lper2).deposit(Tranches.Junior, parseUnits("500", usdcDecimal))
        rs = await tx.wait()
        const tokenIdLper2Pool1 = ((rs.events as any)[(rs.events as any).length - 1].args['tokenId'])
        const lper2TokenInfo = await poolTokens.tokens(tokenIdLper2Pool1)
        console.log(logSpace, "lper2TokenInfo", lper2TokenInfo)
        console.log(logSpace, await poolTokens.ownerOf(tokenIdLper2Pool1), lper2.address)

        juniorTranchePool1Info = await pool1.getTranche(Tranches.Junior)
        console.log(logSpace, "juniorTranchePool1Info", juniorTranchePool1Info)

        await goldfinchConfig.connect(owner).addToGoList(lper3.address)
        await USDC.connect(lper3).approve(pool1.address, ethers.constants.MaxUint256)
        tx = await pool1.connect(lper3).deposit(Tranches.Junior, parseUnits("600", usdcDecimal))
        rs = await tx.wait()
        const tokenIdLper3Pool1 = ((rs.events as any)[(rs.events as any).length - 1].args['tokenId'])
        const lper3TokenInfo = await poolTokens.tokens(tokenIdLper3Pool1)
        console.log(logSpace, "lper3TokenInfo", lper3TokenInfo)
        console.log(logSpace, await poolTokens.ownerOf(tokenIdLper3Pool1), lper3.address)

        juniorTranchePool1Info = await pool1.getTranche(Tranches.Junior)
        console.log(logSpace, "juniorTranchePool1Info", juniorTranchePool1Info)

        // borrower drawdown
        await borrower1Contract.connect(borrower1).lockJuniorCapital(pool1.address)
        
        seniorTranchePool1Info = await pool1.getTranche(Tranches.Senior)
        console.log(logSpace, "seniorTranchePool1Info", seniorTranchePool1Info)
        juniorTranchePool1Info = await pool1.getTranche(Tranches.Junior)
        console.log(logSpace, "juniorTranchePool1Info", juniorTranchePool1Info)

        await borrower1Contract.connect(borrower1).drawdown(pool1.address, parseUnits("800", usdcDecimal), borrower1.address)
    })
})
