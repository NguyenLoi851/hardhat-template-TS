// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../utils/Pausable.sol";
import "../utils/ReentrancyGuard.sol";
import "../extensions/IgnitionList.sol";
import "../libraries/SafeCast.sol";
import "../interfaces/IIgnitionFactory.sol";
import "../utils/Initializable.sol";
import "../interfaces/IPool.sol";
import {Errors} from "../helpers/Errors.sol";
import "../logics/PoolLogic.sol";

contract Pool is Pausable, ReentrancyGuard, IgnitionList, Initializable, IPool {
    using SafeERC20 for IERC20;
    using SafeCast for uint;

    /// @dev rate and decimal to display price of IDO token
    struct OfferedCurrency {
        uint rate;
        uint decimal;
    }

    /// @dev keccak256("WHALE")
    bytes32 public constant WHALE =
        0xed4b80c86c7954bdbf516c492acb4a2899eb0ee85b7c74e26d85e55a07562c95;

    /// @dev keccak256("NORMAL_USER")
    bytes32 public constant NORMAL_USER =
        0x13e31188d81b941f4c541528790db4031bef078b78d364bde6fc2d4e5ad79e01;

    /// @dev Percentage denominator
    uint16 public constant PERCENTAGE_DENOMINATOR = 10000;

    /// @dev Address of pool factory
    IIgnitionFactory public ignitionFactory;

    /// @dev Address of IDO token
    IERC20 public IDOToken;

    /// @dev Address of purchase token
    IERC20 public purchaseToken;

    /// @dev Store rate and decimal to display price of IDO token
    OfferedCurrency public offeredCurrency;

    /// @dev Max purchase amount for galaxy pool = total raise amount * galaxy pool proportion
    uint public maxPurchaseAmountForGalaxyPool;

    /// @dev Max purchase amount for early access = (total raise amount - total raise amount * galaxy pool proportion) * early access proportion
    uint public maxPurchaseAmountForEarlyAccess;

    /// @dev Max purchase amount for KYC user
    uint public maxPurchaseAmountForKYCUser;

    /// @dev Max purchase amount for NOT KYC user
    uint public maxPurchaseAmountForNotKYCUser;

    /// @dev Time for user to redeem IDO token
    uint64 public TGEDate;

    /// @dev Percentage of IDO token amount of user, which can be redeemed after TGEDate
    uint16 public TGEPercentage;

    /// @dev Fee percentage when buying token in galaxy pool
    uint16 public galaxyParticipationFeePercentage;

    /// @dev Fee percentage when buying token in crowdfunding pool
    uint16 public crowdfundingParticipationFeePercentage;

    /// @dev Proportion of total raise for galaxy pool
    uint16 public galaxyPoolProportion;

    /// @dev Proportion of crowdfunding pool amount for early access
    uint16 public earlyAccessProportion;

    /// @dev Status whether or not investor can redeem IDO token
    bool public TGERedeemable;

    /// @dev Total raise amount of all pools
    uint public totalRaiseAmount;

    /// @dev Open time of galaxy pool
    uint64 public whaleOpenTime;

    /// @dev Close time of galaxy pool
    uint64 public whaleCloseTime;

    /// @dev Open time for community user = Close time of galaxy pool
    uint64 public communityOpenTime;

    /// @dev Close time of crowdfunding pool
    uint64 public communityCloseTime;

    /// @dev Purchased amount in galaxy pool
    uint public purchasedAmountInGalaxyPool;

    /// @dev Purchased amount in early access
    uint public purchasedAmountInEarlyAccess;

    /// @dev Purchased amount in all pools
    uint public purchasedAmount;

    /// @dev Mapping from User to purchased amount
    mapping(address => uint) public userPurchasedAmount;

    /// @dev Mapping from User to redeemed or not
    mapping(address => bool) public redeemed;

    event UpdateRoot(bytes32 root);
    event UpdateOpenPoolStatus(address indexed pool, bool status);

    event BuyToken(
        address indexed buyer,
        address indexed pool,
        address indexed IDOToken,
        uint purchaseAmount,
        uint8 poolType
    );

    event UpdateTime(
        uint64 whaleOpenTime,
        uint64 whaleCloseTime,
        uint64 communityOpenTime,
        uint64 communityCloseTime
    );

    /**
     * @dev Check whether or not sender of transaction has admin role
     */
    modifier onlyAdmin() {
        require(
            ignitionFactory.hasRole(ignitionFactory.ADMIN(), _msgSender()),
            Errors.CALLER_NOT_ADMIN
        );
        _;
    }

    /**
     * @notice Initialize a pool with its information
     * @dev Emit 2 events
     * @param addrs Array of address includes: address of IDO token, address of purchase token
     * @param uints Array of pool information includes: max purchase amount for KYC user, max purchase amount for Not KYC user, TGE date, TGE percentage,
     * galaxy participation fee percentage, crowdfunding participation fee percentage, galaxy pool proportion, early access proportion,
     * total raise amount, whale open time, whale duration, community duration, rate and decimal of IDO token
     */
    function initialize(
        address[2] memory addrs,
        uint[14] memory uints
    ) external initializer {
        _verifyPoolInfo(addrs, uints);
        {
            ignitionFactory = IIgnitionFactory(_msgSender());
        }
        {
            address _IDOToken = addrs[0];
            address _purchaseToken = addrs[1];
            IDOToken = IERC20(_IDOToken);
            purchaseToken = IERC20(_purchaseToken);
        }
        {
            uint _maxPurchaseAmountForKYCUser = uints[0];
            uint _maxPurchaseAmountForNotKYCUser = uints[1];
            maxPurchaseAmountForKYCUser = _maxPurchaseAmountForKYCUser;
            maxPurchaseAmountForNotKYCUser = _maxPurchaseAmountForNotKYCUser;
        }
        {
            uint _TGEDate = uints[2];
            uint _TGEPercentage = uints[3];
            TGEDate = SafeCast.toUint64(_TGEDate);
            TGEPercentage = SafeCast.toUint16(_TGEPercentage);
        }
        {
            uint _galaxyParticipationFeePercentage = uints[4];
            uint _crowdfundingParticipationFeePercentage = uints[5];
            galaxyParticipationFeePercentage = SafeCast.toUint16(
                _galaxyParticipationFeePercentage
            );
            crowdfundingParticipationFeePercentage = SafeCast.toUint16(
                _crowdfundingParticipationFeePercentage
            );
        }
        {
            uint _galaxyPoolProportion = uints[6];
            uint _earlyAccessProportion = uints[7];
            uint _totalRaiseAmount = uints[8];
            galaxyPoolProportion = SafeCast.toUint16(_galaxyPoolProportion);
            earlyAccessProportion = SafeCast.toUint16(_earlyAccessProportion);
            totalRaiseAmount = _totalRaiseAmount;

            maxPurchaseAmountForGalaxyPool =
                (_totalRaiseAmount * _galaxyPoolProportion) /
                PERCENTAGE_DENOMINATOR;
            maxPurchaseAmountForEarlyAccess =
                (_totalRaiseAmount *
                    (PERCENTAGE_DENOMINATOR - _galaxyPoolProportion) *
                    _earlyAccessProportion) /
                PERCENTAGE_DENOMINATOR /
                PERCENTAGE_DENOMINATOR;
        }
        {
            uint _whaleOpenTime = uints[9];
            uint _whaleDuration = uints[10];
            uint _communityDuration = uints[11];
            whaleOpenTime = SafeCast.toUint64(_whaleOpenTime);
            whaleCloseTime = SafeCast.toUint64(_whaleOpenTime + _whaleDuration);
            communityOpenTime = whaleCloseTime;
            communityCloseTime = SafeCast.toUint64(
                communityOpenTime + _communityDuration
            );
        }
        {
            uint _rate = uints[12];
            uint _decimal = uints[13];
            offeredCurrency.rate = _rate;
            offeredCurrency.decimal = _decimal;
        }
    }

    /**
     * @notice Set merkle tree root after snapshoting information of investor
     * @dev Only admin can call it
     * @param _root Root of merkle tree
     */
    function setRoot(bytes32 _root) external onlyAdmin {
        root = _root;
        emit UpdateRoot(root);
    }

    /**
     * @notice Close pool: cancel project, nobody can buy token
     * @dev Only admin can call it
     */
    function closePool() external onlyAdmin {
        _pause();
        emit UpdateOpenPoolStatus(address(this), false);
    }

    /**
     * @notice Update time for galaxy pool and crowdfunding pool
     * @dev Only admin can call it, galaxy pool must be closed before crowdfunding pool
     * @param _newWhaleCloseTime New close time of galaxy pool
     * @param _newCommunityCloseTime New close time of crowdfunding pool
     */
    function updateTime(
        uint64 _newWhaleCloseTime,
        uint64 _newCommunityCloseTime
    ) external onlyAdmin {
        require(
            whaleOpenTime < _newWhaleCloseTime &&
                _newWhaleCloseTime < _newCommunityCloseTime,
            Errors.INVALID_TIME
        );

        whaleCloseTime = _newWhaleCloseTime;
        communityOpenTime = _newWhaleCloseTime;
        communityCloseTime = _newCommunityCloseTime;

        emit UpdateTime(
            whaleOpenTime,
            whaleCloseTime,
            communityOpenTime,
            communityCloseTime
        );
    }

    /**
     * @notice Investor buy token in galaxy pool
     * @dev Must be in time for whale and pool is not closed
     * @param proof Respective proof for a leaf, which is respective for investor in merkle tree
     * @param _purchaseAmount Purchase amount of investor
     * @param _maxPurchaseBaseOnAllocations Max purchase amount base on allocation of whale
     */
    function buyTokenInGalaxyPool(
        bytes32[] memory proof,
        uint _purchaseAmount,
        uint _maxPurchaseBaseOnAllocations
    ) external whenNotPaused nonReentrant {
        require(_validWhaleSession(), Errors.TIME_OUT_TO_BUY_IDO_TOKEN);

        _verifyAllowance(_msgSender(), _purchaseAmount);
        _preValidatePurchaseInGalaxyPool(
            _purchaseAmount,
            _maxPurchaseBaseOnAllocations
        );
        _internalWhaleBuyToken(
            proof,
            _purchaseAmount,
            _maxPurchaseBaseOnAllocations,
            galaxyParticipationFeePercentage,
            uint8(PoolLogic.PoolType.GALAXY_POOL)
        );
        _updatePurchasingInGalaxyPoolState(_purchaseAmount);
    }

    /**
     * @notice Investor buy token in crowdfunding pool
     * @dev Must be in time for crowdfunding pool and pool is not closed
     * @param proof Respective proof for a leaf, which is respective for investor in merkle tree
     * @param _purchaseAmount Purchase amount of investor
     */
    function buyTokenInCrowdfundingPool(
        bytes32[] memory proof,
        uint _purchaseAmount
    ) external whenNotPaused nonReentrant {
        _verifyAllowance(_msgSender(), _purchaseAmount);
        if (_validWhaleSession()) {
            _preValidatePurchaseInEarlyAccess(_purchaseAmount);
            _internalWhaleBuyToken(
                proof,
                _purchaseAmount,
                0,
                crowdfundingParticipationFeePercentage,
                uint8(PoolLogic.PoolType.EARLY_ACCESS)
            );
            _updatePurchasingInEarlyAccessState(_purchaseAmount);
            return;
        }

        require(_validCommunitySession(), Errors.TIME_OUT_TO_BUY_IDO_TOKEN);

        _preValidatePurchase(_purchaseAmount);
        _internalNormalUserBuyToken(proof, _purchaseAmount);
    }

    /**
     * @dev Get IDO token amount base on amount of purchase token
     * @param _amount Amount of purchase token
     * @return Return amount of respective IDO token
     */
    function getIDOTokenAmountByOfferedCurrency(
        uint _amount
    ) public view returns (uint) {
        return
            (_amount * offeredCurrency.rate) / (10 ** offeredCurrency.decimal);
    }

    /**
     * @dev verify information of pool: galaxy pool proportion must be greater than 0% and smaller than 100%,
     * early access must be smaller than 100%, total raise must be greater than 0
     * @param addrs Array of address includes: address of IDO token, address of purchase token
     * @param uints Array of pool information includes: max purchase amount for KYC user, max purchase amount for Not KYC user, TGE date, TGE percentage,
     * galaxy participation fee percentage, crowdfunding participation fee percentage, galaxy pool proportion, early access proportion,
     * total raise amount, whale open time, whale duration, community duration, rate and decimal of IDO token
     */
    function _verifyPoolInfo(
        address[2] memory addrs,
        uint[14] memory uints
    ) internal pure {
        // address _IDOToken = addrs[0];
        {
            address _purchaseToken = addrs[1];
            _validAddress(_purchaseToken);
        }
        {
            /*
            uint _maxPurchaseAmountForKYCUser = uints[0];
            uint _maxPurchaseAmountForNotKYCUser = uints[1];
            uint _TGEDate = uints[2];
            uint _TGEPercentage = uints[3];
            uint _galaxyParticipationFeePercentage = uints[4];
            uint _crowdfundingParticipationFeePercentage = uints[5];
            uint _galaxyPoolProportion = uints[6];
            uint _earlyAccessProportion = uints[7];
            uint _totalRaiseAmount = uints[8];
            uint _whaleOpenTime = uints[9];
            uint _whaleDuration = uints[10];
            uint _communityDuration = uints[11];
            uint _rate = uints[12];
            uint _decimal = uints[13];
            */

            uint _TGEPercentage = uints[3];
            require(
                _TGEPercentage <= PERCENTAGE_DENOMINATOR,
                Errors.INVALID_TGE_PERCENTAGE
            );

            uint _galaxyPoolProportion = uints[6];
            _validAmount(_galaxyPoolProportion);
            require(
                _galaxyPoolProportion < PERCENTAGE_DENOMINATOR,
                Errors.INVALID_GALAXY_POOL_PROPORTION
            );

            uint _earlyAccessProportion = uints[7];
            require(
                _earlyAccessProportion < PERCENTAGE_DENOMINATOR,
                Errors.INVALID_EARLY_ACCESS_PROPORTION
            );

            uint _totalRaiseAmount = uints[8];
            _validAmount(_totalRaiseAmount);
        }
    }

    /**
     * @dev Check whether or not an address is zero address
     * @param _address An address
     */
    function _validAddress(address _address) internal pure {
        require(_address != address(0), Errors.ZERO_ADDRESS_NOT_VALID);
    }

    /**
     * @dev Check whether or not an amount greater than 0
     * @param _amount An amount
     */
    function _validAmount(uint _amount) internal pure {
        require(_amount > 0, Errors.ZERO_AMOUNT_NOT_VALID);
    }

    /**
     * @dev Internal function for whale to buy token
     * @param proof Respective proof for a leaf, which is respective for investor in merkle tree
     * @param _purchaseAmount Purchase amount of investor
     * @param _maxPurchaseBaseOnAllocations Max purchase amount base on allocation of whale
     * @param _participationFeePercentage Fee percentage when buying token
     * @param _poolType 0 for galaxy pool, 1 for early access and 2 for normal user in crowdfunding pool
     */
    function _internalWhaleBuyToken(
        bytes32[] memory proof,
        uint _purchaseAmount,
        uint _maxPurchaseBaseOnAllocations,
        uint _participationFeePercentage,
        uint8 _poolType
    ) internal {
        bool verifyWithKYCed = _verifyUser(
            _msgSender(),
            WHALE,
            maxPurchaseAmountForKYCUser,
            _maxPurchaseBaseOnAllocations,
            proof
        );
        if (verifyWithKYCed) {
            _internalBuyToken(
                _msgSender(),
                _purchaseAmount,
                _participationFeePercentage,
                true,
                _poolType
            );
            return;
        }

        bool verifyWithoutKYC = _verifyUser(
            _msgSender(),
            WHALE,
            maxPurchaseAmountForNotKYCUser,
            _maxPurchaseBaseOnAllocations,
            proof
        );

        require(verifyWithoutKYC, Errors.NOT_IN_WHALE_LIST);

        _internalBuyToken(
            _msgSender(),
            _purchaseAmount,
            _participationFeePercentage,
            false,
            _poolType
        );
    }

    /**
     * @dev Internal function for normal user to buy token
     * @param proof Respective proof for a leaf, which is respective for investor in merkle tree
     * @param _purchaseAmount Purchase amount of investor
     */
    function _internalNormalUserBuyToken(
        bytes32[] memory proof,
        uint _purchaseAmount
    ) internal {
        uint8 poolType = uint8(PoolLogic.PoolType.NORMAL_ACCESS);
        bool verifyWithKYCed = _verifyUser(
            _msgSender(),
            NORMAL_USER,
            maxPurchaseAmountForKYCUser,
            0,
            proof
        );
        if (verifyWithKYCed) {
            _internalBuyToken(
                _msgSender(),
                _purchaseAmount,
                crowdfundingParticipationFeePercentage,
                true,
                poolType
            );
            return;
        }

        bool verifyWithoutKYC = _verifyUser(
            _msgSender(),
            NORMAL_USER,
            maxPurchaseAmountForNotKYCUser,
            0,
            proof
        );

        require(verifyWithoutKYC, Errors.NOT_IN_WHALE_LIST);

        _internalBuyToken(
            _msgSender(),
            _purchaseAmount,
            crowdfundingParticipationFeePercentage,
            false,
            poolType
        );
    }

    /**
     * @dev Check whether or not session of whale
     * @return Return true if yes, and vice versa
     */
    function _validWhaleSession() internal view returns (bool) {
        return
            block.timestamp > whaleOpenTime &&
            block.timestamp <= whaleCloseTime;
    }

    /**
     * @dev Check whether or not session of community user
     * @return Return true if yes, and vice versa
     */
    function _validCommunitySession() internal view returns (bool) {
        return
            block.timestamp > communityOpenTime &&
            block.timestamp <= communityCloseTime;
    }

    /**
     * @dev Internal function to buy token
     * @param buyer Address of investor
     * @param _purchaseAmount Purchase amount of investor
     * @param _participationFeePercentage Fee percentage when buying token
     * @param _KYCStatus True if investor KYC and vice versa
     * @param _poolType 0 for galaxy pool, 1 for early access and 2 for normal user in crowdfunding pool
     */
    function _internalBuyToken(
        address buyer,
        uint _purchaseAmount,
        uint _participationFeePercentage,
        bool _KYCStatus,
        uint8 _poolType
    ) internal {
        if (_KYCStatus == true) {
            require(
                userPurchasedAmount[_msgSender()] + _purchaseAmount <=
                    maxPurchaseAmountForKYCUser,
                Errors.EXCEED_MAX_PURCHASE_AMOUNT_FOR_KYC_USER
            );
        } else {
            require(
                userPurchasedAmount[_msgSender()] + _purchaseAmount <=
                    maxPurchaseAmountForNotKYCUser,
                Errors.EXCEED_MAX_PURCHASE_AMOUNT_FOR_NOT_KYC_USER
            );
        }

        uint participationFee = PoolLogic._calculateParticipantFee(
            _purchaseAmount,
            _participationFeePercentage
        );
        if (participationFee > 0) {
            purchaseToken.safeTransferFrom(
                buyer,
                address(this),
                participationFee
            );
        }
        _forwardPurchaseTokenFunds(buyer, _purchaseAmount);
        _updatePurchasingState(_purchaseAmount);

        emit BuyToken(
            _msgSender(),
            address(this),
            address(IDOToken),
            _purchaseAmount,
            _poolType
        );
    }

    /**
     * @dev Update purchasing amount in galaxy pool
     * @param _purchaseAmount Purchase amount of investor
     */
    function _updatePurchasingInGalaxyPoolState(uint _purchaseAmount) internal {
        purchasedAmountInGalaxyPool += _purchaseAmount;
    }

    /**
     * @dev Update purchasing amount in early access
     * @param _purchaseAmount Purchase amount of investor
     */
    function _updatePurchasingInEarlyAccessState(
        uint _purchaseAmount
    ) internal {
        purchasedAmountInEarlyAccess += _purchaseAmount;
    }

    /**
     * @dev Update purchasing amount, airdrop amount and TGE amount in all pools
     * @param _purchaseAmount Purchase amount of investor
     */
    function _updatePurchasingState(uint _purchaseAmount) internal {
        purchasedAmount += _purchaseAmount;
        userPurchasedAmount[_msgSender()] += _purchaseAmount;
    }

    /**
     * @dev Transfer purchase token from investor to pool
     * @param buyer Address of investor
     * @param _purchaseAmount Purchase amount of investor
     */
    function _forwardPurchaseTokenFunds(
        address buyer,
        uint _purchaseAmount
    ) internal {
        purchaseToken.safeTransferFrom(buyer, address(this), _purchaseAmount);
    }

    /**
     * @dev Verify allowance of investor's token for pool
     * @param _user Address of investor
     * @param _purchaseAmount Purchase amount of investor
     */
    function _verifyAllowance(
        address _user,
        uint _purchaseAmount
    ) private view {
        uint allowance = purchaseToken.allowance(_user, address(this));
        require(allowance >= _purchaseAmount, Errors.NOT_ENOUGH_ALLOWANCE);
    }

    /**
     * @dev Check whether or not purchase amount exceeds max purchase amount base on allocation for whale
     * @param _purchaseAmount Amount of purchase token
     * @param _maxPurchaseBaseOnAllocations Max purchase amount base on allocations for whale
     */
    function _preValidatePurchaseInGalaxyPool(
        uint _purchaseAmount,
        uint _maxPurchaseBaseOnAllocations
    ) internal pure {
        _validAmount(_purchaseAmount);
        require(
            _purchaseAmount <= _maxPurchaseBaseOnAllocations,
            Errors.EXCEED_MAX_PURCHASE_AMOUNT_FOR_USER
        );
    }

    /**
     * @dev Check whether or not purchase amount exceeds max purchase in early access for whale
     * @param _purchaseAmount Purchase amount of investor
     */
    function _preValidatePurchaseInEarlyAccess(
        uint _purchaseAmount
    ) internal view {
        _validAmount(_purchaseAmount);
        require(
            purchasedAmountInEarlyAccess + _purchaseAmount <=
                maxPurchaseAmountForEarlyAccess,
            Errors.EXCEED_MAX_PURCHASE_AMOUNT_FOR_EARLY_ACCESS
        );
    }

    /**
     * @dev Check whether or not purchase amount exceeds amount in all pools
     * @param _purchaseAmount Purchase amount of investor
     */
    function _preValidatePurchase(uint _purchaseAmount) internal view {
        _validAmount(_purchaseAmount);
        require(
            purchasedAmount + _purchaseAmount <= totalRaiseAmount,
            Errors.EXCEED_TOTAL_RAISE_AMOUNT
        );
    }
}
