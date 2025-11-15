// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVault {
    function depositOrg(uint64 orgId, uint256 amount) external;
    function withdrawOrg(uint64 orgId, uint256 amount, address to) external;
    function moveBetweenDepts(
        uint64 orgId,
        uint64 fromDept,
        uint64 toDept,
        uint256 amount
    ) external;
    function getOrgBalance(uint64 orgId) external view returns (uint256);
    function getDeptBalance(uint64 orgId, uint64 deptId) external view returns (uint256);
}

