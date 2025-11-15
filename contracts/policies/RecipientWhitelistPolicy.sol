// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../core/PolicyEngine.sol";

contract RecipientWhitelistPolicy is IPolicyModule {
    mapping(uint64 => mapping(address => bool)) public whitelistedRecipients;
    mapping(uint64 => bool) public orgWhitelistEnabled;

    event RecipientWhitelisted(uint64 indexed orgId, address recipient, bool status);

    function setWhitelistEnabled(uint64 orgId, bool enabled) external {
        orgWhitelistEnabled[orgId] = enabled;
    }

    function whitelistRecipient(uint64 orgId, address recipient, bool status) external {
        whitelistedRecipients[orgId][recipient] = status;
        emit RecipientWhitelisted(orgId, recipient, status);
    }

    function validate(IPolicyEngine.PolicyContext memory context) 
        external 
        view 
        override 
        returns (bool allowed, bytes32 reason) 
    {
        if (!orgWhitelistEnabled[context.orgId]) {
            return (true, bytes32(0));
        }

        if (!whitelistedRecipients[context.orgId][context.target]) {
            return (false, keccak256("RECIPIENT_NOT_WHITELISTED"));
        }

        return (true, bytes32(0));
    }
}

