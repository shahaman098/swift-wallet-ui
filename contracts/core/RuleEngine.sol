// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./OrgRegistry.sol";
import "./Vault.sol";
import "../interfaces/IRuleEngine.sol";
import "../interfaces/IZKVerifier.sol";

contract RuleEngine is AccessControl, ReentrancyGuard, Pausable, IRuleEngine {
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    
    OrgRegistry public orgRegistry;
    Vault public vault;
    IZKVerifier public zkVerifier;

    mapping(uint64 => mapping(uint64 => Department)) public departments;
    mapping(uint64 => uint64) public nextDeptId;
    
    mapping(uint64 => mapping(uint64 => AllocationRule)) public allocationRules;
    mapping(uint64 => uint64) public nextAllocationRuleId;
    
    mapping(uint64 => mapping(uint64 => DistributionRule)) public distributionRules;
    mapping(uint64 => uint64) public nextDistributionRuleId;

    event DepartmentCreated(uint64 indexed orgId, uint64 indexed deptId, bytes32 nameHash);
    event AllocationRuleCreated(uint64 indexed orgId, uint64 indexed ruleId);
    event DistributionRuleCreated(uint64 indexed orgId, uint64 indexed ruleId);
    event AllocationExecuted(uint64 indexed orgId, uint64 indexed ruleId, uint256 amount);
    event DistributionExecuted(uint64 indexed orgId, uint64 indexed ruleId, address recipient, uint256 amount);
    event ExternalPayoutRequested(uint64 indexed orgId, uint64 indexed deptId, address recipient, uint256 amount, bytes metadata);

    constructor(address _orgRegistry, address _vault, address _zkVerifier) {
        orgRegistry = OrgRegistry(_orgRegistry);
        vault = Vault(_vault);
        zkVerifier = IZKVerifier(_zkVerifier);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FINANCE_ROLE, msg.sender);
    }

    function createDepartment(
        uint64 orgId,
        bytes32 nameHash,
        uint256 cap
    ) external onlyRole(FINANCE_ROLE) returns (uint64 deptId) {
        require(orgRegistry.orgs(orgId).active, "Org not active");
        deptId = nextDeptId[orgId]++;
        departments[orgId][deptId] = Department({
            id: deptId,
            nameHash: nameHash,
            cap: cap,
            active: true
        });
        emit DepartmentCreated(orgId, deptId, nameHash);
    }

    function createAllocationRule(
        uint64 orgId,
        AllocationType allocationType,
        uint64 sourceDept,
        uint64 targetDept,
        uint16 bps,
        uint256 amount,
        uint256 cap
    ) external onlyRole(FINANCE_ROLE) returns (uint64 ruleId) {
        require(orgRegistry.orgs(orgId).active, "Org not active");
        require(bps <= 10000, "BPS > 10000");
        require(departments[orgId][sourceDept].active, "Source dept inactive");
        require(departments[orgId][targetDept].active, "Target dept inactive");
        
        ruleId = nextAllocationRuleId[orgId]++;
        allocationRules[orgId][ruleId] = AllocationRule({
            id: ruleId,
            orgId: orgId,
            allocationType: allocationType,
            sourceDept: sourceDept,
            targetDept: targetDept,
            bps: bps,
            amount: amount,
            cap: cap,
            active: true
        });
        emit AllocationRuleCreated(orgId, ruleId);
    }

    function createDistributionRule(
        uint64 orgId,
        uint64 fromDept,
        address recipient,
        uint256 amount,
        uint16 bps,
        Frequency frequency,
        bool confidential
    ) external onlyRole(FINANCE_ROLE) returns (uint64 ruleId) {
        require(orgRegistry.orgs(orgId).active, "Org not active");
        require(recipient != address(0), "Invalid recipient");
        require(bps <= 10000, "BPS > 10000");
        require(departments[orgId][fromDept].active, "Dept inactive");
        
        ruleId = nextDistributionRuleId[orgId]++;
        distributionRules[orgId][ruleId] = DistributionRule({
            id: ruleId,
            orgId: orgId,
            fromDept: fromDept,
            recipient: recipient,
            amount: amount,
            bps: bps,
            frequency: frequency,
            lastExecuted: 0,
            confidential: confidential,
            active: true
        });
        emit DistributionRuleCreated(orgId, ruleId);
    }

    function executeAllocation(uint64 orgId, uint64 ruleId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        AllocationRule storage rule = allocationRules[orgId][ruleId];
        require(rule.active, "Rule inactive");
        require(rule.orgId == orgId, "Rule mismatch");

        uint256 sourceBalance = vault.getDeptBalance(orgId, rule.sourceDept);
        uint256 transferAmount;

        if (rule.allocationType == AllocationType.Percentage) {
            transferAmount = (sourceBalance * rule.bps) / 10000;
        } else if (rule.allocationType == AllocationType.FixedAmount) {
            transferAmount = rule.amount;
        } else { // Residual
            uint256 targetBalance = vault.getDeptBalance(orgId, rule.targetDept);
            uint256 targetCap = departments[orgId][rule.targetDept].cap;
            if (targetCap > targetBalance) {
                transferAmount = targetCap - targetBalance;
            }
        }

        require(transferAmount > 0, "Zero transfer");
        if (rule.cap > 0) {
            require(transferAmount <= rule.cap, "Exceeds cap");
        }

        vault.moveBetweenDepts(orgId, rule.sourceDept, rule.targetDept, transferAmount);
        emit AllocationExecuted(orgId, ruleId, transferAmount);
    }

    function executeAllocations(uint64 orgId, uint64[] memory ruleIds) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        for (uint256 i = 0; i < ruleIds.length; i++) {
            executeAllocation(orgId, ruleIds[i]);
        }
    }

    function executeDistributions(
        uint64 orgId,
        uint64[] memory ruleIds,
        bytes memory zkProof
    ) external nonReentrant whenNotPaused {
        for (uint256 i = 0; i < ruleIds.length; i++) {
            DistributionRule storage rule = distributionRules[orgId][ruleIds[i]];
            require(rule.active, "Rule inactive");
            require(rule.orgId == orgId, "Rule mismatch");

            // Check frequency
            if (rule.frequency != Frequency.None) {
                uint256 nextExecution = rule.lastExecuted;
                if (rule.frequency == Frequency.Daily) {
                    nextExecution += 1 days;
                } else if (rule.frequency == Frequency.Weekly) {
                    nextExecution += 7 days;
                } else if (rule.frequency == Frequency.Monthly) {
                    nextExecution += 30 days;
                }
                require(block.timestamp >= nextExecution, "Too early");
            }

            // ZK proof verification for confidential rules
            if (rule.confidential && zkProof.length > 0) {
                // Verify ZK proof (simplified - actual implementation would verify circuit)
                require(zkVerifier.verifyProof(orgId, rule.fromDept, zkProof), "Invalid ZK proof");
            }

            uint256 deptBalance = vault.getDeptBalance(orgId, rule.fromDept);
            uint256 payoutAmount;

            if (rule.bps > 0) {
                payoutAmount = (deptBalance * rule.bps) / 10000;
            } else {
                payoutAmount = rule.amount;
            }

            require(payoutAmount > 0, "Zero payout");
            require(deptBalance >= payoutAmount, "Insufficient dept balance");

            // For external payouts via Circle Gateway, emit event
            // Otherwise, transfer directly
            if (rule.recipient != address(0)) {
                vault.withdrawOrg(orgId, payoutAmount, rule.recipient);
                emit DistributionExecuted(orgId, ruleIds[i], rule.recipient, payoutAmount);
            } else {
                // External payout via Gateway
                bytes memory metadata = abi.encode(rule.orgId, rule.fromDept, ruleIds[i]);
                emit ExternalPayoutRequested(orgId, rule.fromDept, rule.recipient, payoutAmount, metadata);
            }

            rule.lastExecuted = block.timestamp;
        }
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

