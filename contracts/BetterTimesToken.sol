// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "../node_modules/openzeppelin-contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-contracts/access/Ownable.sol";
import "./SacredCoin.sol";
import "./SacredStakeable.sol";

contract BetterTimesToken is ERC20, Ownable, SacredCoin, SacredStakeable {

    constructor() ERC20("Better Times Token", "UPNUP") {

        /**
        * @dev minting 679 million coins, an estimate of how much people are living in poverty at the moment of
        * the coin creation
        */
        _mint(msg.sender, 679000000 * 10 ** decimals());

        /**
        * @dev calling the setGuideline function to create 2 guidelines:
        */

        setGuideline("Help to remove poverty", "Every time you share or stake the coin, think of ways in which you can help to remove poverty in the world, and whenever possible act on those thoughts. It can be something at the level of your family, your community, your city, up to the whole world.");
        setGuideline("Share the coin with those in need", "Perhaps one of the best ways to potentially remove poverty is to share the Easier Times Token with those who find themselves fallen on hard times. That way, a high demand of the coin can become synonymous with reducing poverty in the world, since whoever has these coins will have their finances improving.");
    }

    mapping (address => bool) public WhitelistedToCallSacredMessages;


    event SacredEvent(string BetterTimesMessage);

    /**
    * @dev Whitelist that has the ability to emit events.
    */
    modifier onlyWhitelistedToCallSacredMessages() {
        require(isInSacredMessagesWhitelist(msg.sender), "only whitelisted addresses can call this function");
        _;
    }

    function isInSacredMessagesWhitelist(address _address) public view returns (bool) {
        return WhitelistedToCallSacredMessages[_address];
    }

    function addToSacredMessagesWhitelist(address _whitelistedAddress) public onlyOwner {
        WhitelistedToCallSacredMessages[_whitelistedAddress]=true;
    }

    function removeFromSacredMessagesWhitelist(address _whitelistedAddress) public onlyOwner{
        WhitelistedToCallSacredMessages[_whitelistedAddress]=false;
    }

    function SacredMessageOne(string memory yourDeeds) private {
        emit SacredEvent(string(abi.encodePacked("Lately, I helped to remove poverty from the world by ", yourDeeds)));
    }

    function SacredMessageTwo(string memory name, string memory story) private {
        emit SacredEvent(string(abi.encodePacked(name, "'s hard times story is ", story)));
    }

    function transferSacredOne(address to, uint tokens, string memory yourDeeds) public {
        super.transfer(to, tokens);
        SacredMessageOne(yourDeeds);
    }

    function transferSacredTwo(address to, uint tokens, string memory name, string memory gratitudeObject) public {
        super.transfer(to, tokens);
        SacredMessageTwo(name, gratitudeObject);
    }

    function transferFromSacredOne(address sender, address recipient, uint256 amount, string memory yourDeeds) public {
        super.transferFrom(sender, recipient, amount);
        SacredMessageOne(yourDeeds);
    }

    function transferFromSacredTwo(address sender, address recipient, uint256 amount, string memory name, string memory story) public {
        super.transferFrom(sender, recipient, amount);
        SacredMessageTwo(name, story);
    }

    /**
    * Add functionality like burn to the _stake afunction
    *
    */
    function stake(uint256 _amount, uint8 timeframe) internal {
        // Make sure staker actually is good for it
        require(_amount < balanceOf(msg.sender), "BetterTimesToken: Cannot stake more than you own");

        _stake(_amount, timeframe);
        // Burn the amount of tokens on the sender
        _burn(msg.sender, _amount);
    }

    function stakeOne(uint256 _amount, string memory yourDeeds, uint8 timeframe) public {
        stake(_amount, timeframe);
        SacredMessageOne(yourDeeds);
    }

    function stakeTwo(uint256 _amount, string memory name, string memory story, uint8 timeframe) public {
        stake(_amount, timeframe);
        SacredMessageTwo(name, story);
    }

    /**
    * @notice withdrawStake is used to withdraw stakes from the account holder
     */
    function withdrawStake()  public {

        uint256 amount_to_mint = _withdrawStake();
        // Return staked tokens to user
        _mint(msg.sender, amount_to_mint);
    }
}
