const BetterTimesToken = artifacts.require('BetterTimesToken')
const UpnupFaucet = artifacts.require('UpnupFaucet')

function tokens(amount) {
    return web3.utils.toWei(amount)
}


function wei(amount) {
    return web3.utils.fromWei(amount)
}

module.exports = async function (deployer, network, accounts) {
    console.log(network)
    await deployer.deploy(BetterTimesToken)
    const betterTimesToken = await BetterTimesToken.deployed()


    await deployer.deploy(UpnupFaucet, betterTimesToken.address)
    let upnupFaucet = await UpnupFaucet.deployed()

    console.log(`Better times token address is ${betterTimesToken.address}`)
    console.log(`upnupFaucetAddress is ${upnupFaucet.address}`)

    await betterTimesToken.transferSacredOne(upnupFaucet.address, tokens('100'), "working on this project")


    // await betterTimesToken.transfer(accounts[1], tokens('100'))
    // await betterTimesToken.balanceOf(accounts[1])
}