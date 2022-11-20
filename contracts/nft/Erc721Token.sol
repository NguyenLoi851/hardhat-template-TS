// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Erc721Token is ERC721, ERC721URIStorage{
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_){
        
    }

    function _burn(uint tokenId) internal virtual override(ERC721, ERC721URIStorage){
        return ERC721URIStorage._burn(tokenId);
    }

    function tokenURI(uint tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory){
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function setTokenURI(uint tokenId, string memory _tokenURI) external virtual {
        return ERC721URIStorage._setTokenURI(tokenId, _tokenURI);
    }

    function safeMint(address to, uint tokenId) external virtual{
        return ERC721._safeMint(to, tokenId);
    }
}