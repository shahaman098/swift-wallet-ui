// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../core/PolicyEngine.sol";

contract SpendingLimitPolicy is IPolicyModule {
    struct Limit {
        uint256 dailyLimit;
        uint256 weeklyLimit;
        uint256 monthlyLimit;
        uint256 dailySpent;
        uint256 weeklySpent;
        uint256 monthlySpent;
        uint256 lastReset;
    }

    mapping(uint64 => mapping(uint64 => Limit)) public deptLimits;
    mapping(uint64 => Limit) public orgLimits;

    event LimitExceeded(uint64 orgId, uint64 deptId, uint256 attempted, uint256 limit);

    function setDeptLimit(
        uint64 orgId,
        uint64 deptId,
        uint256 daily,
        uint256 weekly,
        uint256 monthly
    ) external {
        deptLimits[orgId][deptId] = Limit({
            dailyLimit: daily,
            weeklyLimit: weekly,
            monthlyLimit: monthly,
            dailySpent: 0,
            weeklySpent: 0,
            monthlySpent: 0,
            lastReset: block.timestamp
        });
    }

    function validate(IPolicyEngine.PolicyContext memory context) 
        external 
        view 
        override 
        returns (bool allowed, bytes32 reason) 
    {
        Limit storage limit = deptLimits[context.orgId][context.deptId];
        
        // Reset counters if needed
        uint256 timeSinceReset = block.timestamp - limit.lastReset;
        if (timeSinceReset >= 1 days) {
            // Would reset in actual implementation
        }

        if (limit.dailyLimit > 0 && limit.dailySpent + context.value > limit.dailyLimit) {
            return (false, keccak256("DAILY_LIMIT_EXCEEDED"));
        }
        if (limit.weeklyLimit > 0 && limit.weeklySpent + context.value > limit.weeklyLimit) {
            return (false, keccak256("WEEKLY_LIMIT_EXCEEDED"));
        }
        if (limit.monthlyLimit > 0 && limit.monthlySpent + context.value > limit.monthlyLimit) {
            return (false, keccak256("MONTHLY_LIMIT_EXCEEDED"));
        }

        return (true, bytes32(0));
    }
}

