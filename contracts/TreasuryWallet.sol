// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TreasuryWallet
 * @dev Smart contract wallet for treasury management with policy engine support
 */
contract TreasuryWallet is Ownable {
    using SafeERC20 for IERC20;

    // USDC token address (testnet)
    address public constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238; // Sepolia USDC
    
    // Policy engine interface
    address public policyEngine;
    
    // Active policies
    mapping(address => bool) public activePolicies;
    address[] public policyList;
    
    // Allocation tracking
    struct Allocation {
        address recipient;
        uint256 amount;
        string reason;
        uint256 timestamp;
        bool executed;
    }
    
    Allocation[] public allocations;
    
    // Distribution tracking
    struct Distribution {
        address[] recipients;
        uint256[] amounts;
        uint256 timestamp;
        bool executed;
    }
    
    Distribution[] public distributions;
    
    // Events
    event PolicyAdded(address indexed policy);
    event PolicyRemoved(address indexed policy);
    event AllocationExecuted(uint256 indexed allocationId, address indexed recipient, uint256 amount, string reason);
    event DistributionExecuted(uint256 indexed distributionId, address[] recipients, uint256[] amounts);
    event FundsReceived(address indexed sender, uint256 amount);
    
    constructor(address _owner, address _policyEngine) Ownable(_owner) {
        policyEngine = _policyEngine;
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev Add a policy to the wallet
     */
    function addPolicy(address policy, bytes calldata config) external onlyOwner {
        require(policy != address(0), "Invalid policy address");
        require(!activePolicies[policy], "Policy already added");
        
        // Evaluate policy before adding
        if (policyEngine != address(0)) {
            // Call policy engine to validate
            // This would call the policy engine contract
        }
        
        activePolicies[policy] = true;
        policyList.push(policy);
        emit PolicyAdded(policy);
    }
    
    /**
     * @dev Remove a policy
     */
    function removePolicy(address policy) external onlyOwner {
        require(activePolicies[policy], "Policy not found");
        activePolicies[policy] = false;
        emit PolicyRemoved(policy);
    }
    
    /**
     * @dev Get all active policies
     */
    function getPolicies() external view returns (address[] memory) {
        return policyList;
    }
    
    /**
     * @dev Execute allocation (single recipient)
     */
    function allocate(address recipient, uint256 amount, string calldata reason) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(IERC20(USDC).balanceOf(address(this)) >= amount, "Insufficient balance");
        
        // Check policies if policy engine is set
        if (policyEngine != address(0)) {
            // Evaluate all active policies
            for (uint i = 0; i < policyList.length; i++) {
                if (activePolicies[policyList[i]]) {
                    // Call policy engine to evaluate
                    // This would check if allocation is allowed
                }
            }
        }
        
        IERC20(USDC).safeTransfer(recipient, amount);
        
        allocations.push(Allocation({
            recipient: recipient,
            amount: amount,
            reason: reason,
            timestamp: block.timestamp,
            executed: true
        }));
        
        emit AllocationExecuted(allocations.length - 1, recipient, amount, reason);
    }
    
    /**
     * @dev Execute distribution (multiple recipients)
     */
    function distribute(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        uint256 totalAmount = 0;
        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(IERC20(USDC).balanceOf(address(this)) >= totalAmount, "Insufficient balance");
        
        // Check policies
        if (policyEngine != address(0)) {
            for (uint i = 0; i < policyList.length; i++) {
                if (activePolicies[policyList[i]]) {
                    // Evaluate policies
                }
            }
        }
        
        for (uint i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            IERC20(USDC).safeTransfer(recipients[i], amounts[i]);
        }
        
        distributions.push(Distribution({
            recipients: recipients,
            amounts: amounts,
            timestamp: block.timestamp,
            executed: true
        }));
        
        emit DistributionExecuted(distributions.length - 1, recipients, amounts);
    }
    
    /**
     * @dev Get USDC balance
     */
    function getBalance() external view returns (uint256) {
        return IERC20(USDC).balanceOf(address(this));
    }
    
    /**
     * @dev Get allocation count
     */
    function getAllocationCount() external view returns (uint256) {
        return allocations.length;
    }
    
    /**
     * @dev Get distribution count
     */
    function getDistributionCount() external view returns (uint256) {
        return distributions.length;
    }
}

