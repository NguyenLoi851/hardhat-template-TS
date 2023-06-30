// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;
pragma experimental ABIEncoderV2;

import {SeniorPoolBaseTest} from "../BaseSeniorPool.t.sol";
import {TestTranchedPool} from "../../TestTranchedPool.sol";
import {IPoolTokens} from "../../../interfaces/IPoolTokens.sol";

contract SeniorPoolRedeemTest is SeniorPoolBaseTest {
  function testRedeemRedeemsMaximumFromTranchedPool() public {
    (TestTranchedPool tp, ) = defaultTp();
    depositToTpFrom(GF_OWNER, usdcVal(100), tp);
    lockJuniorCap(tp);
    depositToSpFrom(GF_OWNER, usdcVal(400));
    uint256 poolToken = sp.invest(tp);
    lock(tp);
    drawdownTp(usdcVal(100), tp);

    vm.warp(tp.creditLine().termEndTime());

    payTp(usdcVal(105), tp);

    uint256 spUsdcBefore = usdc.balanceOf(address(sp));
    uint256 reserveUsdcBefore = usdc.balanceOf(TREASURY);
    IPoolTokens.TokenInfo memory tokenBefore = poolTokens.getTokenInfo(poolToken);

    sp.redeem(poolToken);

    uint256 principalRedeemed = poolTokens.getTokenInfo(poolToken).principalRedeemed -
      tokenBefore.principalRedeemed;
    // Junior contributed 100$, senior levered by 4x (400$). Total limit 500$. Since
    // everything was paid back, senior can redeem full amount.
    uint256 principalRedeemedExpected = usdcVal(400);
    uint256 interestRedeemed = poolTokens.getTokenInfo(poolToken).interestRedeemed -
      tokenBefore.interestRedeemed;
    // $5 of interest * (4/5) * (1 - (0.2 + 0.1)) = $2.8 where 0.2 is juniorFeePercent and 0.1 is protocolFee
    uint256 interestRedeemedExpected = usdcVal(2) + (usdcVal(1) / 100) * 80;

    assertEq(principalRedeemed, principalRedeemedExpected);
    assertEq(interestRedeemed, interestRedeemedExpected);
    assertEq(
      usdc.balanceOf(address(sp)),
      spUsdcBefore + principalRedeemedExpected + interestRedeemedExpected
    );
    assertEq(usdc.balanceOf(TREASURY), reserveUsdcBefore);
  }

  function testRedeemShouldAdjustSharePriceBasedOnInterestRedeemed() public {
    (TestTranchedPool tp, ) = defaultTp();
    depositToTpFrom(GF_OWNER, usdcVal(100), tp);
    lockJuniorCap(tp);
    depositToSpFrom(GF_OWNER, usdcVal(400));
    uint256 poolToken = sp.invest(tp);
    lock(tp);
    drawdownTp(usdcVal(100), tp);

    vm.warp(tp.creditLine().termEndTime());

    payTp(usdcVal(105), tp);

    uint256 sharePriceBefore = sp.sharePrice();
    IPoolTokens.TokenInfo memory tokenBefore = poolTokens.getTokenInfo(poolToken);

    sp.redeem(poolToken);

    uint256 interestRedeemed = poolTokens.getTokenInfo(poolToken).interestRedeemed -
      tokenBefore.interestRedeemed;
    uint256 sharePriceExpected = (((interestRedeemed * sp.fiduMantissa()) / sp.usdcMantissa()) *
      sp.fiduMantissa()) /
      fidu.totalSupply() +
      sharePriceBefore;

    assertTrue(sp.sharePrice() > sharePriceBefore);
    assertEq(sp.sharePrice(), sharePriceExpected);
  }

  function testRedeemEmitsInterestPrincipalCollected() public {
    (TestTranchedPool tp, ) = defaultTp();
    depositToTpFrom(GF_OWNER, usdcVal(100), tp);
    lockJuniorCap(tp);
    depositToSpFrom(GF_OWNER, usdcVal(400));
    uint256 poolToken = sp.invest(tp);
    lock(tp);
    drawdownTp(usdcVal(100), tp);

    vm.warp(tp.creditLine().termEndTime());

    payTp(usdcVal(105), tp);

    // $5 of interest * (4/5) * (1 - (0.2 + 0.1)) = $2.8 where 0.2 is juniorFeePercent and 0.1 is protocolFee
    uint256 interestRedeemedExpected = usdcVal(2) + (usdcVal(1) / 100) * 80;
    vm.expectEmit(true, false, false, true);
    emit InterestCollected(address(tp), interestRedeemedExpected);

    // Junior contributed 100$, senior levered by 4x (400$). Total limit 500$. Since
    // everything was paid back, senior can redeem full amount.
    uint256 principalRedeemedExpected = usdcVal(400);
    vm.expectEmit(true, false, false, true);
    emit PrincipalCollected(address(tp), principalRedeemedExpected);

    sp.redeem(poolToken);
  }

  function testRedeemIncreasesUsdcAvailableByAmountRedeemed() public {
    (TestTranchedPool tp, ) = defaultTp();
    depositToTpFrom(GF_OWNER, usdcVal(100), tp);
    lockJuniorCap(tp);
    depositToSpFrom(GF_OWNER, usdcVal(400));
    uint256 poolToken = sp.invest(tp);
    lock(tp);
    drawdownTp(usdcVal(100), tp);

    vm.warp(tp.creditLine().termEndTime());

    payTp(usdcVal(105), tp);

    // $5 of interest * (4/5) * (1 - (0.2 + 0.1)) = $2.8 where 0.2 is juniorFeePercent and 0.1 is protocolFee
    uint256 interestRedeemedExpected = usdcVal(2) + (usdcVal(1) / 100) * 80;
    // Junior contributed 100$, senior levered by 4x (400$). Total limit 500$. Since
    // everything was paid back, senior can redeem full amount.
    uint256 principalRedeemedExpected = usdcVal(400);

    uint256 usdcAvailableBefore = sp.usdcAvailable();
    sp.redeem(poolToken);

    assertEq(
      sp.usdcAvailable(),
      usdcAvailableBefore + interestRedeemedExpected + principalRedeemedExpected
    );
  }
}
