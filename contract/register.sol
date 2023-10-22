// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LogContract {
    mapping(address => string) public statuses;

    constructor() {
        statuses[msg.sender] = ""; // Initial status set to empty string for the contract deployer
    }

    function setStatus(string memory _status) public {
        statuses[msg.sender] = _status; // Sets the status for the sender
    }

    function resetStatus() public {
        statuses[msg.sender] = ""; // Resets the status for the sender
    }

    function getStatus(address _user) public view returns (string memory) {
        return statuses[_user]; // Returns the status stored for the given user
    }
}

// Last deployment 0xA2DD26D1e1b87975692ab9efdD84177BC16fcA98
