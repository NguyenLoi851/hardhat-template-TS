import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { logEthBalance, logTokenBalance, maxUint256, sign } from "../utils";

import { ERC20 } from "../../typechain-types/contracts/swap/core/test/ERC20";
import { ERC20__factory } from "../../typechain-types/factories/contracts/swap/core/test/ERC20__factory";

import { UniswapV2Factory } from "../../typechain-types/contracts/swap/core/UniswapV2Factory";
import { UniswapV2Factory__factory } from "../../typechain-types/factories/contracts/swap/core/UniswapV2Factory__factory";

import { UniswapV2Router02 } from "../../typechain-types/contracts/swap/periphery/UniswapV2Router02";
import { UniswapV2Router02__factory } from "../../typechain-types/factories/contracts/swap/periphery/UniswapV2Router02__factory";

import { WETH9 } from "../../typechain-types/contracts/swap/periphery/test/WETH9";
import { WETH9__factory } from "../../typechain-types/factories/contracts/swap/periphery/test/WETH9__factory";

import { CalHash } from "../../typechain-types/contracts/swap/core/test/Bytecode.sol";
import { CalHash__factory } from "../../typechain-types/factories/contracts/swap/core/test/Bytecode.sol";

import { UniswapV2Pair } from "../../typechain-types/contracts/swap/core/UniswapV2Pair";
import { UniswapV2Pair__factory } from "../../typechain-types/factories/contracts/swap/core/UniswapV2Pair__factory";

