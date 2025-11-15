// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPolicyEngine {
    struct PolicyContext {
        uint64 orgId;
        address caller;
        address target;
        uint256 value;
        bytes data;
        uint64 deptId;
    }

    function validateAction(
        PolicyContext memory context
    ) external view returns (bool allowed, bytes32 reason);

    function registerPolicyModule(address module, bool active) external;
}

