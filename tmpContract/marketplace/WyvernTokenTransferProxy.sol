pragma solidity 0.4.26;

import "./registry/TokenTransferProxy.sol";

contract WyvernTokenTransferProxy is TokenTransferProxy {

    constructor (ProxyRegistry registryAddr)
        public
    {
        registry = registryAddr;
    }

}