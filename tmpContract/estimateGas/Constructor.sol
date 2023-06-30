// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract Constructor {
    uint[][] public paymentDates;
    constructor(uint[][] memory _paymentDates) {
        paymentDates = _paymentDates;
    }
}
