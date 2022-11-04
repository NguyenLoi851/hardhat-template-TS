// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20{
    constructor() ERC20("Hehe","HEHE"){
        _mint(msg.sender, 100000000000000000000000000000000000000);
    }

    function mint(address _to,uint _amount) public {
        _mint(_to, _amount);
    }
}