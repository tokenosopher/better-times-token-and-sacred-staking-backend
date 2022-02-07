// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../node_modules/openzeppelin-contracts/access/Ownable.sol";

interface InterfaceBetterTimesToken {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}


contract UpnupFaucet is Ownable {

    address public BetterTimesTokenAddress;
    mapping(address => bool) alreadyTaken;

    constructor (address _BetterTimesTokenAddress) {
        BetterTimesTokenAddress = _BetterTimesTokenAddress;
    }

    function setUPNUPAddress(address _newAddress) onlyOwner public {
        BetterTimesTokenAddress = _newAddress;
    }

    function transferUpnup(address receiver) public returns(bool){
        require(alreadyTaken[msg.sender]==false, "You've already withdrawn an Upnup. Please don't abuse the faucet!");
        InterfaceBetterTimesToken upnup = InterfaceBetterTimesToken(BetterTimesTokenAddress);
        upnup.transfer(receiver, 1000000000000000000);
        alreadyTaken[msg.sender]=true;
        return true;
    }

    function withdrawUpnup(uint256 amount) public onlyOwner returns(bool){
        InterfaceBetterTimesToken upnup = InterfaceBetterTimesToken(BetterTimesTokenAddress);
        upnup.transfer(msg.sender, amount);
        return true;
    }
}
