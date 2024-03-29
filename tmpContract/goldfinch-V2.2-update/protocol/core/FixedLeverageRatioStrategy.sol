// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;


import "./BaseUpgradeablePausable.sol";
import "./ConfigHelper.sol";
import "./LeverageRatioStrategy.sol";
import "../../interfaces/ISeniorPoolStrategy.sol";
import "../../interfaces/ISeniorPool.sol";
import "../../interfaces/ITranchedPool.sol";

// import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FixedLeverageRatioStrategy is LeverageRatioStrategy {
  GoldfinchConfig public config;
  using ConfigHelper for GoldfinchConfig;

  event GoldfinchConfigUpdated(address indexed who, address configAddress);

  function initialize(address owner, GoldfinchConfig _config) public initializer {
    require(owner != address(0) && address(_config) != address(0), "Owner and config addresses cannot be empty");
    __BaseUpgradeablePausable__init(owner);
    config = _config;
  }

  function updateGoldfinchConfig() external onlyAdmin {
    config = GoldfinchConfig(config.configAddress());
    emit GoldfinchConfigUpdated(msg.sender, address(config));
  }

  function getLeverageRatio(ITranchedPool pool) public view override returns (uint256) {
    return config.getLeverageRatio();
  }
}
