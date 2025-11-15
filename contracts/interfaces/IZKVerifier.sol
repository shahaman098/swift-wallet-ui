// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IZKVerifier {
    function verifyProof(
        uint64 orgId,
        uint64 deptId,
        bytes memory proof
    ) external view returns (bool);
}

