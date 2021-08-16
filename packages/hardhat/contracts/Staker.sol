pragma solidity >=0.6.0 <0.7.0;

import "hardhat/console.sol";
import "./ExampleExternalContract.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Staker {
    ExampleExternalContract public exampleExternalContract;

    uint256 public constant threshold = 1 ether;
    uint256 public deadline = now + 30 seconds;

    event Stake(address, uint256);

    mapping(address => uint256) public balances;
    bool private allowWithdrawals = true; // Allow withdrawals until disabled

    constructor(address exampleExternalContractAddress) public {
        exampleExternalContract = ExampleExternalContract(
            exampleExternalContractAddress
        );
    }

    function stake() public payable {
        // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
        //  ( make sure to add a `Stake(address,uint256)` event and emit it for the frontend <List/> display )

        // Default value for uint256 is 0. So if not set it returns 0
        balances[msg.sender] += msg.value;
        // emit event
        emit Stake(msg.sender, msg.value);
    }

    function execute() public {
        // After some `deadline` allow anyone to call an `execute()` function
        //  It should call `exampleExternalContract.complete{value: address(this).balance}()` to send all the value

        bool pastDeadline = now > deadline;
        bool pastThreshold = address(this).balance > threshold;

        if (pastDeadline && pastThreshold) {
            allowWithdrawals = false;
            exampleExternalContract.complete{value: address(this).balance}();
        }
    }

    function withdraw() public {
        // if the `threshold` was not met, allow everyone to call a `withdraw()` function
        if (allowWithdrawals) {
            msg.sender.transfer(balances[msg.sender]);
            balances[msg.sender] = 0;
        }
    }

    function timeLeft() public view returns (uint256) {
        // Add a `timeLeft()` view function that returns the time left before the deadline for the frontend
        return deadline - now;
    }
}
