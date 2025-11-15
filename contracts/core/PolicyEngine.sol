// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IPolicyEngine.sol";

contract PolicyEngine is AccessControl, IPolicyEngine {
    bytes32 public constant POLICY_ADMIN_ROLE = keccak256("POLICY_ADMIN_ROLE");
    
    mapping(address => bool) public policyModules;
    mapping(uint64 => address[]) public orgPolicyModules;

    event PolicyModuleRegistered(address indexed module, bool active);
    event PolicyModuleAdded(uint64 indexed orgId, address indexed module);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(POLICY_ADMIN_ROLE, msg.sender);
    }

    function registerPolicyModule(address module, bool active) 
        external 
        onlyRole(POLICY_ADMIN_ROLE) 
    {
        policyModules[module] = active;
        emit PolicyModuleRegistered(module, active);
    }

    function addPolicyModuleToOrg(uint64 orgId, address module) 
        external 
        onlyRole(POLICY_ADMIN_ROLE) 
    {
        require(policyModules[module], "Module not registered");
        orgPolicyModules[orgId].push(module);
        emit PolicyModuleAdded(orgId, module);
    }

    function validateAction(
        PolicyContext memory context
    ) external view returns (bool allowed, bytes32 reason) {
        address[] memory modules = orgPolicyModules[context.orgId];
        
        for (uint256 i = 0; i < modules.length; i++) {
            if (policyModules[modules[i]]) {
                (bool moduleAllowed, bytes32 moduleReason) = IPolicyModule(modules[i])
                    .validate(context);
                if (!moduleAllowed) {
                    return (false, moduleReason);
                }
            }
        }
        
        return (true, bytes32(0));
    }
}

interface IPolicyModule {
    function validate(IPolicyEngine.PolicyContext memory context) 
        external 
        view 
        returns (bool allowed, bytes32 reason);
}

