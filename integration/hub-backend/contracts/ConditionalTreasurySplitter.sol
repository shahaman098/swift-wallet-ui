// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}

contract ConditionalTreasurySplitter {
    struct Recipient {
        address wallet;
        uint256 share; // percentage (e.g., 25 = 25%)
    }

    address public admin;
    address public oracle;
    IERC20 public usdc;

    uint256 public unlockTime;
    bool public oracleApproved;

    Recipient[] public recipients;
    mapping(address => bool) public isRecipient;

    event RecipientAdded(address wallet, uint256 share);
    event DepositMade(address from, uint256 amount);
    event OracleUpdated(bool approved);
    event DistributionTriggered(uint256 totalAmount);
    event EmergencyWithdraw(address to, uint256 amount);

    constructor(
        address _usdc,
        address _oracle,
        uint256 _unlockTime
    ) {
        admin = msg.sender;
        oracle = _oracle;
        usdc = IERC20(_usdc);
        unlockTime = _unlockTime;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "NOT_ORACLE");
        _;
    }

    function addRecipient(address _wallet, uint256 _share) external onlyAdmin {
        require(!isRecipient[_wallet], "ALREADY_ADDED");
        require(_share > 0 && _share <= 100, "INVALID_SHARE");

        recipients.push(Recipient(_wallet, _share));
        isRecipient[_wallet] = true;

        emit RecipientAdded(_wallet, _share);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "INVALID_AMOUNT");

        bool ok = usdc.transferFrom(msg.sender, address(this), amount);
        require(ok, "TRANSFER_FAILED");

        emit DepositMade(msg.sender, amount);
    }

    function approveDistribution(bool status) external onlyOracle {
        oracleApproved = status;
        emit OracleUpdated(status);
    }

    function triggerDistribution() external {
        require(block.timestamp >= unlockTime, "TOO_EARLY");
        require(oracleApproved, "ORACLE_NOT_APPROVED");
        require(recipients.length > 0, "NO_RECIPIENTS");

        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "NO_FUNDS");

        for (uint i = 0; i < recipients.length; i++) {
            uint256 amount = (balance * recipients[i].share) / 100;
            usdc.transfer(recipients[i].wallet, amount);
        }

        emit DistributionTriggered(balance);
    }

    function emergencyWithdraw(address to) external onlyAdmin {
        uint256 balance = usdc.balanceOf(address(this));
        usdc.transfer(to, balance);
        emit EmergencyWithdraw(to, balance);
    }

    function getRecipients() external view returns (Recipient[] memory) {
        return recipients;
    }
}


