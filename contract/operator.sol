// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@scroll-tech/contracts@0.1.0/libraries/IScrollMessenger.sol";

contract Operator {
  // This function will execute setGreeting on the Greeter contract
  function executeFunctionCrosschain(
    address scrollMessengerAddress, // sepolia 0x50c7d3e7f7c656493D1D76aaa1a836CedfCBB16A
    address targetAddress, // 
    uint256 value, // 0
    string memory logMessage,
    uint32 gasLimit // 50000
  ) public payable {
    IScrollMessenger scrollMessenger = IScrollMessenger(scrollMessengerAddress);
    // sendMessage is able to execute any function by encoding the abi using the encodeWithSignature function
    scrollMessenger.sendMessage{ value: msg.value }(
      targetAddress,
      value,
      abi.encodeWithSignature("setStatus(string)", logMessage),
      gasLimit,
      msg.sender
    );
  }
}