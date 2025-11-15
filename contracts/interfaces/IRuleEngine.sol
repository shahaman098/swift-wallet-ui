// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRuleEngine {
    enum AllocationType { Percentage, FixedAmount, Residual }
    enum Frequency { None, Daily, Weekly, Monthly, Custom }

    struct Department {
        uint64 id;
        bytes32 nameHash;
        uint256 cap;
        bool active;
    }

    struct AllocationRule {
        uint64 id;
        uint64 orgId;
        AllocationType allocationType;
        uint64 sourceDept;
        uint64 targetDept;
        uint16 bps;
        uint256 amount;
        uint256 cap;
        bool active;
    }

    struct DistributionRule {
        uint64 id;
        uint64 orgId;
        uint64 fromDept;
        address recipient;
        uint256 amount;
        uint16 bps;
        Frequency frequency;
        uint256 lastExecuted;
        bool confidential;
        bool active;
    }

    function createDepartment(
        uint64 orgId,
        bytes32 nameHash,
        uint256 cap
    ) external returns (uint64 deptId);

    function createAllocationRule(
        uint64 orgId,
        AllocationType allocationType,
        uint64 sourceDept,
        uint64 targetDept,
        uint16 bps,
        uint256 amount,
        uint256 cap
    ) external returns (uint64 ruleId);

    function createDistributionRule(
        uint64 orgId,
        uint64 fromDept,
        address recipient,
        uint256 amount,
        uint16 bps,
        Frequency frequency,
        bool confidential
    ) external returns (uint64 ruleId);

    function executeAllocation(uint64 orgId, uint64 ruleId) external;
    function executeAllocations(uint64 orgId, uint64[] memory ruleIds) external;
    function executeDistributions(
        uint64 orgId,
        uint64[] memory ruleIds,
        bytes memory zkProof
    ) external;
}

