// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bank {

    mapping (address => uint) public deposits;

    uint public depositCount;

    uint public totalDeposits;
    uint public startTime;
    uint public deferral;
    
    uint public rewardPool1;
    uint public rewardPool2;
    uint public rewardPool3;
    uint public rewardPool1Balance;
    uint public rewardPool2Balance;
    uint public rewardPool3Balance;

    address public tokenAddress;
    address public adminSafe;

    ERC20 token;

    event Withdrawn(address indexed withdrawer, uint indexed round, uint depositAmount, uint amountWithdrawn);
    event Deposited(address indexed depositor, uint amount);
    event RewardPoolToppedUp(uint amount);
    
    modifier onlyAdminSafe {
        require(msg.sender == adminSafe, 'You are not whitelisted.');
        _;
    }

    function deposit(uint amount) external {
        require(block.timestamp < startTime + deferral, "Deposit period has ended");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        if (deposits[msg.sender] == 0)
        ++depositCount;
        
        deposits[msg.sender] += amount;
        totalDeposits += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw() external {
        uint deposited = deposits[msg.sender];
        uint _startTime = startTime;
        uint _deferral = deferral;

        require(block.timestamp > _startTime + 2*_deferral || block.timestamp < _startTime + _deferral, "Lock period is ongoing");
        require(deposited > 0, "No deposits");

        uint phase;
        uint toWithdrawFromPool1;
        uint toWithdrawFromPool2;
        uint toWithdrawFromPool3;
        uint amountToWithdraw = deposited;
        
        deposits[msg.sender] = 0;
        
        if (block.timestamp < _startTime + _deferral)
        {
            phase = 0;

            amountToWithdraw = deposited;
        }
        else if (block.timestamp > _startTime + 2*_deferral && block.timestamp < _startTime + 3*_deferral)
        {
            phase = 1;

            toWithdrawFromPool1 = deposited * rewardPool1Balance / totalDeposits;

            rewardPool1Balance -= toWithdrawFromPool1;

            amountToWithdraw += toWithdrawFromPool1;
        }
        else if (block.timestamp < _startTime + 4*_deferral)
        {
            phase = 2;

            toWithdrawFromPool1 = deposited * rewardPool1Balance / totalDeposits;
            toWithdrawFromPool2 = deposited * rewardPool2Balance / totalDeposits;

            rewardPool1Balance -= toWithdrawFromPool1;
            rewardPool2Balance -= toWithdrawFromPool2;

            amountToWithdraw += toWithdrawFromPool1 + toWithdrawFromPool2;
        }
        else {
            phase = 3;

            toWithdrawFromPool1 = deposited * rewardPool1Balance / totalDeposits;
            toWithdrawFromPool2 = deposited * rewardPool2Balance / totalDeposits;
            toWithdrawFromPool3 = deposited * rewardPool3Balance / totalDeposits;

            rewardPool1Balance -= toWithdrawFromPool1;
            rewardPool2Balance -= toWithdrawFromPool2;
            rewardPool3Balance -= toWithdrawFromPool3;

            amountToWithdraw += toWithdrawFromPool1 + toWithdrawFromPool2 + toWithdrawFromPool3;
        }

        totalDeposits -= deposited;

        require(token.transfer(
            msg.sender, amountToWithdraw), "Transfer failed");
        --depositCount;
        emit Withdrawn(msg.sender, phase, deposited, amountToWithdraw);
    }

    function withdrawAdmin() external onlyAdminSafe {
        uint amountDeposited = rewardPool1 + rewardPool2 + rewardPool3;
        uint amountToWithdraw = rewardPool1Balance + rewardPool2Balance + rewardPool3Balance;
        require(depositCount == 0, "Some of the rewards have not yet been collected");
        require(token.transfer(msg.sender, rewardPool1Balance + rewardPool2Balance + rewardPool3Balance), "Transfer failed");
        rewardPool1Balance = rewardPool2Balance = rewardPool3Balance = 0;
        emit Withdrawn(msg.sender, 3, amountDeposited, amountToWithdraw);
    }

    function fillThePool(uint _rewardPool) external onlyAdminSafe {
        require(block.timestamp < startTime + 2*deferral, "Withrawal period started");

        require(token.transferFrom(msg.sender, address(this), _rewardPool), "Transfer failed");
        rewardPool1Balance = rewardPool1 += 20 * _rewardPool / 100;
        rewardPool2Balance = rewardPool2 += 30 * _rewardPool / 100;
        rewardPool3Balance = rewardPool3 += 50 * _rewardPool / 100;

        emit RewardPoolToppedUp(_rewardPool);
    }

    constructor(uint _deferral, address _tokenAddress) {
        adminSafe = msg.sender;
        tokenAddress = _tokenAddress;
        token = ERC20(tokenAddress);
        startTime = block.timestamp;
        deferral = _deferral;
    }

    

}