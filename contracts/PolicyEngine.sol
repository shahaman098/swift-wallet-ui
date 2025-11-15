// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PolicyEngine
 * @dev Smart contract for managing allocation and distribution policies
 */
contract PolicyEngine {
    
    struct Policy {
        string name;
        bytes config;
        address creator;
        uint256 createdAt;
        bool active;
    }
    
    mapping(address => Policy) public policies;
    address[] public policyList;
    
    // Policy evaluation results
    struct EvaluationResult {
        bool approved;
        string reason;
    }
    
    event PolicyCreated(address indexed policy, string name, address creator);
    event PolicyUpdated(address indexed policy, bytes newConfig);
    event PolicyEvaluated(address indexed policy, address wallet, bool approved, string reason);
    
    /**
     * @dev Create a new policy
     */
    function createPolicy(string calldata name, bytes calldata config) external returns (address) {
        address policyAddress = address(new PolicyContract(name, config, msg.sender));
        
        policies[policyAddress] = Policy({
            name: name,
            config: config,
            creator: msg.sender,
            createdAt: block.timestamp,
            active: true
        });
        
        policyList.push(policyAddress);
        emit PolicyCreated(policyAddress, name, msg.sender);
        
        return policyAddress;
    }
    
    /**
     * @dev Evaluate a policy
     */
    function evaluatePolicy(address wallet, bytes calldata data) external view returns (bool, string memory) {
        // Parse policy config from data
        // This is a simplified version - in production, you'd parse the actual policy rules
        
        // Example: Check if wallet has sufficient balance
        // Example: Check if allocation amount is within limits
        // Example: Check time-based restrictions
        
        return (true, "Policy approved");
    }
    
    /**
     * @dev Update policy configuration
     */
    function updatePolicy(address policy, bytes calldata config) external {
        require(policies[policy].creator == msg.sender, "Not policy creator");
        require(policies[policy].active, "Policy not active");
        
        policies[policy].config = config;
        emit PolicyUpdated(policy, config);
    }
    
    /**
     * @dev Get policy configuration
     */
    function getPolicyConfig(address policy) external view returns (bytes memory) {
        return policies[policy].config;
    }
}

/**
 * @title PolicyContract
 * @dev Individual policy contract instance
 */
contract PolicyContract {
    string public name;
    bytes public config;
    address public creator;
    
    constructor(string memory _name, bytes memory _config, address _creator) {
        name = _name;
        config = _config;
        creator = _creator;
    }
}

