import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber, BigNumberish } from "ethers"
import { ethers } from "hardhat"
import { randomBytes, sign } from "crypto"
import { parseUnits } from "ethers/lib/utils"
import { expect } from "chai"

import { GoldfinchConfig } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/GoldfinchConfig"
import { GoldfinchConfig__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/GoldfinchConfig__factory"

import { FiatTokenV2_1 } from "../../typechain-types/contracts/goldfinch-V2.2-update/test/USDC.sol"
import { FiatTokenV2_1__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/test/USDC.sol"

import { PoolTokens } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/PoolTokens"
import { PoolTokens__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/PoolTokens__factory"

import { Borrower } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/periphery/Borrower"
import { Borrower__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/periphery/Borrower__factory"

import { TranchedPool } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/TranchedPool"
import { TranchedPool__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/TranchedPool__factory"

import { TranchingLogic } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/TranchingLogic"
import { TranchingLogic__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/TranchingLogic__factory"

import { CreditLine } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/CreditLine"
import { CreditLine__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/CreditLine__factory"

import { Accountant } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/Accountant"
import { Accountant__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/Accountant__factory"

import { GoldfinchFactory } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/GoldfinchFactory"
import { GoldfinchFactory__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/GoldfinchFactory__factory"

import { Go } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/Go"
import { Go__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/Go__factory"

import { UniqueIdentity } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/UniqueIdentity"
import { UniqueIdentity__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/UniqueIdentity__factory"

import { SeniorPool } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/SeniorPool"
import { SeniorPool__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/SeniorPool__factory"

import { CreditDesk } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/CreditDesk"
import { CreditDesk__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/CreditDesk__factory"

import { BackerRewards } from "../../typechain-types/contracts/goldfinch-V2.2-update/rewards/BackerRewards"
import { BackerRewards__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/rewards/BackerRewards__factory"

import { Fidu } from "../../typechain-types/contracts/goldfinch-V2.2-update/protocol/core/Fidu"
import { Fidu__factory } from "../../typechain-types/factories/contracts/goldfinch-V2.2-update/protocol/core/Fidu__factory"

describe("Goldfinch-v2.2", () => {

    type PoolInfo = {
        borrower: string,
        juniorFeePercent: BigNumberish,
        limit: BigNumberish,
        interestApr: BigNumberish,
        paymentPeriodInDays: BigNumberish,
        termInDays: BigNumberish,
        lateFeeApr: BigNumberish,
        principalGracePeriodInDays: BigNumberish,
        fundableAt: BigNumberish,
        allowedUIDTypes: BigNumberish[]
    }

    type USDCBalanceInit = {
        owner: string,
        balances: BigNumberish
    }

    enum ConfigOptionNumbers {
        TransactionLimit,
        TotalFundsLimit,
        MaxUnderwriterLimit,
        ReserveDenominator,
        WithdrawFeeDenominator,
        LatenessGracePeriodInDays,
        LatenessMaxDays,
        DrawdownPeriodInSeconds,
        TransferRestrictionPeriodInDays,
        LeverageRatio
    }

    enum ConfigOptionAddresses {
        Pool,
        CreditLineImplementation,
        GoldfinchFactory,
        CreditDesk,
        Fidu,
        USDC,
        TreasuryReserve,
        ProtocolAdmin,
        OneInch,
        TrustedForwarder,
        CUSDCContract,
        GoldfinchConfig,
        PoolTokens,
        TranchedPoolImplementation,
        SeniorPool,
        SeniorPoolStrategy,
        MigratedTranchedPoolImplementation,
        BorrowerImplementation,
        GFI,
        Go,
        BackerRewards,
        StakingRewards
    }

    async function deployFixture() {

        const logMark = "\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"

        const logSpace = async () => {
            return (
                "\n" + await time.latest() + "\n===========================================================================================================================================================================================================\n"
            )
        }
        const zeroAddress = '0x' + '0'.repeat(40)
        let deployer: SignerWithAddress
        let protocolAdminAddress: SignerWithAddress
        let owner: SignerWithAddress
        let borrower1: SignerWithAddress
        let backer1: SignerWithAddress
        let backer2: SignerWithAddress
        let backer3: SignerWithAddress
        let lper1: SignerWithAddress
        let lper2: SignerWithAddress
        let lper3: SignerWithAddress

        let USDC: FiatTokenV2_1
        let usdcDecimal: BigNumberish
        let goldfinchConfig: GoldfinchConfig
        let poolTokens: PoolTokens;
        let borrowerImpl: Borrower
        let tranchedPoolImpl: TranchedPool
        let tranchingLogic: TranchingLogic
        let creditLineImpl: CreditLine
        let accountant: Accountant
        let goldfinchFactory: GoldfinchFactory
        let trustedForwarderAddress: string
        let oneInchAddress: string
        let poolInfos: PoolInfo[]
        let go: Go
        let uniqueIdentity: UniqueIdentity
        let seniorPool: SeniorPool
        let creditDesk: CreditDesk
        let usdcBalanceInit: USDCBalanceInit[]
        let backerRewards: BackerRewards
        let drawdownPeriodInSeconds: BigNumberish
        let reserveDenominator: BigNumberish
        let treasuryReserve: string
        let fidu: Fidu
        let totalFundsLimit: BigNumberish

        const signEIP191 = async (signer: SignerWithAddress, lper: string, uIdType: BigNumberish, deadline1: BigNumberish, uIdContractAddr: string, nonces: BigNumberish, chainId: BigNumberish) => {
            const messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint256", "address", "uint256", "uint256"],
                [lper, uIdType, deadline1, uIdContractAddr, nonces, chainId]
            )
            const signature = await signer.signMessage(ethers.utils.arrayify(messageHash))
            return signature
        }

        const getAndLogCreditLineInfo = async (creditLine: CreditLine) => {
            const borrower = await creditLine.borrower()
            const currentLimit = await creditLine.currentLimit()
            const maxLimit = await creditLine.maxLimit()
            const interestApr = await creditLine.interestApr()
            const paymentPeriodInDays = await creditLine.paymentPeriodInDays()
            const termInDays = await creditLine.termInDays()
            const principalGracePeriodInDays = await creditLine.principalGracePeriodInDays()
            const lateFeeApr = await creditLine.lateFeeApr()
            const creditLineTerms = {
                borrower,
                currentLimit,
                maxLimit,
                interestApr,
                paymentPeriodInDays,
                termInDays,
                principalGracePeriodInDays,
                lateFeeApr
            }
            const balance = await creditLine.balance()
            const interestOwed = await creditLine.interestOwed()
            const principalOwed = await creditLine.principalOwed()
            const termEndTime = await creditLine.termEndTime()
            const nextDueTime = await creditLine.nextDueTime()
            const interestAccruedAsOf = await creditLine.interestAccruedAsOf()
            const lastFullPaymentTime = await creditLine.lastFullPaymentTime()
            const totalInterestAccrued = await creditLine.totalInterestAccrued()
            const accountingVariables = {
                balance,
                interestOwed,
                principalOwed,
                termEndTime,
                nextDueTime,
                interestAccruedAsOf,
                lastFullPaymentTime,
                totalInterestAccrued
            }
            console.log(await logSpace(), "Credit line terms", creditLineTerms, "\n", "Accounting variables", accountingVariables)
        }

        [deployer, protocolAdminAddress, owner, borrower1, backer1, backer2, backer3, lper1, lper2, lper3] = await ethers.getSigners()


        // deploy and mint USDC token
        USDC = await new FiatTokenV2_1__factory(deployer).deploy()
        await USDC.connect(deployer).initialize("USD Coin", "USDC", "USD", 6, deployer.address, deployer.address, deployer.address, deployer.address)
        await USDC.connect(deployer).configureMinter(deployer.address, ethers.constants.MaxUint256)
        usdcDecimal = await USDC.decimals()

        usdcBalanceInit = [
            {
                owner: backer1.address,
                balances: parseUnits("1000000000", usdcDecimal)
            },
            {
                owner: backer2.address,
                balances: parseUnits("1000000000", usdcDecimal)
            },
            {
                owner: backer3.address,
                balances: parseUnits("1000000000", usdcDecimal)
            },
            {
                owner: lper1.address,
                balances: parseUnits("1000000000", usdcDecimal)
            },
            {
                owner: lper2.address,
                balances: parseUnits("1000000000", usdcDecimal)
            },
            {
                owner: lper3.address,
                balances: parseUnits("1000000000", usdcDecimal)
            },
            {
                owner: borrower1.address,
                balances: parseUnits("1000000000", usdcDecimal)
            }
        ]

        await Promise.all(
            usdcBalanceInit.map(
                async (item): Promise<any> => await USDC.connect(deployer).mint(item.owner, item.balances)
            )
        )

        // deploy contract
        goldfinchConfig = await new GoldfinchConfig__factory(deployer).deploy()
        await goldfinchConfig.connect(deployer).initialize(owner.address)
        await goldfinchConfig.connect(owner).setGoldfinchConfig(goldfinchConfig.address)

        borrowerImpl = await new Borrower__factory(deployer).deploy()
        await goldfinchConfig.connect(owner).setBorrowerImplementation(borrowerImpl.address)

        tranchingLogic = await new TranchingLogic__factory(deployer).deploy()
        tranchedPoolImpl = await new TranchedPool__factory({
            ["contracts/goldfinch-V2.2-update/protocol/core/TranchingLogic.sol:TranchingLogic"]: tranchingLogic.address
        }, deployer).deploy()
        await goldfinchConfig.connect(owner).setTranchedPoolImplementation(tranchedPoolImpl.address)

        accountant = await new Accountant__factory(deployer).deploy()
        creditLineImpl = await new CreditLine__factory({
            ["contracts/goldfinch-V2.2-update/protocol/core/Accountant.sol:Accountant"]: accountant.address
        }, deployer).deploy()
        await goldfinchConfig.connect(owner).setCreditLineImplementation(creditLineImpl.address)

        goldfinchFactory = await new GoldfinchFactory__factory(deployer).deploy()
        await goldfinchFactory.connect(deployer).initialize(owner.address, goldfinchConfig.address)
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.GoldfinchFactory, goldfinchFactory.address)

        trustedForwarderAddress = '0x' + randomBytes(20).toString('hex');
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.TrustedForwarder, trustedForwarderAddress);

        oneInchAddress = '0x' + randomBytes(20).toString('hex');
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.OneInch, oneInchAddress)

        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.USDC, USDC.address)

        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.ProtocolAdmin, protocolAdminAddress.address)

        poolTokens = await new PoolTokens__factory(deployer).deploy()
        await poolTokens.connect(deployer).__initialize__(owner.address, goldfinchConfig.address)
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.PoolTokens, poolTokens.address)

        uniqueIdentity = await new UniqueIdentity__factory(deployer).deploy()
        await uniqueIdentity.connect(deployer).initialize(owner.address, "http://uri.test")
        await uniqueIdentity.connect(owner).setSupportedUIDTypes([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [true, true, true, true, true, true, true, true, true, true, true])

        go = await new Go__factory(deployer).deploy()
        await go.connect(deployer).initialize(owner.address, goldfinchConfig.address, uniqueIdentity.address)
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.Go, go.address)

        creditDesk = await new CreditDesk__factory({
            ["contracts/goldfinch-V2.2-update/protocol/core/Accountant.sol:Accountant"]: accountant.address
        }, deployer).deploy()
        await creditDesk.connect(deployer).initialize(owner.address, goldfinchConfig.address)
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.CreditDesk, creditDesk.address)


        seniorPool = await new SeniorPool__factory({
            ["contracts/goldfinch-V2.2-update/protocol/core/Accountant.sol:Accountant"]: accountant.address
        }, deployer).deploy()
        await seniorPool.connect(deployer).initialize(owner.address, goldfinchConfig.address)
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.SeniorPool, seniorPool.address)

        fidu = await new Fidu__factory(deployer).deploy()
        await fidu.connect(deployer).__initialize__(owner.address, "FIDU", "FIDU", goldfinchConfig.address)
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.Fidu, fidu.address)
        await fidu.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")), seniorPool.address)

        backerRewards = await new BackerRewards__factory(deployer).deploy()
        await backerRewards.connect(deployer).__initialize__(owner.address, goldfinchConfig.address)
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.BackerRewards, backerRewards.address)

        drawdownPeriodInSeconds = 3 * 24 * 60 * 60;
        await goldfinchConfig.connect(owner).setNumber(ConfigOptionNumbers.DrawdownPeriodInSeconds, drawdownPeriodInSeconds)

        reserveDenominator = 10
        await goldfinchConfig.connect(owner).setNumber(ConfigOptionNumbers.ReserveDenominator, reserveDenominator)

        treasuryReserve = '0x' + randomBytes(20).toString('hex');
        await goldfinchConfig.connect(owner).setAddress(ConfigOptionAddresses.TreasuryReserve, treasuryReserve)

        totalFundsLimit = parseUnits("1000000000", 18)
        await goldfinchConfig.connect(owner).setNumber(ConfigOptionNumbers.TotalFundsLimit, totalFundsLimit)

        poolInfos = [
            {
                borrower: borrower1.address,
                juniorFeePercent: BigNumber.from("10"),
                limit: parseUnits("10000", usdcDecimal),
                interestApr: parseUnits("15", 16),
                paymentPeriodInDays: BigNumber.from("30"),
                termInDays: BigNumber.from("120"),
                lateFeeApr: parseUnits("5", 16),
                principalGracePeriodInDays: BigNumber.from("5"),
                fundableAt: (await time.latest()) + 10 * 24 * 60 * 60,
                allowedUIDTypes: [0, 1, 2, 3, 4, 5]
            }
        ]

        return {
            deployer, owner, borrower1, backer1, backer2, backer3, lper1, lper2, lper3,
            logSpace, zeroAddress, usdcDecimal, goldfinchConfig, goldfinchFactory,
            poolInfos, tranchingLogic, uniqueIdentity, signEIP191, USDC, accountant,
            getAndLogCreditLineInfo, logMark, seniorPool
        }
    }

    it("Should run v2.2 without senior pool", async () => {
        const { deployer, owner, borrower1, backer1, backer2, backer3, lper1, lper2, lper3,
            logSpace, zeroAddress, usdcDecimal, goldfinchConfig, goldfinchFactory,
            poolInfos, tranchingLogic, uniqueIdentity, signEIP191, USDC, accountant,
            getAndLogCreditLineInfo, logMark
        } = await loadFixture(deployFixture)

        let tx;
        let txRs;

        // create borrower contract
        tx = await goldfinchFactory.connect(borrower1).createBorrower(borrower1.address)
        txRs = await tx.wait()
        // console.log((txRs.events as any)[(txRs.events as any).length-1].args)
        const borrower1ContractAddr = (txRs.events as any)[(txRs.events as any).length - 1].args.borrower
        const borrower1Contract = new Borrower__factory(borrower1).attach(borrower1ContractAddr)

        // owner create pool for borrower1
        console.log(logMark, "owner create pool for borrower1")
        const pool1Info = poolInfos[1 - 1];
        tx = await goldfinchFactory.connect(owner).createPool(
            borrower1ContractAddr,
            pool1Info.juniorFeePercent,
            pool1Info.limit,
            pool1Info.interestApr,
            pool1Info.paymentPeriodInDays,
            pool1Info.termInDays,
            pool1Info.lateFeeApr,
            pool1Info.principalGracePeriodInDays,
            pool1Info.fundableAt,
            pool1Info.allowedUIDTypes
        )
        txRs = await tx.wait()
        const pool1Addr = (txRs.events as any)[(txRs.events as any).length - 1].args.pool
        const pool1 = new TranchedPool__factory({
            ["contracts/goldfinch-V2.2-update/protocol/core/TranchingLogic.sol:TranchingLogic"]: tranchingLogic.address
        }, owner).attach(pool1Addr)

        const creditLinePool1Slice1Addr = await pool1.creditLine()
        const creditLinePool1Slice1 = new CreditLine__factory({
            ["contracts/goldfinch-V2.2-update/protocol/core/Accountant.sol:Accountant"]: accountant.address
        }, deployer).attach(creditLinePool1Slice1Addr)

        console.log(await logSpace(), "numSlicesOfPool1", await pool1.numSlices())
        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)

        await time.increaseTo((await pool1.fundableAt()).add(1))

        // backer1 deposit
        console.log(logMark, "backer1 deposit")
        // backer1 mint UID token
        const deadline1 = (await time.latest()) + 10 * 60
        const signature1 = await signEIP191(owner, backer1.address, 2, deadline1, uniqueIdentity.address, await uniqueIdentity.nonces(backer1.address), 31337)
        tx = await uniqueIdentity.connect(backer1).mint(2, deadline1, signature1, { value: parseUnits("83", 13) })

        // backer1 deposit to pool1
        await USDC.connect(backer1).approve(pool1.address, ethers.constants.MaxUint256)
        await pool1.connect(backer1).deposit(2, parseUnits("5000", usdcDecimal))

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // backer2 deposit
        console.log(logMark, "backer2 deposit")
        // backer2 mint UID token
        const deadline2 = (await time.latest()) + 10 * 60
        const signature2 = await signEIP191(owner, backer2.address, 2, deadline2, uniqueIdentity.address, await uniqueIdentity.nonces(backer2.address), 31337)
        tx = await uniqueIdentity.connect(backer2).mint(2, deadline2, signature2, { value: parseUnits("83", 13) })

        // backer2 deposit to pool1
        await USDC.connect(backer2).approve(pool1.address, ethers.constants.MaxUint256)
        await pool1.connect(backer2).deposit(2, parseUnits("3000", usdcDecimal))

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // backer3 deposit
        console.log(logMark, "backer3 deposit")
        // backer3 mint UID token
        const deadline3 = (await time.latest()) + 10 * 60
        const signature3 = await signEIP191(owner, backer3.address, 2, deadline3, uniqueIdentity.address, await uniqueIdentity.nonces(backer3.address), 31337)
        tx = await uniqueIdentity.connect(backer3).mint(2, deadline3, signature3, { value: parseUnits("83", 13) })

        // backer3 deposit to pool1
        await USDC.connect(backer3).approve(pool1.address, ethers.constants.MaxUint256)
        await pool1.connect(backer3).deposit(2, parseUnits("4000", usdcDecimal))

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // borrower lock junior capital
        await borrower1Contract.connect(borrower1).lockJuniorCapital(pool1.address)

        // senior invest

        // borrower lock pool
        console.log(logMark, "borrower lock pool")
        await borrower1Contract.connect(borrower1).lockPool(pool1.address)

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // borrower drawdown first time
        await time.increaseTo(1700000000 - 1)
        console.log(logMark, "borrower drawdown first time")
        await borrower1Contract.connect(borrower1).drawdown(pool1.address, parseUnits("6000", usdcDecimal), borrower1.address)

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // borrower drawdown second time after 3 days
        await time.increase(3 * 24 * 60 * 60 - 1)
        console.log(logMark, "borrower drawdown second time")
        await borrower1Contract.connect(borrower1).drawdown(pool1.address, parseUnits("2000", usdcDecimal), borrower1.address)

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // borrower drawdown third time after nextDueTime withou paying loan >> expect: revert
        // await time.increaseTo(await creditLinePool1Slice1.nextDueTime())
        // await time.increase(10)
        // console.log("borrower drawdown third time but revert")
        // await expect(borrower1Contract.connect(borrower1).drawdown(pool1.address, parseUnits("1000", usdcDecimal), borrower1.address)).to.be.reverted

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // borrower drawdown third time after 6 days
        await time.increase(6 * 24 * 60 * 60 - 1)
        console.log(logMark, "borrower drawdown third time")
        await borrower1Contract.connect(borrower1).drawdown(pool1.address, parseUnits("1000", usdcDecimal), borrower1.address)

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // borrower pay instantly before nextDueTime (= 30 days)
        // console.log(logMark, "borrow pay")
        // await USDC.connect(borrower1).approve(borrower1Contract.address, ethers.constants.MaxUint256)
        // await borrower1Contract.connect(borrower1).pay(pool1.address, parseUnits("1000", usdcDecimal))

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // borrower pay after nextDueTime (= 30 days-from 1700k)
        await time.increaseTo(await creditLinePool1Slice1.nextDueTime())
        await time.increase(10 - 1)
        console.log(logMark, "borrower pay after nextDueTime (= 30 days-from 1700k)")
        await USDC.connect(borrower1).approve(borrower1Contract.address, ethers.constants.MaxUint256)
        await borrower1Contract.connect(borrower1).pay(pool1.address, parseUnits("145", usdcDecimal))

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)
        return
        // borrower pay before nextDueTime (= 60 days-from 1700k)
        await time.increase(10 * 24 * 60 * 60 - 1)
        console.log(logMark, "borrower pay before nextDueTime (= 60 days-from 1700k)")
        await USDC.connect(borrower1).approve(borrower1Contract.address, ethers.constants.MaxUint256)
        await borrower1Contract.connect(borrower1).pay(pool1.address, parseUnits("30", usdcDecimal))

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // borrower pay after nextDueTime (= 60 days-from 1700k)
        await time.increaseTo(await creditLinePool1Slice1.nextDueTime())
        await time.increase(10 - 1)
        console.log(logMark, "borrower pay after nextDueTime (= 60 days-from 1700k)")
        await USDC.connect(borrower1).approve(borrower1Contract.address, ethers.constants.MaxUint256)
        await borrower1Contract.connect(borrower1).pay(pool1.address, parseUnits("20", usdcDecimal))

        console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        await getAndLogCreditLineInfo(creditLinePool1Slice1)
    })

    xit("Should run v2.2 with senior pool", async () => {
        const { deployer, owner, borrower1, backer1, backer2, backer3, lper1, lper2, lper3,
            logSpace, zeroAddress, usdcDecimal, goldfinchConfig, goldfinchFactory,
            poolInfos, tranchingLogic, uniqueIdentity, signEIP191, USDC, accountant,
            getAndLogCreditLineInfo, logMark, seniorPool
        } = await loadFixture(deployFixture)

        let tx;
        let txRs;

        // create borrower contract
        tx = await goldfinchFactory.connect(borrower1).createBorrower(borrower1.address)
        txRs = await tx.wait()

        // lper1 deposit to senior pool
        console.log(logMark, "lper1 deposit to senior pool")
        // lper1 mint UID token
        const deadline11 = (await time.latest()) + 10 * 60
        const signature11 = await signEIP191(owner, lper1.address, 1, deadline11, uniqueIdentity.address, await uniqueIdentity.nonces(lper1.address), 31337)
        tx = await uniqueIdentity.connect(lper1).mint(1, deadline11, signature11, { value: parseUnits("83", 13) })
        //lper1 deposit
        await USDC.connect(lper1).approve(seniorPool.address, ethers.constants.MaxUint256)
        await seniorPool.connect(lper1).deposit(parseUnits("10000", usdcDecimal))

        // lper2 deposit to senior pool
        console.log(logMark, "lper2 deposit to senior pool")
        // lper2 mint UID token
        const deadline12 = (await time.latest()) + 10 * 60
        const signature12 = await signEIP191(owner, lper2.address, 1, deadline12, uniqueIdentity.address, await uniqueIdentity.nonces(lper2.address), 31337)
        tx = await uniqueIdentity.connect(lper2).mint(1, deadline12, signature12, { value: parseUnits("83", 13) })
        //lper2 deposit
        await USDC.connect(lper2).approve(seniorPool.address, ethers.constants.MaxUint256)
        await seniorPool.connect(lper2).deposit(parseUnits("20000", usdcDecimal))

        // lper3 deposit to senior pool
        console.log(logMark, "lper3 deposit to senior pool")
        // lper3 mint UID token
        const deadline13 = (await time.latest()) + 10 * 60
        const signature13 = await signEIP191(owner, lper3.address, 1, deadline13, uniqueIdentity.address, await uniqueIdentity.nonces(lper3.address), 31337)
        tx = await uniqueIdentity.connect(lper3).mint(1, deadline13, signature13, { value: parseUnits("83", 13) })
        //lper3 deposit
        await USDC.connect(lper3).approve(seniorPool.address, ethers.constants.MaxUint256)
        await seniorPool.connect(lper3).deposit(parseUnits("10000", usdcDecimal))

        // const borrower1ContractAddr = (txRs.events as any)[(txRs.events as any).length - 1].args.borrower
        // const borrower1Contract = new Borrower__factory(borrower1).attach(borrower1ContractAddr)

        // // owner create pool for borrower1
        // console.log(logMark, "owner create pool for borrower1")
        // const pool1Info = poolInfos[1 - 1];
        // tx = await goldfinchFactory.connect(owner).createPool(
        //     borrower1ContractAddr,
        //     pool1Info.juniorFeePercent,
        //     pool1Info.limit,
        //     pool1Info.interestApr,
        //     pool1Info.paymentPeriodInDays,
        //     pool1Info.termInDays,
        //     pool1Info.lateFeeApr,
        //     pool1Info.principalGracePeriodInDays,
        //     pool1Info.fundableAt,
        //     pool1Info.allowedUIDTypes
        // )
        // txRs = await tx.wait()
        // const pool1Addr = (txRs.events as any)[(txRs.events as any).length - 1].args.pool
        // const pool1 = new TranchedPool__factory({
        //     ["contracts/goldfinch-V2.2-update/protocol/core/TranchingLogic.sol:TranchingLogic"]: tranchingLogic.address
        // }, owner).attach(pool1Addr)

        // const creditLinePool1Slice1Addr = await pool1.creditLine()
        // const creditLinePool1Slice1 = new CreditLine__factory({
        //     ["contracts/goldfinch-V2.2-update/protocol/core/Accountant.sol:Accountant"]: accountant.address
        // }, deployer).attach(creditLinePool1Slice1Addr)

        // console.log(await logSpace(), "numSlicesOfPool1", await pool1.numSlices())
        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // await time.increaseTo((await pool1.fundableAt()).add(1))

        // // backer1 deposit
        // console.log(logMark, "backer1 deposit")
        // // backer1 mint UID token
        // const deadline1 = (await time.latest()) + 10 * 60
        // const signature1 = await signEIP191(owner, backer1.address, 2, deadline1, uniqueIdentity.address, await uniqueIdentity.nonces(backer1.address), 31337)
        // tx = await uniqueIdentity.connect(backer1).mint(2, deadline1, signature1, { value: parseUnits("83", 13) })

        // // backer1 deposit to pool1
        // await USDC.connect(backer1).approve(pool1.address, ethers.constants.MaxUint256)
        // await pool1.connect(backer1).deposit(2, parseUnits("5000", usdcDecimal))

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // backer2 deposit
        // console.log(logMark, "backer2 deposit")
        // // backer2 mint UID token
        // const deadline2 = (await time.latest()) + 10 * 60
        // const signature2 = await signEIP191(owner, backer2.address, 2, deadline2, uniqueIdentity.address, await uniqueIdentity.nonces(backer2.address), 31337)
        // tx = await uniqueIdentity.connect(backer2).mint(2, deadline2, signature2, { value: parseUnits("83", 13) })

        // // backer2 deposit to pool1
        // await USDC.connect(backer2).approve(pool1.address, ethers.constants.MaxUint256)
        // await pool1.connect(backer2).deposit(2, parseUnits("3000", usdcDecimal))

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // backer3 deposit
        // console.log(logMark, "backer3 deposit")
        // // backer3 mint UID token
        // const deadline3 = (await time.latest()) + 10 * 60
        // const signature3 = await signEIP191(owner, backer3.address, 2, deadline3, uniqueIdentity.address, await uniqueIdentity.nonces(backer3.address), 31337)
        // tx = await uniqueIdentity.connect(backer3).mint(2, deadline3, signature3, { value: parseUnits("83", 13) })

        // // backer3 deposit to pool1
        // await USDC.connect(backer3).approve(pool1.address, ethers.constants.MaxUint256)
        // await pool1.connect(backer3).deposit(2, parseUnits("4000", usdcDecimal))

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // borrower lock junior capital
        // await borrower1Contract.connect(borrower1).lockJuniorCapital(pool1.address)

        // // senior invest

        // // borrower lock pool
        // console.log(logMark, "borrower lock pool")
        // await borrower1Contract.connect(borrower1).lockPool(pool1.address)

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // borrower drawdown first time
        // await time.increaseTo(1700000000 - 1)
        // console.log(logMark, "borrower drawdown first time")
        // await borrower1Contract.connect(borrower1).drawdown(pool1.address, parseUnits("6000", usdcDecimal), borrower1.address)

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // borrower drawdown second time after 3 days
        // await time.increase(3 * 24 * 60 * 60 - 1)
        // console.log(logMark, "borrower drawdown second time")
        // await borrower1Contract.connect(borrower1).drawdown(pool1.address, parseUnits("2000", usdcDecimal), borrower1.address)

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // borrower drawdown third time after nextDueTime withou paying loan >> expect: revert
        // // await time.increaseTo(await creditLinePool1Slice1.nextDueTime())
        // // await time.increase(10)
        // // console.log("borrower drawdown third time but revert")
        // // await expect(borrower1Contract.connect(borrower1).drawdown(pool1.address, parseUnits("1000", usdcDecimal), borrower1.address)).to.be.reverted

        // // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // borrower drawdown third time after 6 days
        // await time.increase(6 * 24 * 60 * 60 - 1)
        // console.log(logMark, "borrower drawdown third time")
        // await borrower1Contract.connect(borrower1).drawdown(pool1.address, parseUnits("1000", usdcDecimal), borrower1.address)

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // borrower pay instantly before nextDueTime (= 30 days)
        // // console.log(logMark, "borrow pay")
        // // await USDC.connect(borrower1).approve(borrower1Contract.address, ethers.constants.MaxUint256)
        // // await borrower1Contract.connect(borrower1).pay(pool1.address, parseUnits("1000", usdcDecimal))

        // // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // borrower pay after nextDueTime (= 30 days-from 1700k)
        // await time.increaseTo(await creditLinePool1Slice1.nextDueTime())
        // await time.increase(10 - 1)
        // console.log(logMark, "borrower pay after nextDueTime (= 30 days-from 1700k)")
        // await USDC.connect(borrower1).approve(borrower1Contract.address, ethers.constants.MaxUint256)
        // await borrower1Contract.connect(borrower1).pay(pool1.address, parseUnits("145", usdcDecimal))

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // borrower pay before nextDueTime (= 60 days-from 1700k)
        // await time.increase(10 * 24 * 60 * 60 - 1)
        // console.log(logMark, "borrower pay before nextDueTime (= 60 days-from 1700k)")
        // await USDC.connect(borrower1).approve(borrower1Contract.address, ethers.constants.MaxUint256)
        // await borrower1Contract.connect(borrower1).pay(pool1.address, parseUnits("30", usdcDecimal))

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)

        // // borrower pay after nextDueTime (= 60 days-from 1700k)
        // await time.increaseTo(await creditLinePool1Slice1.nextDueTime())
        // await time.increase(10 - 1)
        // console.log(logMark, "borrower pay after nextDueTime (= 60 days-from 1700k)")
        // await USDC.connect(borrower1).approve(borrower1Contract.address, ethers.constants.MaxUint256)
        // await borrower1Contract.connect(borrower1).pay(pool1.address, parseUnits("20", usdcDecimal))

        // console.log(await logSpace(), "poolSlice0OfPool1", await pool1.poolSlices(0))
        // await getAndLogCreditLineInfo(creditLinePool1Slice1)
    })
})