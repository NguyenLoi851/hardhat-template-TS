// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EscrowToken is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol){

    }

    function mint(address _to, uint _amount) external {
        _mint(_to, _amount);
    }
}