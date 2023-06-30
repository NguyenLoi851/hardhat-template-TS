import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { parseUnits } from "ethers/lib/utils"
import { ethers } from "hardhat"
import { AToken__factory, BorrowLogic__factory, BridgeLogic__factory, EModeLogic__factory, FlashLoanLogic__factory, LiquidationLogic__factory, MintableERC20__factory, PoolAddressesProvider__factory, PoolLogic__factory, SupplyLogic__factory } from "../../typechain-types"
import { WETH9Mocked__factory } from "../../typechain-types/factories/mocks/tokens/WETH9Mocked__factory"
import { Pool__factory } from "../../typechain-types/factories/protocol/pool/Pool__factory"
import { logEthBalance, logTokenBalance } from "../utils"

describe("Fork aave-v3", () => {
    it.skip("Should run", async () => {
        let deployer: SignerWithAddress
        [deployer] = await ethers.getSigners()
        const poolAddress = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
        const LiquidationLogicAddress = "0xe175De51F29d822b86e46A9A61246Ec90631210D"
        const SupplyLogicAddress = "0x39dF4b1329D41A9AE20e17BeFf39aAbd2f049128"
        const EModeLogicAddress = "0xeAbd65827E91Ac3aE5471C11A329fbc675cA46d6"
        const BorrowLogicAddress = "0x5d834EAD0a80CF3b88c06FeeD6e8E0Fcae2daEE5"
        const FlashLoanLogicAddress = "0x0A62276bFBF1Ad8443f37Da8630d407408085c8b"
        const PoolLogicAddress = "0xD5256981e08492AFc543aF2a779Af989E9f9F7e7"
        const BridgeLogicAddress = "0x57572C9e795F4B6A748EFBeAB7E0a1B9996A0A24"

        const pool = new Pool__factory({
            ["contracts/protocol/libraries/logic/LiquidationLogic.sol:LiquidationLogic"]: LiquidationLogicAddress,
            ["contracts/protocol/libraries/logic/SupplyLogic.sol:SupplyLogic"]: SupplyLogicAddress,
            ["contracts/protocol/libraries/logic/EModeLogic.sol:EModeLogic"]: EModeLogicAddress,
            ["contracts/protocol/libraries/logic/BorrowLogic.sol:BorrowLogic"]: BorrowLogicAddress,
            ["contracts/protocol/libraries/logic/FlashLoanLogic.sol:FlashLoanLogic"]: FlashLoanLogicAddress,
            ["contracts/protocol/libraries/logic/PoolLogic.sol:PoolLogic"]: PoolLogicAddress,
            ["contracts/protocol/libraries/logic/BridgeLogic.sol:BridgeLogic"]: BridgeLogicAddress,
        }, deployer).attach(poolAddress)

        // ===============================
        // ===============================
        // =============================== upgrade implement contract to use console.log ===============================
        // ===============================
        // ===============================
        // const poolAddressProviderOwnerAddress = "0xEE56e2B3D491590B5b31738cC34d5232F378a8D5"
        // const poolAddressProviderOwner = await ethers.getImpersonatedSigner(poolAddressProviderOwnerAddress)

        // const poolAddressProviderAddress = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e"
        // const poolAddressProvider = new PoolAddressesProvider__factory(poolAddressProviderOwner).attach(poolAddressProviderAddress)

        // await deployer.sendTransaction({
        //     to: poolAddressProviderOwner.address,
        //     value: ethers.utils.parseEther("10")
        // })

        // const newPoolImpl = await new Pool__factory({
        //     ["contracts/protocol/libraries/logic/LiquidationLogic.sol:LiquidationLogic"]: LiquidationLogicAddress,
        //     ["contracts/protocol/libraries/logic/SupplyLogic.sol:SupplyLogic"]: SupplyLogicAddress,
        //     ["contracts/protocol/libraries/logic/EModeLogic.sol:EModeLogic"]: EModeLogicAddress,
        //     ["contracts/protocol/libraries/logic/BorrowLogic.sol:BorrowLogic"]: BorrowLogicAddress,
        //     ["contracts/protocol/libraries/logic/FlashLoanLogic.sol:FlashLoanLogic"]: FlashLoanLogicAddress,
        //     ["contracts/protocol/libraries/logic/PoolLogic.sol:PoolLogic"]: PoolLogicAddress,
        //     ["contracts/protocol/libraries/logic/BridgeLogic.sol:BridgeLogic"]: BridgeLogicAddress,
        // }, poolAddressProviderOwner).deploy(poolAddressProvider.address)

        // console.log(await poolAddressProvider.owner())

        // console.log(newPoolImpl.address)

        // await poolAddressProvider.connect(poolAddressProviderOwner).setPoolImpl(newPoolImpl.address)
        // ===============================


        // ===============================
        // ===============================
        // =============================== test transfer ETH ===============================
        // ===============================
        // ===============================
        // console.log("Aave pool address", pool.address)

        // const acc1Address = "0x953EF149CA90FA1e3518C56178Cba0346d8047Bf"
        // console.log("await pool.getUserAccountData(acc1Address)", await pool.getUserAccountData(acc1Address))
        
        // const acc1 = await ethers.getImpersonatedSigner(acc1Address)
        // logEthBalance(acc1.address, await acc1.getBalance())
        
        // const acc2Address = "0x28C6c06298d514Db089934071355E5743bf21d60"

        // const acc2 = await ethers.getImpersonatedSigner(acc2Address)
        // logEthBalance(acc2.address, await acc2.getBalance())

        // const txHash = await acc2.sendTransaction({
        //     to: acc1.address,
        //     value: ethers.utils.parseEther("10")
        // })

        // logEthBalance(acc1.address, await acc1.getBalance())
        // logEthBalance(acc2.address, await acc2.getBalance())

        // ===============================

        // ===============================
        // ===============================
        // =============================== supply WETH ===============================
        // ===============================
        // ===============================

        const acc3Address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

        const acc3 = await ethers.getImpersonatedSigner(acc3Address)
        logEthBalance(acc3.address, await acc3.getBalance())
        console.log("await pool.getUserAccountData(acc1Address)", await pool.getUserAccountData(acc3Address))

        const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        const WETH = new WETH9Mocked__factory(deployer).attach(WETHAddress)
        await WETH.connect(acc3).deposit({value: ethers.utils.parseUnits("100").sub(await WETH.balanceOf(acc3.address))})

        const reserveDataWETH = await pool.getReserveData(WETH.address)
        const aWETHAddress = reserveDataWETH.aTokenAddress;
        const aWETH = new AToken__factory(deployer).attach(aWETHAddress)

        logTokenBalance(acc3.address, await WETH.balanceOf(acc3.address), await WETH.decimals(), await WETH.symbol())
        logTokenBalance(acc3.address, await aWETH.balanceOf(acc3.address), await aWETH.decimals(), await aWETH.symbol())
        console.log("aWETH supply: ", Number(await aWETH.totalSupply()) / Number(ethers.utils.parseUnits('1', await aWETH.decimals())))
        logTokenBalance("aWETH", await WETH.balanceOf(aWETH.address), await WETH.decimals(), await WETH.symbol())
        console.log("await aWETH.scaledBalanceOf(acc3.address)", await aWETH.scaledBalanceOf(acc3.address))

        console.log("Acc3 supply processing ...")
        await WETH.connect(acc3).approve(pool.address, ethers.utils.parseUnits("100"))
        await pool.connect(acc3).supply(WETH.address, ethers.utils.parseUnits("100"), acc3.address, 0)
        
        logTokenBalance(acc3.address, await WETH.balanceOf(acc3.address), await WETH.decimals(), await WETH.symbol())
        logTokenBalance(acc3.address, await aWETH.balanceOf(acc3.address), await aWETH.decimals(), await aWETH.symbol())
        console.log("aWETH supply: ", Number(await aWETH.totalSupply()) / Number(ethers.utils.parseUnits('1', await aWETH.decimals())))
        logTokenBalance("aWETH", await WETH.balanceOf(aWETH.address), await WETH.decimals(), await WETH.symbol())
        console.log("await aWETH.scaledBalanceOf(acc3.address)", await aWETH.scaledBalanceOf(acc3.address))
        console.log("      await aWETH.balanceOf(acc3.address)", await aWETH.balanceOf(acc3.address))
        console.log("  await pool.getReserveNormalizedIncome()", await pool.getReserveNormalizedIncome(await aWETH.UNDERLYING_ASSET_ADDRESS()))


    })

    it("Should run with new local pool", async () => {
        let deployer: SignerWithAddress
        [deployer] = await ethers.getSigners()
        const poolAddress = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
        const LiquidationLogicAddress = "0xe175De51F29d822b86e46A9A61246Ec90631210D"
        const SupplyLogicAddress = "0x39dF4b1329D41A9AE20e17BeFf39aAbd2f049128"
        const EModeLogicAddress = "0xeAbd65827E91Ac3aE5471C11A329fbc675cA46d6"
        const BorrowLogicAddress = "0x5d834EAD0a80CF3b88c06FeeD6e8E0Fcae2daEE5"
        const FlashLoanLogicAddress = "0x0A62276bFBF1Ad8443f37Da8630d407408085c8b"
        const PoolLogicAddress = "0xD5256981e08492AFc543aF2a779Af989E9f9F7e7"
        const BridgeLogicAddress = "0x57572C9e795F4B6A748EFBeAB7E0a1B9996A0A24"
        
        const pool = new Pool__factory({
            ["contracts/protocol/libraries/logic/LiquidationLogic.sol:LiquidationLogic"]: LiquidationLogicAddress,
            ["contracts/protocol/libraries/logic/SupplyLogic.sol:SupplyLogic"]: SupplyLogicAddress,
            ["contracts/protocol/libraries/logic/EModeLogic.sol:EModeLogic"]: EModeLogicAddress,
            ["contracts/protocol/libraries/logic/BorrowLogic.sol:BorrowLogic"]: BorrowLogicAddress,
            ["contracts/protocol/libraries/logic/FlashLoanLogic.sol:FlashLoanLogic"]: FlashLoanLogicAddress,
            ["contracts/protocol/libraries/logic/PoolLogic.sol:PoolLogic"]: PoolLogicAddress,
            ["contracts/protocol/libraries/logic/BridgeLogic.sol:BridgeLogic"]: BridgeLogicAddress,
        }, deployer).attach(poolAddress)

        // ===============================
        // ===============================
        // =============================== upgrade implement contract to use console.log ===============================
        // ===============================
        // ===============================
        const poolAddressProviderOwnerAddress = "0xEE56e2B3D491590B5b31738cC34d5232F378a8D5"
        const poolAddressProviderOwner = await ethers.getImpersonatedSigner(poolAddressProviderOwnerAddress)

        const poolAddressProviderAddress = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e"
        const poolAddressProvider = new PoolAddressesProvider__factory(poolAddressProviderOwner).attach(poolAddressProviderAddress)

        await deployer.sendTransaction({
            to: poolAddressProviderOwner.address,
            value: ethers.utils.parseEther("10")
        })

        const newLiquidationLogic = await new LiquidationLogic__factory(deployer).deploy()
        const newSupplyLogic = await new SupplyLogic__factory(deployer).deploy()
        const newEModeLogic = await new EModeLogic__factory(deployer).deploy()
        const newBorrowLogic = await new BorrowLogic__factory(deployer).deploy()
        const newFlashLoanLogic = await new FlashLoanLogic__factory({
            ["contracts/protocol/libraries/logic/BorrowLogic.sol:BorrowLogic"]: newBorrowLogic.address,
        }, deployer).deploy()
        const newPoolLogic = await new PoolLogic__factory(deployer).deploy()
        const newBridgeLogic = await new BridgeLogic__factory(deployer).deploy()

        const newPoolImpl = await new Pool__factory({
            ["contracts/protocol/libraries/logic/LiquidationLogic.sol:LiquidationLogic"]: newLiquidationLogic.address,
            ["contracts/protocol/libraries/logic/SupplyLogic.sol:SupplyLogic"]: newSupplyLogic.address,
            ["contracts/protocol/libraries/logic/EModeLogic.sol:EModeLogic"]: newEModeLogic.address,
            ["contracts/protocol/libraries/logic/BorrowLogic.sol:BorrowLogic"]: newBorrowLogic.address,
            ["contracts/protocol/libraries/logic/FlashLoanLogic.sol:FlashLoanLogic"]: newFlashLoanLogic.address,
            ["contracts/protocol/libraries/logic/PoolLogic.sol:PoolLogic"]: newPoolLogic.address,
            ["contracts/protocol/libraries/logic/BridgeLogic.sol:BridgeLogic"]: newBridgeLogic.address,
        }, poolAddressProviderOwner).deploy(poolAddressProvider.address)

        await poolAddressProvider.connect(poolAddressProviderOwner).setPoolImpl(newPoolImpl.address)
        // ===============================


        // ===============================
        // ===============================
        // =============================== test transfer ETH ===============================
        // ===============================
        // ===============================
        // console.log("Aave pool address", pool.address)

        // const acc1Address = "0x953EF149CA90FA1e3518C56178Cba0346d8047Bf"
        // console.log("await pool.getUserAccountData(acc1Address)", await pool.getUserAccountData(acc1Address))
        
        // const acc1 = await ethers.getImpersonatedSigner(acc1Address)
        // logEthBalance(acc1.address, await acc1.getBalance())
        
        // const acc2Address = "0x28C6c06298d514Db089934071355E5743bf21d60"

        // const acc2 = await ethers.getImpersonatedSigner(acc2Address)
        // logEthBalance(acc2.address, await acc2.getBalance())

        // const txHash = await acc2.sendTransaction({
        //     to: acc1.address,
        //     value: ethers.utils.parseEther("10")
        // })

        // logEthBalance(acc1.address, await acc1.getBalance())
        // logEthBalance(acc2.address, await acc2.getBalance())

        // ===============================

        // ===============================
        // ===============================
        // =============================== supply WETH ===============================
        // ===============================
        // ===============================

        const acc3Address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

        const acc3 = await ethers.getImpersonatedSigner(acc3Address)
        logEthBalance(acc3.address, await acc3.getBalance())
        console.log("await pool.getUserAccountData(acc1Address)", await pool.getUserAccountData(acc3Address))

        const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        const WETH = new WETH9Mocked__factory(deployer).attach(WETHAddress)
        await WETH.connect(acc3).deposit({value: ethers.utils.parseUnits("100").sub(await WETH.balanceOf(acc3.address))})

        const reserveDataWETH = await pool.getReserveData(WETH.address)
        const aWETHAddress = reserveDataWETH.aTokenAddress;
        const aWETH = new AToken__factory(deployer).attach(aWETHAddress)

        logTokenBalance(acc3.address, await WETH.balanceOf(acc3.address), await WETH.decimals(), await WETH.symbol())
        logTokenBalance(acc3.address, await aWETH.balanceOf(acc3.address), await aWETH.decimals(), await aWETH.symbol())
        console.log("aWETH supply: ", Number(await aWETH.totalSupply()) / Number(ethers.utils.parseUnits('1', await aWETH.decimals())))
        logTokenBalance("aWETH", await WETH.balanceOf(aWETH.address), await WETH.decimals(), await WETH.symbol())
        console.log("await aWETH.scaledBalanceOf(acc3.address)", await aWETH.scaledBalanceOf(acc3.address))

        console.log("Acc3 supply processing ...")
        await WETH.connect(acc3).approve(pool.address, ethers.utils.parseUnits("100"))
        await pool.connect(acc3).supply(WETH.address, ethers.utils.parseUnits("100"), acc3.address, 0)
        
        logTokenBalance(acc3.address, await WETH.balanceOf(acc3.address), await WETH.decimals(), await WETH.symbol())
        logTokenBalance(acc3.address, await aWETH.balanceOf(acc3.address), await aWETH.decimals(), await aWETH.symbol())
        console.log("aWETH supply: ", Number(await aWETH.totalSupply()) / Number(ethers.utils.parseUnits('1', await aWETH.decimals())))
        logTokenBalance("aWETH", await WETH.balanceOf(aWETH.address), await WETH.decimals(), await WETH.symbol())
        console.log("await aWETH.scaledBalanceOf(acc3.address)", await aWETH.scaledBalanceOf(acc3.address))
        console.log("      await aWETH.balanceOf(acc3.address)", await aWETH.balanceOf(acc3.address))
        console.log("  await pool.getReserveNormalizedIncome()", await pool.getReserveNormalizedIncome(await aWETH.UNDERLYING_ASSET_ADDRESS()))

        const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        const USDC = new MintableERC20__factory(deployer).attach(USDCAddress)

        // usdc whales
        const acc4Address = "0x7713974908Be4BEd47172370115e8b1219F4A5f0"
        const acc4 = await ethers.getImpersonatedSigner(acc4Address)
        // const acc5Address = "0xf3B0073E3a7F747C7A38B36B805247B222C302A3"
        // const acc6Address = "0xAe2D4617c862309A3d75A0fFB358c7a5009c673F"
        // const acc7Address = "0xDFd5293D8e347dFe59E90eFd55b2956a1343963d"
        // const acc8Address = "0xCFFAd3200574698b78f32232aa9D63eABD290703"
        // const acc9Address = "0x51eDF02152EBfb338e03E30d65C15fBf06cc9ECC"
        logEthBalance('acc4', await acc4.getBalance())
        logTokenBalance('acc4', await USDC.balanceOf(acc4.address), await USDC.decimals(), await USDC.name())

        console.log(await pool.getUserAccountData(acc4.address))

        // acc4 supply USDC
        await USDC.connect(acc4).approve(pool.address, parseUnits('200000000', 6))
        await pool.connect(acc4).supply(USDC.address, parseUnits('200000000', 6), acc4.address, 0)
        console.log(await pool.getUserAccountData(acc4.address))

        await pool.connect(acc4).borrow(WETH.address, parseUnits('10'), 2, 0, acc4.address)
    })
})
