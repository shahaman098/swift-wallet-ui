// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IPolicyEngine.sol";
import "./PolicyEngine.sol";
import "./OrgRegistry.sol";

contract SmartOrgAccount is AccessControl, ReentrancyGuard {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    uint64 public orgId;
    OrgRegistry public orgRegistry;
    PolicyEngine public policyEngine;

    event Execution(uint64 indexed orgId, address indexed target, uint256 value, bytes data);
    event BatchExecution(uint64 indexed orgId, address[] targets, bytes[] data);

    constructor(
        uint64 _orgId,
        address _orgRegistry,
        address _policyEngine
    ) {
        orgId = _orgId;
        orgRegistry = OrgRegistry(_orgRegistry);
        policyEngine = PolicyEngine(_policyEngine);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function execute(
        address target,
        uint256 value,
        bytes memory data
    ) external nonReentrant returns (bytes memory) {
        require(hasRole(EXECUTOR_ROLE, msg.sender), "Not executor");
        require(orgRegistry.orgs(orgId).active, "Org inactive");

        IPolicyEngine.PolicyContext memory context = IPolicyEngine.PolicyContext({
            orgId: orgId,
            caller: msg.sender,
            target: target,
            value: value,
            data: data,
            deptId: 0
        });

        (bool allowed, bytes32 reason) = policyEngine.validateAction(context);
        require(allowed, string(abi.encodePacked("Policy violation: ", reason)));

        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Execution failed");

        emit Execution(orgId, target, value, data);
        return result;
    }

    function executeBatch(
        address[] memory targets,
        bytes[] memory data
    ) external nonReentrant {
        require(hasRole(EXECUTOR_ROLE, msg.sender), "Not executor");
        require(targets.length == data.length, "Length mismatch");
        require(orgRegistry.orgs(orgId).active, "Org inactive");

        for (uint256 i = 0; i < targets.length; i++) {
            IPolicyEngine.PolicyContext memory context = IPolicyEngine.PolicyContext({
                orgId: orgId,
                caller: msg.sender,
                target: targets[i],
                value: 0,
                data: data[i],
                deptId: 0
            });

            (bool allowed, ) = policyEngine.validateAction(context);
            require(allowed, "Policy violation");

            (bool success, ) = targets[i].call(data[i]);
            require(success, "Batch execution failed");
        }

        emit BatchExecution(orgId, targets, data);
    }

    function setPolicyModule(address module) external onlyRole(DEFAULT_ADMIN_ROLE) {
        policyEngine.addPolicyModuleToOrg(orgId, module);
    }
}

