// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20{
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol){}

    function mint(address _to, uint _amount) public {
        _mint(_to, _amount);
    }
}