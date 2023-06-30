// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract MyVRF is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface public COORDINATOR;
    address public s_owner;

    uint64 s_subscriptionId;
    address vrfCoordinator = 0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D;
    bytes32 s_keyHash =
        0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15;
    uint32 callbackGasLimit = 40000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    uint256 private constant ROLL_IN_PROGRESS = 42;

    event DiceRolled(uint256 indexed requestId, address indexed roller);
    event DiceLanded(uint256 indexed requestId, uint256 indexed result);

    mapping(uint256 => address) private s_rollers;
    mapping(address => uint256) private s_results;

    // constructor
    constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
    }

    //...
    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }

    function rollDice(address roller)
        public
        onlyOwner
        returns (uint256 requestId)
    {
        require(s_results[roller] == 0, "Already rolled");
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_rollers[requestId] = roller;
        s_results[roller] = ROLL_IN_PROGRESS;
        emit DiceRolled(requestId, roller);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        // transform the result to a number between 1 and 20 inclusively
        uint256 d20Value = (randomWords[0] % 20) + 1;

        // assign the transformed value to the address in the s_results mapping variable
        s_results[s_rollers[requestId]] = d20Value;

        // emitting event to signal that dice landed
        emit DiceLanded(requestId, d20Value);
    }

    function house(address player) public view returns (string memory) {
        // dice has not yet been rolled to this address
        require(s_results[player] != 0, "Dice not rolled");

        // not waiting for the result of a thrown dice
        require(s_results[player] != ROLL_IN_PROGRESS, "Roll in progress");

        // returns the house name from the name list function
        return getHouseName(s_results[player]);
    }

    function getHouseName(uint256 id) private pure returns (string memory) {
        // array storing the list of house's names
        string[20] memory houseNames = [
            "Targaryen",
            "Lannister",
            "Stark",
            "Tyrell",
            "Baratheon",
            "Martell",
            "Tully",
            "Bolton",
            "Greyjoy",
            "Arryn",
            "Frey",
            "Mormont",
            "Tarley",
            "Dayne",
            "Umber",
            "Valeryon",
            "Manderly",
            "Clegane",
            "Glover",
            "Karstark"
        ];

        // returns the house name given an index
        return houseNames[id - 1];
    }
}
