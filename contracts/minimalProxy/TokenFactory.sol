// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Token.sol";

contract TokenFactory {
    using Clones for address;
    address public implementationToken;
    address[] public tokens;
    function setImplementationToken(address _implement) public {
        implementationToken = _implement;
    }
    function registerToken() public returns(address newToken){
        newToken = Clones.clone(implementationToken);
        Token(newToken).mint(msg.sender, 3000000000);
        tokens.push(newToken);
    }
}

