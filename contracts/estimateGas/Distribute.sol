// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Distribute {
    error LengthOfTwoArraysNotEqual();
    error ZeroElements();

    IERC20 public token;
    constructor(address _token){
        token = IERC20(_token);
    }
    function distribute(address[] memory accounts, uint[] memory amounts) public{
        if(accounts.length != amounts.length){
            revert LengthOfTwoArraysNotEqual();
        }
        if(accounts.length == 0){
            revert ZeroElements();
        }
        uint length = accounts.length;
        for(uint i=0;i<length;++i){
            IERC20(token).transfer(accounts[i], amounts[i]);
        }
    }
}