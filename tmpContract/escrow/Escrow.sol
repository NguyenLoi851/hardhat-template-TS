// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {

    using SafeERC20 for IERC20;

    struct EscrowItem {
        address owner; // from - owner
        IERC20 token1;
        IERC20 token2;
        uint amount1;
        uint amount2;
        uint64 deadline;
        bool executed;
        bool canceled;
    }

    EscrowItem[] public escrowItemList;

    function initEscrowItem(address _token1, address _token2, uint _amount1, uint _amount2, uint64 _deadline) external {
        EscrowItem memory newEscrowItem = EscrowItem({
            owner: msg.sender, token1: IERC20(_token1), token2: IERC20(_token2),
            amount1: _amount1, amount2: _amount2, deadline: _deadline, 
            executed: false, canceled: false
        });

        escrowItemList.push(newEscrowItem);
    }

    function updateEscrowItem(uint _escrowItemId, address _token1, address _token2, uint _amount1, uint _amount2, uint64 _deadline) external {
        EscrowItem storage escrowItem = escrowItemList[_escrowItemId];
        require(msg.sender == escrowItem.owner, "Revert: Not owner");
        require(escrowItem.executed == false, "Revert: Executed");
        require(escrowItem.canceled == false, "Revert: Canceled");
        escrowItem.token1 = IERC20(_token1);
        escrowItem.token2 = IERC20(_token2);
        escrowItem.amount1 = _amount1;
        escrowItem.amount2 = _amount2;
        escrowItem.deadline = _deadline;
    }

    function cancelEscrowItem(uint _escrowItemId) external {
        EscrowItem storage escrowItem = escrowItemList[_escrowItemId];
        require(msg.sender == escrowItem.owner, "Revert: Not owner");
        require(escrowItem.executed == false, "Revert: Executed");
        require(escrowItem.canceled == false, "Revert: Canceled");
        escrowItem.canceled = true; 
    }

    function executeEscrow(uint _escrowItemId, uint amount1) external {
        EscrowItem storage escrowItem = escrowItemList[_escrowItemId];
        require(escrowItem.executed == false, "Revert: Executed");
        require(escrowItem.canceled == false, "Revert: Canceled");
        require(escrowItem.amount1 >= amount1, "Revert: Not enough amount"); // front-run by update function
        require(block.timestamp <= escrowItem.deadline, "Revert: Expired");
        
        escrowItem.token1.safeTransferFrom(escrowItem.owner, msg.sender, escrowItem.amount1);
        escrowItem.token2.safeTransferFrom(msg.sender, escrowItem.owner, escrowItem.amount2);

        escrowItem.executed = true;
    }

    function executeEscrow2(uint _escrowItemId, uint amount1) external {
        EscrowItem storage escrowItem = escrowItemList[_escrowItemId];
        require(escrowItem.executed == false, "Revert: Executed");
        require(escrowItem.canceled == false, "Revert: Canceled");
        require(block.timestamp <= escrowItem.deadline, "Revert: Expired");
        require(escrowItem.amount1 >= amount1, "Revert: Not enough amount"); // front-run by update function
        
        escrowItem.token1.safeTransfer(msg.sender, escrowItem.amount1);
        escrowItem.token2.safeTransfer(escrowItem.owner, escrowItem.amount2);

        escrowItem.executed = true;
    }
}