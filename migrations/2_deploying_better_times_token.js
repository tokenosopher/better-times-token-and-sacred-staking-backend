const BetterTimesToken = artifacts.require('BetterTimesToken')

function tokens(amount) {
    return web3.utils.toWei(amount)
}

module.exports = async function (deployer, network, accounts) {
    console.log(network)
    await deployer.deploy(BetterTimesToken)
    const betterTimesToken = await BetterTimesToken.deployed()

    // await betterTimesToken.transfer(accounts[1], tokens('100'))
    // await betterTimesToken.balanceOf(accounts[1])
}