describe("Swap", () => {
  async function deployFixture() {
    let deployer: SignerWithAddress;
    let feeRecipient: SignerWithAddress;
    let feeSetter: SignerWithAddress;
    let users: SignerWithAddress[];
    let tokenA: ERC20;
    let tokenB: ERC20;
    let tokenC: ERC20;
    let factory: UniswapV2Factory;
    let wETH: WETH9;
    let router: UniswapV2Router02;
    // let pair: UniswapV2Pair

    [deployer, feeRecipient, feeSetter, ...users] = await ethers.getSigners();

    factory = await new UniswapV2Factory__factory(deployer).deploy(
      feeSetter.address
    );

    wETH = await new WETH9__factory(deployer).deploy();

    router = await new UniswapV2Router02__factory(deployer).deploy(
      factory.address,
      wETH.address
    );

    // start
    tokenA = await new ERC20__factory(deployer).deploy(
      ethers.utils.parseUnits("10000000")
    );
    await tokenA
      .connect(deployer)
      .transfer(users[0].address, ethers.utils.parseUnits("1000000"));
    await tokenA
      .connect(deployer)
      .transfer(users[1].address, ethers.utils.parseUnits("1000000"));
    await tokenA
      .connect(deployer)
      .transfer(users[2].address, ethers.utils.parseUnits("1000000"));

    await tokenA.connect(users[0]).approve(router.address, maxUint256);
    await tokenA.connect(users[1]).approve(router.address, maxUint256);
    await tokenA.connect(users[2]).approve(router.address, maxUint256);

    // -------------------------------------------

    tokenB = await new ERC20__factory(deployer).deploy(
      ethers.utils.parseUnits("10000000")
    );

    await tokenB
      .connect(deployer)
      .transfer(users[0].address, ethers.utils.parseUnits("1000000"));
    await tokenB
      .connect(deployer)
      .transfer(users[1].address, ethers.utils.parseUnits("1000000"));
    await tokenB
      .connect(deployer)
      .transfer(users[2].address, ethers.utils.parseUnits("1000000"));

    await tokenB.connect(users[0]).approve(router.address, maxUint256);
    await tokenB.connect(users[1]).approve(router.address, maxUint256);
    await tokenB.connect(users[2]).approve(router.address, maxUint256);

    // -------------------------------------------

    tokenC = await new ERC20__factory(deployer).deploy(
      ethers.utils.parseUnits("10000000")
    );
    await tokenC
      .connect(deployer)
      .transfer(users[0].address, ethers.utils.parseUnits("1000000"));
    await tokenC
      .connect(deployer)
      .transfer(users[1].address, ethers.utils.parseUnits("1000000"));
    await tokenC
      .connect(deployer)
      .transfer(users[2].address, ethers.utils.parseUnits("1000000"));

    await tokenC.connect(users[0]).approve(router.address, maxUint256);
    await tokenC.connect(users[1]).approve(router.address, maxUint256);
    await tokenC.connect(users[2]).approve(router.address, maxUint256);

    /**
     * tokenA{
     * deployer: 10000000-7000000
     * user0: 1000000
     * user1: 1000000
     * user2: 1000000
     * }
     *
     * tokenB{
     * deployer: 10000000-7000000
     * user0: 1000000
     * user1: 1000000
     * user2: 1000000
     * }
     *
     * tokenC{
     * deployer: 10000000-7000000
     * user0: 1000000
     * user1: 1000000
     * user2: 1000000
     * }
     *
     * 1 tokenA = 100 tokenB = 90 tokenC
     */

    return {
      deployer,
      feeRecipient,
      feeSetter,
      users,
      tokenA,
      tokenB,
      tokenC,
      factory,
      router,
      wETH,
    };
  }

  xit("Should get byte code of pair contract", async () => {
    const { deployer } = await loadFixture(deployFixture);
    let calHash: CalHash;
    calHash = await new CalHash__factory(deployer).deploy();
    console.log(await calHash.getInitHash());
  });

  it("Should with token-token-noFeeOnTransfer / add, remove, remove&permit", async () => {
    const {
      deployer,
      feeRecipient,
      feeSetter,
      users,
      tokenA,
      tokenB,
      tokenC,
      factory,
      router,
    } = await loadFixture(deployFixture);

    // console.log(deployer.address);
    // logTokenBalance('deployer', await tokenA.balanceOf(deployer.address))
    // console.log(tokenA.address)
    // console.log(tokenB.address)
    // console.log(await factory.allPairsLength())

    // await factory.connect(users[0]).createPair(tokenA.address, tokenB.address);

    // console.log(await pairAB.getReserves())

    // console.log(await factory.allPairsLength())
    // await factory.connect(users[0]).createPair(tokenB.address, tokenA.address)
    // console.log(await factory.allPairsLength())

    const deadline = +(Date.now() / 1000).toFixed() + 3 * 24 * 60 * 60;
    await router
      .connect(users[0])
      .addLiquidity(
        tokenA.address,
        tokenB.address,
        ethers.utils.parseUnits("100"),
        ethers.utils.parseUnits("10000"),
        ethers.BigNumber.from("1000"),
        ethers.BigNumber.from("1000"),
        users[0].address,
        deadline
      );

    const pairAddressAB = await factory.getPair(tokenA.address, tokenB.address);
    const pairAB = new UniswapV2Pair__factory(deployer).attach(pairAddressAB);
    // console.log(pairAddressAB)
    // console.log("Reserves of pairAB", await pairAB.getReserves());
    // logTokenBalance("user 0", await pairAB.balanceOf(users[0].address));

    await router
      .connect(users[1])
      .addLiquidity(
        tokenA.address,
        tokenB.address,
        ethers.utils.parseUnits("10"),
        ethers.utils.parseUnits("1000"),
        ethers.BigNumber.from("1000"),
        ethers.BigNumber.from("1000"),
        users[1].address,
        deadline
      );

    await router
      .connect(users[2])
      .addLiquidity(
        tokenA.address,
        tokenB.address,
        ethers.utils.parseUnits("110"),
        ethers.utils.parseUnits("12000"),
        ethers.BigNumber.from("1000"),
        ethers.BigNumber.from("1000"),
        users[2].address,
        deadline
      );

    console.log("Reserves of pairAB", await pairAB.getReserves());
    console.log(">> PairAB Token: ");
    logTokenBalance("user 0", await pairAB.balanceOf(users[0].address));
    logTokenBalance("user 1", await pairAB.balanceOf(users[1].address));
    logTokenBalance("user 2", await pairAB.balanceOf(users[2].address));

    console.log(">> TokenA: ");
    logTokenBalance("user 0", await tokenA.balanceOf(users[0].address));
    logTokenBalance("user 1", await tokenA.balanceOf(users[1].address));
    logTokenBalance("user 2", await tokenA.balanceOf(users[2].address));

    console.log(">> TokenB: ");
    logTokenBalance("user 0", await tokenB.balanceOf(users[0].address));
    logTokenBalance("user 1", await tokenB.balanceOf(users[1].address));
    logTokenBalance("user 2", await tokenB.balanceOf(users[2].address));

    console.log(">> TokenC: ");
    logTokenBalance("user 0", await tokenC.balanceOf(users[0].address));
    logTokenBalance("user 1", await tokenC.balanceOf(users[1].address));
    logTokenBalance("user 2", await tokenC.balanceOf(users[2].address));

    // await pairAB.connect(users[0]).approve(router.address, maxUint256);
    await pairAB.connect(users[1]).approve(router.address, maxUint256);
    await pairAB.connect(users[2]).approve(router.address, maxUint256);

    await router
      .connect(users[1])
      .removeLiquidity(
        tokenA.address,
        tokenB.address,
        ethers.utils.parseUnits("10"),
        ethers.BigNumber.from("1000"),
        ethers.BigNumber.from("1000"),
        users[1].address,
        deadline
      );

    console.log("\n>> User 1 remove liquidity: ");
    logTokenBalance("user 1", await pairAB.balanceOf(users[1].address));
    logTokenBalance("user 1", await tokenA.balanceOf(users[1].address));
    logTokenBalance("user 1", await tokenB.balanceOf(users[1].address));

    const signature1 = await sign(
      users[0],
      await pairAB.name(),
      pairAB.address,
      users[0].address,
      router.address,
      maxUint256,
      await pairAB.nonces(users[0].address),
      deadline
    );
    const splitedSignature1 = ethers.utils.splitSignature(signature1);

    await router
      .connect(users[0])
      .removeLiquidityWithPermit(
        tokenA.address,
        tokenB.address,
        ethers.utils.parseUnits("200"),
        ethers.BigNumber.from("1000"),
        ethers.BigNumber.from("1000"),
        users[0].address,
        deadline,
        true,
        splitedSignature1.v,
        splitedSignature1.r,
        splitedSignature1.s
      );

      console.log("\n>> User 0 remove liquidity: ");
      logTokenBalance("user 0", await pairAB.balanceOf(users[0].address));
      logTokenBalance("user 0", await tokenA.balanceOf(users[0].address));
      logTokenBalance("user 0", await tokenB.balanceOf(users[0].address));
  });

  it("Should with ETH-token-notFeeOnTransfer / add, remove", async () => {
    const {
      deployer,
      feeRecipient,
      feeSetter,
      users,
      tokenA,
      tokenB,
      tokenC,
      factory,
      router,
      wETH,
    } = await loadFixture(deployFixture);

    // console.log(deployer.address);
    // logTokenBalance('deployer', await tokenA.balanceOf(deployer.address))
    // console.log(tokenA.address)
    // console.log(tokenB.address)
    // console.log(await factory.allPairsLength())

    // await factory.connect(users[0]).createPair(tokenA.address, tokenB.address);

    // console.log(await pairAB.getReserves())

    // console.log(await factory.allPairsLength())
    // await factory.connect(users[0]).createPair(tokenB.address, tokenA.address)
    // console.log(await factory.allPairsLength())

    console.log(">> ETH");
    logEthBalance("user 0", await users[0].getBalance());
    logEthBalance("user 1", await users[1].getBalance());
    logEthBalance("user 2", await users[2].getBalance());

    const deadline = +(Date.now() / 1000).toFixed() + 3 * 24 * 60 * 60;
    // await router
    //     .connect(users[0])
    //     .addLiquidity(
    //         tokenA.address,
    //         tokenB.address,
    //         ethers.utils.parseUnits("100"),
    //         ethers.utils.parseUnits("10000"),
    //         ethers.BigNumber.from("1000"),
    //         ethers.BigNumber.from("1000"),
    //         users[0].address,
    //         deadline
    //     );

    await router
      .connect(users[0])
      .addLiquidityETH(
        tokenA.address,
        ethers.utils.parseUnits("90"),
        ethers.BigNumber.from("1000"),
        ethers.BigNumber.from("1000"),
        users[0].address,
        deadline,
        { value: ethers.utils.parseUnits("9000") }
      );

    const pairAddressA_Eth = await factory.getPair(
      tokenA.address,
      wETH.address
    );
    const pairA_Eth = new UniswapV2Pair__factory(deployer).attach(
      pairAddressA_Eth
    );
    // console.log(pairAddressAB)
    // console.log("Reserves of pairAB", await pairAB.getReserves());
    // logTokenBalance("user 0", await pairAB.balanceOf(users[0].address));

    await router
      .connect(users[1])
      .addLiquidityETH(
        tokenA.address,
        ethers.utils.parseUnits("10"),
        ethers.BigNumber.from("1000"),
        ethers.BigNumber.from("1000"),
        users[1].address,
        deadline,
        { value: ethers.utils.parseUnits("1100") }
      );

    await router
      .connect(users[2])
      .addLiquidityETH(
        tokenA.address,
        ethers.utils.parseUnits("10"),
        ethers.BigNumber.from("1000"),
        ethers.BigNumber.from("1000"),
        users[2].address,
        deadline,
        { value: ethers.utils.parseUnits("2000") }
      );
    // await router
    //   .connect(users[1])
    //   .addLiquidity(
    //     tokenA.address,
    //     tokenB.address,
    //     ethers.utils.parseUnits("10"),
    //     ethers.utils.parseUnits("1000"),
    //     ethers.BigNumber.from("1000"),
    //     ethers.BigNumber.from("1000"),
    //     users[1].address,
    //     deadline
    //   );

    // await router
    //   .connect(users[2])
    //   .addLiquidity(
    //     tokenA.address,
    //     tokenB.address,
    //     ethers.utils.parseUnits("110"),
    //     ethers.utils.parseUnits("12000"),
    //     ethers.BigNumber.from("1000"),
    //     ethers.BigNumber.from("1000"),
    //     users[2].address,
    //     deadline
    //   );

    console.log("Reserves of pairA_Eth", await pairA_Eth.getReserves());
    console.log(">> PairA_Eth Token: ");
    logTokenBalance("user 0", await pairA_Eth.balanceOf(users[0].address));
    logTokenBalance("user 1", await pairA_Eth.balanceOf(users[1].address));
    logTokenBalance("user 2", await pairA_Eth.balanceOf(users[2].address));

    console.log(">> TokenA: ");
    logTokenBalance("user 0", await tokenA.balanceOf(users[0].address));
    logTokenBalance("user 1", await tokenA.balanceOf(users[1].address));
    logTokenBalance("user 2", await tokenA.balanceOf(users[2].address));

    console.log(">> TokenB: ");
    logTokenBalance("user 0", await tokenB.balanceOf(users[0].address));
    logTokenBalance("user 1", await tokenB.balanceOf(users[1].address));
    logTokenBalance("user 2", await tokenB.balanceOf(users[2].address));

    console.log(">> TokenC: ");
    logTokenBalance("user 0", await tokenC.balanceOf(users[0].address));
    logTokenBalance("user 1", await tokenC.balanceOf(users[1].address));
    logTokenBalance("user 2", await tokenC.balanceOf(users[2].address));

    console.log(">> ETH");
    logEthBalance("user 0", await users[0].getBalance());
    logEthBalance("user 1", await users[1].getBalance());
    logEthBalance("user 2", await users[2].getBalance());

    await pairA_Eth.connect(users[0]).approve(router.address, maxUint256);
    // await pairA_Eth.connect(users[1]).approve(router.address, maxUint256);
    // await pairA_Eth.connect(users[2]).approve(router.address, maxUint256);

    // await router
    //   .connect(users[1])
    //   .removeLiquidity(
    //     tokenA.address,
    //     tokenB.address,
    //     ethers.utils.parseUnits("10"),
    //     ethers.BigNumber.from("1000"),
    //     ethers.BigNumber.from("1000"),
    //     users[1].address,
    //     deadline
    //   );

    await router
      .connect(users[0])
      .removeLiquidityETH(
        tokenA.address,
        ethers.utils.parseUnits("5"),
        ethers.BigNumber.from("1000"),
        ethers.BigNumber.from("1000"),
        users[0].address,
        deadline
      );

    console.log("\n>> User 0 remove liquidity: ");
    logTokenBalance("user 0", await pairA_Eth.balanceOf(users[0].address));
    logTokenBalance("user 0", await tokenA.balanceOf(users[0].address));
    logTokenBalance("user 0", await tokenB.balanceOf(users[0].address));
    logEthBalance("user 0", await users[0].getBalance());

    const signature1 = await sign(users[1], await pairA_Eth.name(), pairA_Eth.address, users[1].address, router.address, maxUint256, await pairA_Eth.nonces(users[1].address), deadline);
    const splitedSignature1 = ethers.utils.splitSignature(signature1)

    await router.connect(users[1]).removeLiquidityETHWithPermit(tokenA.address, ethers.utils.parseUnits('50'), ethers.BigNumber.from('1000'), ethers.BigNumber.from('1000'), users[1].address, deadline, true, splitedSignature1.v, splitedSignature1.r, splitedSignature1.s)

    console.log("\n>> User 1 remove liquidity: ");
    logTokenBalance("user 1", await pairA_Eth.balanceOf(users[1].address));
    logTokenBalance("user 1", await tokenA.balanceOf(users[1].address));
    logTokenBalance("user 1", await tokenB.balanceOf(users[1].address));
    logEthBalance("user 1", await users[1].getBalance());
  });
});
