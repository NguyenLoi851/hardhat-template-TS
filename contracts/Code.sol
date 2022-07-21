// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Code is ERC20, Ownable{

    uint256 public mintCnt = 0;

    event MintFirstTime(address owner, uint256 amount, string name, string symbol);
    event MintTo(address owner, uint256 amount, uint256 mintCnt);

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol){
        address owner = msg.sender;
        uint256 amount = 50000000000000000000000000;
        _mint(owner, amount);
        emit MintFirstTime(owner, amount, _name, _symbol);
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        mintCnt += 1;
        emit MintTo(to, amount, mintCnt);
    }
}

// contract address: 0x09242411820816D036d4cCcD8554CE1ACA7dE7B2