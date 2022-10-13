// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PoolStakingStorage {
    // Info of each user.
    struct UserInfo {
        uint256 amount;     // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.

        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accRewardPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken;           // Address of LP token contract.
        uint256 allocPoint;       // How many allocation points assigned to this pool. REWARDs to distribute per block.
        uint256 lastRewardBlock;  // Last block number that REWARDs distribution occurs.
        uint256 accRewardPerShare; // Accumulated REWARDs per share, times 1e12. See below.
    }

    // The Reward TOKEN!
    IERC20 public rewardToken;
    // Dev address.
    address public devaddr;
    // Block number when bonus REWARD period ends.
    uint256 public bonusEndBlock;
    // REWARD tokens created per block.
    uint256 public rewardPerBlock;
    // Bonus muliplier for early staker.
    uint256 public constant BONUS_MULTIPLIER = 10;

    uint256 public constant REWARD_PRECISION = 1e12;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping (uint256 => mapping (address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when REWARD mining starts.
    uint256 public startBlock;
}