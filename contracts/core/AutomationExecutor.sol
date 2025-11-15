// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./OrgRegistry.sol";
import "./RuleEngine.sol";

contract AutomationExecutor is AccessControl, ReentrancyGuard {
    bytes32 public constant AUTOMATION_EXECUTOR_ROLE = keccak256("AUTOMATION_EXECUTOR_ROLE");
    
    OrgRegistry public orgRegistry;
    RuleEngine public ruleEngine;

    struct Schedule {
        uint64 id;
        uint64 orgId;
        uint64[] allocationRuleIds;
        uint64[] distributionRuleIds;
        uint256 interval;
        uint256 lastExecuted;
        uint256 chainId;
        bool active;
    }

    mapping(uint64 => Schedule) public schedules;
    uint64 public nextScheduleId = 1;

    struct ExecutionMetadata {
        bytes32 executionId;
        bytes32 preStateHash;
        bytes32 postStateHash;
        uint256 timestamp;
    }

    mapping(bytes32 => ExecutionMetadata) public executions;

    event ScheduleCreated(uint64 indexed scheduleId, uint64 indexed orgId);
    event ScheduleExecuted(
        uint64 indexed scheduleId,
        bytes32 indexed executionId,
        bytes32 preStateHash,
        bytes32 postStateHash
    );

    constructor(address _orgRegistry, address _ruleEngine) {
        orgRegistry = OrgRegistry(_orgRegistry);
        ruleEngine = RuleEngine(_ruleEngine);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUTOMATION_EXECUTOR_ROLE, msg.sender);
    }

    function createSchedule(
        uint64 orgId,
        uint64[] memory allocationRuleIds,
        uint64[] memory distributionRuleIds,
        uint256 interval,
        uint256 chainId
    ) external onlyRole(AUTOMATION_EXECUTOR_ROLE) returns (uint64 scheduleId) {
        require(orgRegistry.orgs(orgId).active, "Org not active");
        
        scheduleId = nextScheduleId++;
        schedules[scheduleId] = Schedule({
            id: scheduleId,
            orgId: orgId,
            allocationRuleIds: allocationRuleIds,
            distributionRuleIds: distributionRuleIds,
            interval: interval,
            lastExecuted: 0,
            chainId: chainId,
            active: true
        });
        
        emit ScheduleCreated(scheduleId, orgId);
    }

    function canExecuteSchedule(uint64 scheduleId) external view returns (bool) {
        Schedule storage schedule = schedules[scheduleId];
        if (!schedule.active) return false;
        if (schedule.lastExecuted == 0) return true;
        return block.timestamp >= schedule.lastExecuted + schedule.interval;
    }

    function executeSchedule(
        uint64 scheduleId,
        bytes memory zkProof
    ) external nonReentrant returns (bytes32 executionId) {
        require(hasRole(AUTOMATION_EXECUTOR_ROLE, msg.sender), "Not authorized");
        
        Schedule storage schedule = schedules[scheduleId];
        require(schedule.active, "Schedule inactive");
        require(orgRegistry.orgs(schedule.orgId).active, "Org inactive");
        require(canExecuteSchedule(scheduleId), "Not due yet");

        executionId = keccak256(abi.encodePacked(scheduleId, block.timestamp, block.number));
        require(executions[executionId].timestamp == 0, "Duplicate execution");

        // Capture pre-state
        bytes32 preStateHash = keccak256(abi.encodePacked(
            schedule.orgId,
            schedule.allocationRuleIds,
            schedule.distributionRuleIds,
            block.timestamp
        ));

        // Execute allocations
        if (schedule.allocationRuleIds.length > 0) {
            ruleEngine.executeAllocations(schedule.orgId, schedule.allocationRuleIds);
        }

        // Execute distributions
        if (schedule.distributionRuleIds.length > 0) {
            ruleEngine.executeDistributions(schedule.orgId, schedule.distributionRuleIds, zkProof);
        }

        // Capture post-state
        bytes32 postStateHash = keccak256(abi.encodePacked(
            schedule.orgId,
            schedule.allocationRuleIds,
            schedule.distributionRuleIds,
            block.timestamp + 1
        ));

        schedule.lastExecuted = block.timestamp;
        
        executions[executionId] = ExecutionMetadata({
            executionId: executionId,
            preStateHash: preStateHash,
            postStateHash: postStateHash,
            timestamp: block.timestamp
        });

        emit ScheduleExecuted(scheduleId, executionId, preStateHash, postStateHash);
    }
}

