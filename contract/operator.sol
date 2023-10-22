// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

// The Scroll Messenger interface is the same on both L1 and L2, it allows sending cross-chain transactions
// Let's import it directly from the Scroll Contracts library
import "@scroll-tech/contracts@0.1.0/libraries/IScrollMessenger.sol";

// The GreeterOperator is capable of executing the Greeter function through the bridge
contract GreeterOperator {
    // This function will execute setGreeting on the Greeter contract
    function executeFunctionCrosschain(
        address targetAddress,
        string memory logMessage
    ) public payable {
        IScrollMessenger scrollMessenger = IScrollMessenger(
            0x50c7d3e7f7c656493D1D76aaa1a836CedfCBB16A
        );
        // sendMessage is able to execute any function by encoding the abi using the encodeWithSignature function
        scrollMessenger.sendMessage(
            targetAddress, // scrollMessengerAddress
            0, // value
            abi.encodeWithSignature("setStatus(string)", logMessage),
            5000, // gasLimit
            msg.sender //
        );
    }
}
