// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
* @notice SacredStakeable is a contract meant to be inherited by other Sacred Coins
* adapted from https://github.com/percybolmer/DevToken/tree/stakeable (MIT Licensed)
*/
contract SacredStakeable {

    /**
    * @notice Constructor since this contract is not meant to be used without inheritance
    * push once to stakeholders for it to work properly
     */
    constructor() {
        // This push is needed so we avoid index 0 causing bug of index-1
        stakeholders.push();
    }
    /**
     * @notice
     * A stake struct is used to represent the way we store stakes, 
     * A Stake will contain the users address, the amount staked and a timestamp, 
     * Since which is when the stake was made
     * @notice
     * Customization: Only the Stake struct will be used
     */
    struct Stake{
        address user;
        uint256 amount;
        uint256 since;
        // This claimable field is used to tell how big of a reward is currently available
        uint256 claimable;
        //Customization. This records the choice of staking time: 0=1 week, 1=2 weeks, 2=4 weeks.
        uint256 timeframe;
    }
    /**
    * @notice Stakeholder is a staker that has active stakes
     */
//    struct Stakeholder{
//        address user;
//        Stake[] address_stakes;
//
//    }
    /**
    * @notice
     * StakingSummary is a struct that is used to contain all stakes performed by a certain account
     */
    struct StakingSummary{
        uint256 total_amount;
        uint256 SecondsToEndOfStakingRewards;
    }

    /**
    * @notice 
    *   This is a array where we store all Stakes that are performed on the Contract
    *   The stakes for each address are stored at a certain index, the index can be found using the stakes mapping
    */
    Stake[] internal stakeholders;
    /**
    * @notice 
    * stakes is used to keep track of the INDEX for the stakers in the stakeholders array
     */
    mapping(address => uint256) internal stakes;
    /**
    * @notice Staked event is triggered whenever a user stakes tokens, address is indexed to make it filterable
     */
    event Staked(address indexed user, uint256 amount, uint256 timestamp);

    /**
     * @notice
      rewardPerHour is 1000 because it is used to represent 0.001, since we only use integer numbers
      This will give users 0.1% reward for each staked token / H
     */
    uint256 internal rewardPerHour = 1000;

    /**
    * @notice _addStakeholder takes care of adding a stakeholder to the stakeholders array
     */
    function _addStakeholder(address staker) internal returns (uint256){
        // Push a empty item to the Array to make space for our new stakeholder
        stakeholders.push();
        // Calculate the index of the last item in the array by Len-1
        uint256 userIndex = stakeholders.length - 1;
        // Assign the address to the new index
        stakeholders[userIndex].user = staker;
        // Add index to the stakeHolders
        stakes[staker] = userIndex;
        return userIndex;
    }

    /**
    * @notice
    * _Stake is used to make a stake for an sender. It will remove the amount staked from the stakers account and place those tokens inside a stake container
    * StakeID 
    */
    function _stake(uint256 _amount, uint256 timeframe) internal{
        // Simple check so that user does not stake 0 
        require(_amount > 0, "Cannot stake nothing");
        require(timeframe == 0 || timeframe == 1 || timeframe == 2, "timeframe value not valid");


        // Mappings in solidity creates all values, but empty, so we can just check the address
        uint256 index = stakes[msg.sender];
        // block.timestamp = timestamp of the current block in seconds since the epoch
        uint256 timestamp = block.timestamp;
        // See if the staker already has a staked index or if its the first time
        if(index == 0){
            // This stakeholder stakes for the first time
            // We need to add him to the stakeHolders and also map it into the Index of the stakes
            // The index returned will be the index of the stakeholder in the stakeholders array
            index = _addStakeholder(msg.sender);
            stakeholders[index].amount = _amount;
        }
        else {
            _amount = calculateStakeReward(stakeholders[index]) + _amount;
        }
        stakeholders[index].since = timestamp;

        // Emit an event that the stake has occurred
        emit Staked(msg.sender, _amount, timestamp);

        //Modification: set the timeframe based on
        if(timeframe==0) {
        stakeholders[index].timeframe = 1 weeks;
        }
        else if(timeframe==1) {
            stakeholders[index].timeframe = 2 weeks;
        }
        else if(timeframe==2) {
            stakeholders[index].timeframe = 4 weeks;
        }
    }

    /**
      * @notice
      * calculateStakeReward is used to calculate how much a user should be rewarded for their stakes
      * and the duration the stake has been active
     */
    function calculateStakeReward(Stake memory _current_stake) internal view returns(uint256){
        // First calculate how long the stake has been active
        // Use current seconds since epoch - the seconds since epoch the stake was made
        // The output will be duration in SECONDS ,
        // We will reward the user 0.1% per Hour So that's 0.1% per 3600 seconds
        // the algorithm is  seconds = block.timestamp - stake seconds (block.timestamp - _stake.since)
        // hours = Seconds / 3600 (seconds /3600) 3600 is an variable in Solidity names hours
        // we then multiply each token by the hours staked , then divide by the rewardPerHour rate
        //Modification: if block.timestamp is after the staking timeframe, then the user does not receive reward:
        if(block.timestamp > _current_stake.since + _current_stake.timeframe) {
            return 0;
        }
        else {
            return (((block.timestamp - _current_stake.since) / 1 hours) * _current_stake.amount) / rewardPerHour;
        }
    }

    /**
     * @notice
     * function to remove a stake and the stakeholder:
    */
    function removeStakeholder(uint index) private {
        delete stakes[msg.sender];
        delete stakeholders[index];
    }


    /**
     * @notice
     * withdrawStake takes in an amount and a index of the stake and will remove tokens from that stake
     * Notice index of the stake is the users stake counter, starting at 0 for the first stake
     * Will return the amount to MINT onto the account
     * Will also calculateStakeReward and reset timer
    */
    function _withdrawStake() internal returns(uint256){
        // Grab user_index which is the index to use to grab the Stake[]
        uint256 user_index = stakes[msg.sender];
        require(user_index!=0,"you do not have any coins staked");

        uint256 currentAmount = stakeholders[user_index].amount;

        // Calculate available Reward first before we start modifying data
        uint256 reward = calculateStakeReward(stakeholders[user_index]);

        removeStakeholder(user_index);
        return currentAmount+reward;
    }


    /**
    * @notice
     * hasStake is used to check if a account has stakes and the total amount along with all the separate stakes
     */
    function hasStake(address _staker) public view returns(bool isStaking, StakingSummary memory, uint user_index){

        StakingSummary memory summary = StakingSummary(0, 0);

        user_index = stakes[_staker];

        if (user_index==0) {
            isStaking = false;
        } else {
            isStaking=true;
            uint256 reward = calculateStakeReward(stakeholders[user_index]);
            summary.total_amount=reward+stakeholders[user_index].amount;

            summary.SecondsToEndOfStakingRewards = block.timestamp - stakeholders[user_index].since+stakeholders[user_index].timeframe;
        }
        return (isStaking,summary, user_index);
    }

    function returnIndex(address _staker) public view returns(uint user_index){

        return stakes[_staker];

}
}