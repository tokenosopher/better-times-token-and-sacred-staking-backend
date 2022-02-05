
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

        // Stake the amount, notice the FROM parameter which specifes what the msg.sender address will be


        let stakeID = await betterTimesToken.stakeOne(stake_amount, myDeed, 0, {from: owner});
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (it's the event and will contain the values we emitted)
                assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
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
                assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
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

    it("withdrawing stake leads to isStaking being false, and StakingSummary being 0,0", async () => {
        await betterTimesToken.withdrawStake({from:owner});
        // let hasStake = await betterTimesToken.hasStake(accounts[1])
        // let hasStake2 = await betterTimesToken.hasStake(accounts[2])
        let hasStake3 = await betterTimesToken.hasStake(owner)
        // console.log(hasStake3.isStaking)
        // console.log(hasStake3)
        // console.log(hasStake3.user_index.toString())
        let index = await betterTimesToken.returnIndex(owner)
        console.log(index.toString())

    })

    // it("new stakeholder should have increased index", async () => {
    //     let stake_amount = 100;
    //     let stakeID = await betterTimesToken.stakeOne(stake_amount, myDeed,{from: accounts[1]});
    //     // Assert on the emittedevent using truffleassert
    //     // This will capture the event and inside the event callback we can use assert on the values returned
    //     truffleAssert.eventEmitted(
    //         stakeID,
    //         "Staked",
    //         (ev) => {
    //             // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
    //             assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
    //             assert.equal(ev.index, 2, "Stake index was not correct");
    //             return true;
    //         },
    //         "Stake event should have triggered");
    // })
    //

    //
    // it("cant withdraw bigger amount than current stake", async() => {
    //
    //     let owner = accounts[0];
    //
    //     // Try withdrawing 200 from first stake
    //     try {
    //         await betterTimesToken.withdrawStake(200, 0, {from:owner});
    //     }catch(error){
    //         assert.equal(error.reason, "Staking: Cannot withdraw more than you have staked", "Failed to notice a too big withdrawal from stake");
    //     }
    // });
    //
    // it("withdraw 50 from a stake", async() => {
    //
    //     let owner = accounts[0];
    //     let withdraw_amount = 50;
    //     // Try withdrawing 50 from first stake
    //     await betterTimesToken.withdrawStake(withdraw_amount, 0, {from:owner});
    //     // Grab a new summary to see if the total amount has changed
    //     let summary = await betterTimesToken.hasStake(owner);
    //
    //     assert.equal(summary.total_amount, 200-withdraw_amount, "The total staking amount should be 150");
    //     // Itterate all stakes and verify their amount aswell.
    //     let stake_amount = summary.stakes[0].amount;
    //
    //     assert.equal(stake_amount, 100-withdraw_amount, "Wrong Amount in first stake after withdrawal");
    // });
    //
    // it("remove stake if empty", async() => {
    //
    //     let owner = accounts[0];
    //     let withdraw_amount = 50;
    //     // Try withdrawing 50 from first stake AGAIN, this should empty the first stake
    //     await betterTimesToken.withdrawStake(withdraw_amount, 0, {from:owner});
    //     // Grab a new summary to see if the total amount has changed
    //     let summary = await betterTimesToken.hasStake(owner);
    //
    //     assert.equal(summary.stakes[0].user, "0x0000000000000000000000000000000000000000", "Failed to remove stake when it was empty");
    // });
    //
    // it("calculate rewards", async() => {
    //
    //     let owner = accounts[0];
    //
    //     // Owner has 1 stake at this time, its the index 1 with 100 Tokens staked
    //     // So lets fast forward time by 20 Hours and see if we gain 2% reward
    //     const newBlock = await helper.advanceTimeAndBlock(3600*20);
    //     let summary = await betterTimesToken.hasStake(owner);
    //
    //
    //     let stake = summary.stakes[1];
    //     assert.equal(stake.claimable, 100*0.02, "Reward should be 2 after staking for twenty hours with 100")
    //     // Make a new Stake for 1000, fast forward 20 hours again, and make sure total stake reward is 24 (20+4)
    //     // Remember that the first 100 has been staked for 40 hours now, so its 4 in rewards.
    //     await betterTimesToken.stakeTwo(1000, myName, myStory,{from: owner});
    //     await helper.advanceTimeAndBlock(3600*20);
    //
    //     summary = await betterTimesToken.hasStake(owner);
    //
    //     stake = summary.stakes[1];
    //     let newstake = summary.stakes[2];
    //
    //     assert.equal(stake.claimable, (100*0.04), "Reward should be 4 after staking for 40 hours")
    //     assert.equal(newstake.claimable, (1000*0.02), "Reward should be 20 after staking 20 hours");
    // });
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
