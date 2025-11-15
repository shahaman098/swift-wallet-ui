// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./OrgRegistry.sol";

contract Vault is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant VAULT_ADMIN_ROLE = keccak256("VAULT_ADMIN_ROLE");
    
    OrgRegistry public orgRegistry;
    IERC20 public usdc;

    mapping(uint64 => uint256) public orgBalance;
    mapping(uint64 => mapping(uint64 => uint256)) public deptBalance;

    event OrgDeposited(uint64 indexed orgId, uint256 amount);
    event OrgWithdrawn(uint64 indexed orgId, address to, uint256 amount);
    event DeptTransfer(
        uint64 indexed orgId,
        uint64 fromDept,
        uint64 toDept,
        uint256 amount
    );

    constructor(address _orgRegistry, address _usdc) {
        orgRegistry = OrgRegistry(_orgRegistry);
        usdc = IERC20(_usdc);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VAULT_ADMIN_ROLE, msg.sender);
    }

    function depositOrg(uint64 orgId, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(orgRegistry.orgs(orgId).active, "Org not active");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        orgBalance[orgId] += amount;
        emit OrgDeposited(orgId, amount);
    }

    function withdrawOrg(
        uint64 orgId,
        uint256 amount,
        address to
    ) external nonReentrant whenNotPaused {
        require(orgRegistry.orgs(orgId).active, "Org not active");
        require(
            hasRole(VAULT_ADMIN_ROLE, msg.sender) ||
            orgRegistry.orgs(orgId).smartAccount == msg.sender,
            "Not authorized"
        );
        require(orgBalance[orgId] >= amount, "Insufficient balance");
        
        orgBalance[orgId] -= amount;
        usdc.safeTransfer(to, amount);
        emit OrgWithdrawn(orgId, to, amount);
    }

    function moveBetweenDepts(
        uint64 orgId,
        uint64 fromDept,
        uint64 toDept,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(orgRegistry.orgs(orgId).active, "Org not active");
        require(
            hasRole(VAULT_ADMIN_ROLE, msg.sender) ||
            orgRegistry.orgs(orgId).smartAccount == msg.sender,
            "Not authorized"
        );
        require(deptBalance[orgId][fromDept] >= amount, "Insufficient dept balance");
        require(orgBalance[orgId] >= amount, "Insufficient org balance");

        deptBalance[orgId][fromDept] -= amount;
        deptBalance[orgId][toDept] += amount;
        emit DeptTransfer(orgId, fromDept, toDept, amount);
    }

    function getOrgBalance(uint64 orgId) external view returns (uint256) {
        return orgBalance[orgId];
    }

    function getDeptBalance(uint64 orgId, uint64 deptId) external view returns (uint256) {
        return deptBalance[orgId][deptId];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

