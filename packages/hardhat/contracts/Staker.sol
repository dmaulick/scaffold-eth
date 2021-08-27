// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "hardhat/console.sol";

//https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "./ExampleExternalContract.sol";

/*
    Function Modifier Notes:
        public - all can access
        external - Cannot be accessed internally, only externally
        internal - only this contract and contracts deriving from it can access
        private - can be accessed only from this contract

        Note: public will always be more costly 
            https://ethereum.stackexchange.com/questions/19380/external-vs-public-best-practices    
*/

contract Staker {
    ExampleExternalContract public exampleExternalContract;

    uint256 public constant threshold = 1 ether;
    uint256 public deadline;

    event Stake(address, uint256);

    mapping(address => uint256) public balances;

    constructor(address exampleExternalContractAddress) {
        console.log("in constructor", exampleExternalContractAddress);
        exampleExternalContract = ExampleExternalContract(
            exampleExternalContractAddress
        );

        console.log("LAST", address(exampleExternalContract));
        deadline = block.timestamp + 30 seconds;
    }

    modifier isBeforeDeadline() {
        require(
            block.timestamp < deadline,
            "You're too late, the it is past the deadline"
        );
        _;
    }

    modifier hasSufficientFunds() {
        require(
            address(this).balance > threshold,
            "This smart contract does not have enough funds."
        );
        _;
    }

    modifier allowWithdrawals() {
        require(
            !exampleExternalContract.completed(),
            "External contract was already completed"
        );
        _;
    }

    // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
    //  ( make sure to add a `Stake(address,uint256)` event and emit it for the frontend <List/> display )
    function stake() external payable isBeforeDeadline {
        // Default value for uint256 is 0. So if not set it returns 0
        balances[msg.sender] += msg.value;
        // emit event
        emit Stake(msg.sender, msg.value);
    }

    // After some `deadline` allow anyone to call an `execute()` function
    //  It should call `exampleExternalContract.complete{value: address(this).balance}()` to send all the value
    function execute()
        external
        isBeforeDeadline
        hasSufficientFunds
        allowWithdrawals
    {
        exampleExternalContract.complete{value: address(this).balance}();
    }

    // if the `threshold` was not met, allow everyone to call a `withdraw()` function
    function withdraw() external allowWithdrawals {
        payable(msg.sender).transfer(balances[msg.sender]);
        balances[msg.sender] = 0;
    }

    // Add a `timeLeft()` view function that returns the time left before the deadline for the frontend
    function timeLeft() external view returns (uint256) {
        return deadline - block.timestamp;
    }
}
