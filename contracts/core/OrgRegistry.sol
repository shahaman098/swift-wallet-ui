// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract OrgRegistry is AccessControl {
    bytes32 public constant ORG_ADMIN_ROLE = keccak256("ORG_ADMIN_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    bytes32 public constant AUTOMATION_EXECUTOR_ROLE = keccak256("AUTOMATION_EXECUTOR_ROLE");

    struct Org {
        uint64 id;
        address smartAccount;
        bytes32 configHash;
        bool active;
    }

    mapping(uint64 => Org) public orgs;
    mapping(address => uint64) public orgByAccount;
    uint64 public nextOrgId = 1;

    event OrgCreated(uint64 indexed orgId, address indexed smartAccount, bytes32 configHash);
    event OrgUpdated(uint64 indexed orgId, address indexed smartAccount, bytes32 configHash);
    event OrgDeactivated(uint64 indexed orgId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createOrg(
        address smartAccount,
        bytes32 configHash
    ) external onlyRole(ORG_ADMIN_ROLE) returns (uint64 orgId) {
        orgId = nextOrgId++;
        orgs[orgId] = Org({
            id: orgId,
            smartAccount: smartAccount,
            configHash: configHash,
            active: true
        });
        orgByAccount[smartAccount] = orgId;
        emit OrgCreated(orgId, smartAccount, configHash);
    }

    function updateOrg(
        uint64 orgId,
        address smartAccount,
        bytes32 configHash
    ) external onlyRole(ORG_ADMIN_ROLE) {
        require(orgs[orgId].id != 0, "Org not found");
        orgs[orgId].smartAccount = smartAccount;
        orgs[orgId].configHash = configHash;
        orgByAccount[smartAccount] = orgId;
        emit OrgUpdated(orgId, smartAccount, configHash);
    }

    function deactivateOrg(uint64 orgId) external onlyRole(ORG_ADMIN_ROLE) {
        require(orgs[orgId].id != 0, "Org not found");
        orgs[orgId].active = false;
        emit OrgDeactivated(orgId);
    }

    function getOrg(uint64 orgId) external view returns (Org memory) {
        return orgs[orgId];
    }
}

