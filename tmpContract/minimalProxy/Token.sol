// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20{
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol){
        _mint(msg.sender, 1000000000000000);
    }

    function mint(address _recipient, uint _amount) public {
        _mint(_recipient, _amount);
    }
}