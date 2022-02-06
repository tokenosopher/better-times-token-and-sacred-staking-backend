
const BetterTimesToken = artifacts.require("BetterTimesToken");
const truffleAssert = require('truffle-assertions');
const helper = require("./helpers/truffleTestHelpers");


//placeholder strings for the SacredEvents:
const myDeed = "working on the sacred coin."
const myName = "Narcis"
const myStory = "I don't have one"

//expected sacredEvents content based on the values above:
const expectedSacredEventOne= "Lately, I helped to remove poverty from the world by working on the sacred coin."
const expectedSacredEventTwo= "Narcis's hard times story is I don't have one"

contract("BetterTimesToken", async accounts => {

    let betterTimesToken;
    let owner;

    before(async () => {
        betterTimesToken = await BetterTimesToken.deployed()
        owner = accounts[0];
    })

    it("Staking 100x2 - Checking the staking amount and the emission of sacred events", async () => {

        // Stake 100 is used to stake 100 tokens twice and see that stake is added correctly and money burned

        // Set owner, user and a stake_amount
        let stake_amount = 100;
        // Add som tokens on account 1 asweel
        // await betterTimesToken.mint(accounts[1], 1000);
        // Get init balance of user
        let balance = await betterTimesToken.balanceOf(owner)
        console.log(`original balance before staking is ${balance.toString()}`)

        // Stake the amount, notice the FROM parameter which specifes what the msg.sender address will be


        let stakeID = await betterTimesToken.stakeOne(stake_amount, myDeed, 0, {from: owner});
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (it's the event and will contain the values we emitted)
                assert.equal(ev.thisAmount, stake_amount, "Stake amount in event was not correct");
                return true;
            },
            "Stake event should have triggered");

        //Check to see if the SacredEvent emitted the right message
        // it should be SacredEventOne):
        truffleAssert.eventEmitted(
            stakeID,
            "SacredEvent",
            (ev) => {
                // In here we can do our assertion on the ev variable (it's the event and will contain the values we emitted)
                assert.equal(ev.BetterTimesMessage, expectedSacredEventOne, "Stake message was not correct");
                return true;
            },
            "Stake event should have triggered");


        // Stake again on owner because we want to check if the 2nd iteration takes place correctly:
        stakeID = await betterTimesToken.stakeTwo(stake_amount, myName, myStory, 0, {from: owner});
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (it's the event and will contain the values we emitted)
                assert.equal(ev.entireAmount, stake_amount*2, "Stake amount in event was not correct");
                return true;
            },
            "Stake event should have triggered");


        //Check to see if the SacredEvent emitted the right message
        //It should be SacredEventTwo this time:
        truffleAssert.eventEmitted(
            stakeID,
            "SacredEvent",
            (ev) => {
                // In here we can do our assertion on the ev variable (it's the event and will contain the values we emitted)
                assert.equal(ev.BetterTimesMessage, expectedSacredEventTwo, "Stake message was not correct");
                return true;
            },
            "Stake event should have triggered");

    });

    it("cannot stake more than you own", async () => {
        try {
            await betterTimesToken.stakeTwo(1000000000, myName, myStory, 0, { from: accounts[2] });
        } catch (error) {
            assert.equal(error.reason, "BetterTimesToken: Cannot stake more than you own");
        }
    });

    // it("calling the hasStake function will ")

    it("withdrawing stake leads to isStaking being false, and StakingSummary being 0,0", async () => {
        // Stake again on owner because we want to check if the 2nd iteration takes place correctly:

        await betterTimesToken.withdrawStake({from:owner});
        let hasStake = await betterTimesToken.hasStake(owner)
        assert.equal(hasStake.isStaking, false, "staking should be false.")
        assert.equal(hasStake.totalAmount, 0, "staking amount should be zero")
        assert.equal(hasStake.SecondsToEndOfStakingRewards, 0, "Time to staking rewards should be 0")
    })

    it("withdrawing stake places the entire amount of coins back into the staker's wallet", async () => {
        let balanceAmount = await betterTimesToken.balanceOf(owner)
        assert.equal(balanceAmount.toString(), "679000000000000000000000000", "returned amount is not right")
    })

    it("token holder should be able to transfer tokens to someone else, via all three transfer methods", async () => {
        let transfer_amount = 1000;
        let recipient = accounts[1]

        //declaring the variable that will hold the transfer message:
        let transferIdSacredMessage;

        //a simple transfer call:
        let transferIdSimple = await betterTimesToken.transfer(recipient, transfer_amount)
        truffleAssert.eventEmitted(
            transferIdSimple,
            "Transfer",
            (ev) => {
                // In here we can do our assertion on the ev variable (it's the event and will contain the values we emitted)
                assert.equal(ev.from, owner, "Sender is correct");
                assert.equal(ev.to, recipient, "Recipient is correct");
                assert.equal(ev.value, transfer_amount, "transfer amount not correct")
                return true;
            },
            "Stake event should have triggered");

        let balance_recipient = await betterTimesToken.balanceOf(recipient)
        assert.equal(transfer_amount, balance_recipient, "the transfer amount and the recipient do not match")


        //a transfer call with sacred message one:
        transferIdSacredMessage = await betterTimesToken.transferSacredOne(recipient, transfer_amount, myDeed)
        truffleAssert.eventEmitted(
            transferIdSacredMessage,
            "SacredEvent",
            (ev) => {
                // In here we can do our assertion on the ev variable (it's the event and will contain the values we emitted)
                assert.equal(ev.BetterTimesMessage, expectedSacredEventOne, "Stake message was not correct");
                return true;
            },
            "Stake event should have triggered");

        //a transfer call with sacred message two:
        transferIdSacredMessage = await betterTimesToken.transferSacredTwo(recipient, transfer_amount, myName, myStory);
        truffleAssert.eventEmitted(
            transferIdSacredMessage,
            "SacredEvent",
            (ev) => {
                // In here we can do our assertion on the ev variable (it's the event and will contain the values we emitted)
                assert.equal(ev.BetterTimesMessage, expectedSacredEventTwo, "Stake message was not correct");
                return true;
            },
            "Stake event should have triggered");


        //testing to see if the transfer amount is correct after all three transfers:
        balance_recipient = await betterTimesToken.balanceOf(recipient)
        assert.equal(balance_recipient.toString(), transfer_amount*3, "the transfer amount and the recipient do not match")
    })


    it("new stakeholder should have increased index, and their balance should update after staking", async () => {
        let stake_amount = 100;
        let staker = accounts[1];

        //retrieving the balance of staker before staking:

        let initialBalance = await betterTimesToken.balanceOf(staker)

        let stakeID = await betterTimesToken.stakeOne(stake_amount, myDeed, 0, {from: staker});
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
                assert.equal(ev.thisAmount, stake_amount, "Stake amount in event was not correct");
                return true;
            },
            "Stake event should have triggered");

        //checking the balance of staker after staking is reduced
        let expectedBalance = initialBalance-stake_amount
        let balanceAfterStaking = await betterTimesToken.balanceOf(staker)

        assert.equal(balanceAfterStaking, expectedBalance, "balance is not as expected")
    })

    //
    it("calculate rewards", async() => {
        let transferredToTimeTraveler = 10000
        let stake_amount=1000;
        let timeTraveler = accounts[2]

        //first, let's transfer some tokens to the timeTraveler account(which is currently empty):
        await betterTimesToken.transfer(timeTraveler, transferredToTimeTraveler)

        //now, let's stake:
        await betterTimesToken.stakeOne(stake_amount, myDeed, 0, {from: timeTraveler});

        // fast-forward time by 20 Hours
        await helper.advanceTimeAndBlock(3600*20);

        //call the hasStaking function that contains the reward calculation:
        let stake = await betterTimesToken.hasStake(timeTraveler);

        //see if we gain 2% reward :
        assert.equal(stake.claimableReward.toString(), stake_amount*0.04,
            "Reward should be 2 after staking for twenty hours with 100")

        //fast forward another 20 hours
        await helper.advanceTimeAndBlock(3600*20);

        stake = await betterTimesToken.hasStake(timeTraveler);

        //see if we gained a 4% reward:
        assert.equal(stake.claimableReward.toString(), stake_amount*0.08,
            "Reward should be 4 after staking for forty hours with 100")

        //stake some more, which should automatically compound the reward and reset the timer:
        await betterTimesToken.stakeTwo(stake_amount, myName, myStory, 0, {from: timeTraveler});

        //fast forward another 20 hours:
        await helper.advanceTimeAndBlock(3600*20);

        //see if the calculations for the reward stick:
        stake = await betterTimesToken.hasStake(timeTraveler);

        //the expected staked amount currently registered should be
        //the stake amount*0.04 - which were the total rewards that were received when the autocompounding occurred
        //during the last staking
        //plus
        //the stake amount*2 because we staked twice - once in the beginning, and once before the last time travel
        let expectedStakedAmount = (stake_amount*0.08)+(stake_amount*2)

        //the expected total amount should be the expected staked amount above *0.02
        // because that's how long we time traveled since the last stake
        //plus
        //the expected staked amount
        let expectedTotalAmount = (expectedStakedAmount*0.04)+expectedStakedAmount

        assert.equal(stake.stakedAmount.toString(), Math.floor(expectedStakedAmount),
            "actual and expected staked amounts are not equal")

        assert.equal(stake.totalAmount.toString(), Math.floor(expectedTotalAmount),
            "actual and expected total amounts are not equal")
    });

    it("waiting for just before the deadline gets you the most rewards " +
        "and waiting longer than the staking time invalidates rewards", async () => {

        //pulling some of the values from the last test:
        let stake_amount=1000;
        let timeTraveler = accounts[2]
        let expectedStakedAmount = (stake_amount*0.08)+(stake_amount*2)
        let alreadyAdvanced = 20 //hours since the last stake in the previous test

        //let's advance time up to an hour before the deadline:
        let almostOneWeek = 168-1 //hours
        await helper.advanceTimeAndBlock(3600*(almostOneWeek-alreadyAdvanced));

        //the last stake
        let stake = await betterTimesToken.hasStake(timeTraveler);

        //calculating stake multiplier, which is based on the amount of hours passed since the last stake:
        let stakeMultiplier = 167 * 0.002

        //calculating expected totalAmount:
        let expectedTotalAmount = (expectedStakedAmount*stakeMultiplier)+expectedStakedAmount

        //checking if the expected total amount is the same as the actual total amount:
        assert.equal(stake.totalAmount.toString(), Math.floor(expectedTotalAmount),
            "actual and expected total amounts are not equal just before deadline")

        //let's advance a couple hours more, thus passing the deadline::
        let oneWeek= 168 //hours
        await helper.advanceTimeAndBlock(3600*2);

        stake = await betterTimesToken.hasStake(timeTraveler);

        //the expected total amount should now be the same as the expectedStakeAmount,
        //because the deadline passed:
        assert.equal(stake.totalAmount.toString(), Math.floor(expectedStakedAmount),
            "stake amount should equal to total amount just after deadline")

        //let's go crazy and advance another 5000 hours, just to be sure that the rewards stay 0:
        await helper.advanceTimeAndBlock(3600*5000);

        stake = await betterTimesToken.hasStake(timeTraveler);

        //the expected total amount should still be the same as the expectedStakeAmount,
        //because the deadline passed:
        assert.equal(stake.totalAmount.toString(), Math.floor(expectedStakedAmount),
            "stake amount should equal to total amount just after deadline")

    })

    it("removing a stake updates the balance correctly" +
        "and adding a new stake still leaves the account with full functionallity", async () => {
        let stake_amount= 100
        let timeTraveler = accounts[2]
        let timeTravelerBalance = await betterTimesToken.balanceOf(timeTraveler)
        let timeTravelerStakedTotal = await betterTimesToken.hasStake(timeTraveler)
        timeTravelerStakedTotal = timeTravelerStakedTotal.totalAmount

        //withdrawing the stake
        await betterTimesToken.withdrawStake({from:timeTraveler})

        //getting the updated balance
        let timeTravelerBalanceUpdated = await betterTimesToken.balanceOf(timeTraveler)

        assert.equal(timeTravelerBalanceUpdated.toNumber(),
            timeTravelerBalance.toNumber()+timeTravelerStakedTotal.toNumber(),
            "balance does not update after removing the stake")

        //restaking:
        await betterTimesToken.stakeOne(stake_amount, myDeed, 0, {from: timeTraveler});

        //advancing in time:
        await helper.advanceTimeAndBlock(3600*100)

        //checking that the stake has been updated:
        let stake = await betterTimesToken.hasStake(timeTraveler)

        //check that the value has been updated. After 100 hours, the stake amount should have increased by 0.1
        assert.equal(stake.totalAmount.toNumber(), stake_amount+(stake_amount*0.2),
            "stake amount not as expected")
    })

    it("cannot call the stake function without specifying the correct timeframe", async () => {
        let stake_amount= 100
        let timeTraveler = accounts[2]
        try {await betterTimesToken.stakeOne(stake_amount, myDeed, 4, {from: timeTraveler})}
        catch (e) {
            assert.equal(e.reason, "timeframe value not valid" )
            return
        }
        assert(false);
    })

    it("testing approve and transfer with sacredMessage", async () => {
        //giving 100 coins for staking to different 3 different accounts:
        let accountOne =  accounts[3]
        let accountTwo = accounts[4]
        let accountThree = accounts[5]

        betterTimesToken.approve


    })






    //
    // it("reward stakes", async() => {
    //     // Use a fresh Account, send 1000 Tokens to it
    //     let staker = accounts[3];
    //     await betterTimesToken.transfer(staker, 1000);
    //     let initial_balance = await betterTimesToken.balanceOf(staker);
    //     // Make a stake on 200, fast forward 20 hours, claim reward, amount should be Initial balanace +4
    //     await betterTimesToken.stakeTwo(200, myName, myStory, {from: staker});
    //     await helper.advanceTimeAndBlock(3600*20);
    //
    //     let stakeSummary = await betterTimesToken.hasStake(staker);
    //     let stake = stakeSummary.stakes[0];
    //     // Withdraw 100 from stake at index 0
    //     await betterTimesToken.withdrawStake(100, 0, { from: staker});
    //
    //     // Balance of account holder should be updated by 104 tokens
    //     let after_balance = await betterTimesToken.balanceOf(staker);
    //
    //     let expected = 1000-200+100+Number(stake.claimable);
    //     assert.equal(after_balance.toNumber(), expected, "Failed to withdraw the stake correctly")
    //
    //     // Claiming them again should not return any rewards since we reset timer
    //
    //     try{
    //         await betterTimesToken.withdrawStake(100, 0 , {from:staker});
    //     }catch(error){
    //         assert.fail(error);
    //     }
    //     let second_balance = await betterTimesToken.balanceOf(staker);
    //     // we should have gained 100 this time.
    //     assert.equal(second_balance.toNumber(), after_balance.toNumber()+100, "Failed to reset timer second withdrawal reward")
    // });
});
