// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

interface IBorrower {
  function initialize(address owner, address _config) external;
}
