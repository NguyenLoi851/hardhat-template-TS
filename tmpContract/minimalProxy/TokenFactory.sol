// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Token.sol";

contract TokenFactory {
    using Clones for address;
    address public implementationToken;
    address[] public tokens;
    uint public index;

    function increaseIndex() public {
        index += 1;
    }

    function setImplementationToken(address _implement) public {
        implementationToken = _implement;
    }
    
    function registerToken() public returns(address newToken){
        bytes32 salt = keccak256(abi.encode(index));
        newToken = Clones.cloneDeterministic(implementationToken, salt);
        Token(newToken).mint(msg.sender, 3000000000);
        tokens.push(newToken);
    }
}

