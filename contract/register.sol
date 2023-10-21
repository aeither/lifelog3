// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LogContract {
    mapping(address => uint256) public values;
    
    constructor() {
        values[msg.sender] = 0; // Initial value set to zero for the contract deployer
    }
    
    function addValue(uint256 _value) public {
        values[msg.sender] += _value; // Adds the given value to the sender's value
    }
    
    function resetValue() public {
        values[msg.sender] = 0; // Resets the sender's value back to zero
    }
}

// Last deployment 0x73C57F4f764516C940c5396890672EcaCDd8503B
