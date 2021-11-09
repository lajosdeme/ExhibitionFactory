// SPDX-License-Identifier: Not specified
pragma solidity ^0.8.4;

import "./Initializable.sol";

abstract contract Lockable is Initializable {
    /* ################################
    #
    # RE-ENTRANCY GUARD
    #
    ######################################## */

    // re-entrancy protection
    uint256 public unlocked = 1;

    function initialize() public initializer {
        unlocked = 1;
    }

    modifier lock() {
        require(unlocked == 1, 'Exhibition Consumer: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }
}