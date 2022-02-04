const BetterTimesToken = artifacts.require("BetterTimesToken");

function tokensFromWei(amount) {
    return web3.utils.fromWei(amount)
}


contract("BetterTimesToken", ([owner, tokenUser, stranger]) => {
    let betterTimesToken;

    before(async () => {
        betterTimesToken = await BetterTimesToken.deployed()
    })

    it("should deploy smart contract", async () => {
        console.log(betterTimesToken.address)
        assert(betterTimesToken.address !== "")
    })

    it("owner should be able to add to the WhitelistedToCallSacredMessages mapping", async () => {
        await betterTimesToken.addToSacredMessagesWhitelist(tokenUser)
        assert(await betterTimesToken.WhitelistedToCallSacredMessages(tokenUser))
    })

    it("tokenUser should be able to call the sacred message one and two", async () => {
        assert(await betterTimesToken.SacredMessageOne("working on the better times coin", {from: tokenUser}),
            "sacred message one was called")
        assert(await betterTimesToken.SacredMessageTwo("Narcis", "don't have one", {from: tokenUser}),
            "sacred message two was called")
    })

    it("owner should be able to remove from WhitelistedToCallSacredMessages", async () => {
        await betterTimesToken.removeFromSacredMessagesWhitelist(tokenUser)
        let result = await betterTimesToken.WhitelistedToCallSacredMessages(tokenUser)
        assert(result===false)
    })

    it("owner, tokenUser and stranger SHOULD NOT be able to call SacredMessageOne, since they're not on the whitelist",
        async () => {

            let allUsers = {'owner': owner, 'tokenUser': tokenUser, 'stranger': stranger}

            for (user in allUsers) {
                try {
                    await betterTimesToken.SacredMessageOne("working on the better times coin", {from: allUsers[user]})
                } catch (e) {
                    assert(e.message.includes("only whitelisted addresses can call this function"), "not the right error " +
                        "message for SacredMessageOne")
                    try {
                        await betterTimesToken.SacredMessageTwo("Narcis", "don't have one", {from: allUsers[user]})
                    } catch (e) {
                        assert(e.message.includes("only whitelisted addresses can call this function"), "not the right error " +
                            "message for SacredmessageTwo")
                        continue
                    }
                }
                assert(false, `went through just fine for ${user}`)
            }
        })

    it("should display the amount of coins that are in existence", async () => {
        let totalSupply = await betterTimesToken.totalSupply();
        //converting to wei:
        totalSupply = tokensFromWei(totalSupply)
        assert(totalSupply.toString() === "679000000")
    })
})