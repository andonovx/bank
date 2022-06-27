const Bank = artifacts.require("Bank");
const ATRAC = artifacts.require("ATRAC");

var bankInstance;
var atracInstance;

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

contract("Bank", (accounts) => {

    const deferral = 30;
    const rewardPool = 10000;

    const amount1 = 1000;
    const amount2 = 4000;
    const amount3 = 3000;
    const amount4 = 50000;
    const amount5 = 20000;

    beforeEach('for each test...', async function () {
        atracInstance = await ATRAC.new(700000000000000000000000000n, { from: accounts[0] });

        await atracInstance.transfer(accounts[1], amount1, { from: accounts[0] });
        await atracInstance.transfer(accounts[2], amount2, { from: accounts[0] });
        await atracInstance.transfer(accounts[3], amount3, { from: accounts[0] });
        await atracInstance.transfer(accounts[4], amount4 + amount5, { from: accounts[0] });
    });
    
    it("invoking fillThePool should increase the R1, R2 and R3 reward pools", async () => {

        bankInstance = await Bank.new(deferral, atracInstance.address, { from: accounts[0] });

        await atracInstance.approve(bankInstance.address, rewardPool, { from: accounts[0] })
        
        const r1Before = await bankInstance.rewardPool1.call();
        const r2Before = await bankInstance.rewardPool2.call();
        const r3Before = await bankInstance.rewardPool3.call();
        
        await bankInstance.fillThePool(rewardPool, { from: accounts[0] })

        const r1After = await bankInstance.rewardPool1.call();
        const r2After = await bankInstance.rewardPool2.call();
        const r3After = await bankInstance.rewardPool3.call();

        assert.equal(
            +r1Before + rewardPool / 5,
            +r1After,
            "deposits() function is returning unexpected results. deposit() functionality might be broken"
        );

        assert.equal(
            +r2Before + 3 * rewardPool / 10,
            +r2After,
            "deposits() function is returning unexpected results. deposit() functionality might be broken"
        );

        assert.equal(
            +r3Before + rewardPool / 2,
            +r3After,
            "deposits() function is returning unexpected results. deposit() functionality might be broken"
        );

    });

    it("deposits(msg.sender) should increase after invoking deposit()", async () => {

        bankInstance = await Bank.new(deferral, atracInstance.address, { from: accounts[0] });

        await atracInstance.approve(bankInstance.address, rewardPool, { from: accounts[0] })
        await bankInstance.fillThePool(rewardPool, { from: accounts[0] })
        await atracInstance.approve(bankInstance.address, amount4 + amount5, { from: accounts[4] });

        const balanceBeforeFirstDeposit = await bankInstance.deposits.call(accounts[4]);

        await bankInstance.deposit(amount4, { from: accounts[4] });
        await bankInstance.deposit(amount5, { from: accounts[4] });

        const balanceAfterSecondDeposit = await bankInstance.deposits.call(accounts[4]);

        assert.equal(
            +balanceBeforeFirstDeposit + amount4 + amount5,
            +balanceAfterSecondDeposit,
            "deposits() function is returning unexpected results. deposit() functionality might be broken"
        );
    });

    it("after 2t, 3t, 4t have elapsed the withdraw function should transfer the appropriate amount", async () => {
        let waitStart1, waitStart2, waitStart3, waitEnd1, waitEnd2, waitEnd3;
        bankInstance = await Bank.new(deferral, atracInstance.address, { from: accounts[0] });

        waitStart1 = Date.now();

        await atracInstance.approve(bankInstance.address, rewardPool, { from: accounts[0] })
        await atracInstance.approve(bankInstance.address, amount1, { from: accounts[1] });
        await atracInstance.approve(bankInstance.address, amount2, { from: accounts[2] });
        await atracInstance.approve(bankInstance.address, amount3, { from: accounts[3] });

        await bankInstance.fillThePool(rewardPool, { from: accounts[0] })

        let balanceAfterWithdraw, balanceBeforeWithdraw;

        await bankInstance.deposit(amount1, { from: accounts[1] });
        await bankInstance.deposit(amount2, { from: accounts[2] });
        await bankInstance.deposit(amount3, { from: accounts[3] });

        waitEnd1 = Date.now();
        await timeout(2 * deferral * 1000 - (waitEnd1 - waitStart1) + 3000);
        waitStart2 = Date.now();

        balanceBeforeWithdraw = await atracInstance.balanceOf.call(accounts[1]);
        await bankInstance.withdraw({ from: accounts[1] });
        balanceAfterWithdraw = await atracInstance.balanceOf.call(accounts[1]);

        assert.equal(
            +balanceBeforeWithdraw + 1250,
            +balanceAfterWithdraw,
            "withdraw() function is returning unexpected results when invoked after 2t has and 3t has not yet elapsed since deployment."
        );

        waitEnd2 = Date.now(); 
        await timeout(deferral * 1000 - (waitEnd2 - waitStart2));
        waitStart3 = Date.now();

        balanceBeforeWithdraw = await atracInstance.balanceOf.call(accounts[2]);
        await bankInstance.withdraw({ from: accounts[2] });
        balanceAfterWithdraw = await atracInstance.balanceOf.call(accounts[2]);

        assert.equal(
            +balanceBeforeWithdraw + 6714,
            +balanceAfterWithdraw,
            "withdraw() function is returning unexpected results when invoked after 3t has and 4t has not yet elapsed since deployment."
        );

        waitEnd3 = Date.now(); 
        await timeout(deferral * 1000 - (waitEnd3 - waitStart3));

        balanceBeforeWithdraw = await atracInstance.balanceOf.call(accounts[3]);
        await bankInstance.withdraw({ from: accounts[3] });
        balanceAfterWithdraw = await atracInstance.balanceOf.call(accounts[3]);

        assert.equal(
            +balanceBeforeWithdraw + 10036,
            +balanceAfterWithdraw,
            "withdraw() function is returning unexpected results when invoked after 4t has elapsed since deployment."
        );
    });

    it("after 4t has elapsed and all deposits have been withdrawn, invoking withdrawAdmin should transfer the remaining money from the reward pool to the admin", async () => {
        let waitStart1, waitStart2, waitStart3, waitEnd1, waitEnd2, waitEnd3;

        bankInstance = await Bank.new(deferral, atracInstance.address, { from: accounts[0] });

        waitStart1 = Date.now();

        await atracInstance.approve(bankInstance.address, rewardPool, { from: accounts[0] })
        await atracInstance.approve(bankInstance.address, amount1, { from: accounts[1] });
        await atracInstance.approve(bankInstance.address, amount2, { from: accounts[2] });

        await bankInstance.fillThePool(rewardPool, { from: accounts[0] })

        await bankInstance.deposit(amount1, { from: accounts[1] });
        await bankInstance.deposit(amount2, { from: accounts[2] });
        
        waitEnd1 = Date.now();
        await timeout(2 * deferral * 1000 - (waitEnd1 - waitStart1) + 3000);
        waitStart2 = Date.now();

        await bankInstance.withdraw({ from: accounts[1] });

        waitEnd2 = Date.now(); 
        await timeout(deferral * 1000 - (waitEnd2 - waitStart2));
        waitStart3 = Date.now();

        await bankInstance.withdraw({ from: accounts[2] });

        waitEnd3= Date.now(); 
        await timeout(deferral * 1000 - (waitEnd3 - waitStart3));

        const balanceBeforeWithdraw = await atracInstance.balanceOf.call(accounts[0]);
        await bankInstance.withdrawAdmin({ from: accounts[0] });
        const balanceAfterWithdraw = await atracInstance.balanceOf.call(accounts[0]);

        assert.equal(
            +balanceBeforeWithdraw + 5000 ===
            +balanceAfterWithdraw, true,
            "withdraw() function is returning unexpected results when invoked after 4t has elapsed since deployment."
        );

    })
})