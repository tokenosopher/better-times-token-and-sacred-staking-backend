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

    it("neither owner or tokenUser or stranger should be able to call sacred message one and two", async () => {
        try {
            await betterTimesToken.SacredMessageOne("working on the better times coin", {from: sender})
        } catch (e) {
            assert(e.message.includes("only whitelisted addresses can call this function"))
            return
        }
        assert(false)

        // async function writeSacredMessage(sender, assert) {
        //     try {
        //         await betterTimesToken.SacredMessageOne("working on the better times coin", {from: sender})
        //     } catch (e) {
        //         assert(e.message.includes("only whitelisted addresses can call this function"))
        //     }
        //     try {
        //         await betterTimesToken.SacredMessageTwo("Narcis", "don't have one", {from: sender})
        //     } catch (e) {
        //         assert(e.message.includes("only whitelisted addresses can call this function"))
        //         return
        //     }
        //     assert(false)
        // }
        //
        // //writing a sacred message using each of the accounts and checking that an error is thrown
        // writeSacredMessage(tokenUser, assert)
        // writeSacredMessage(owner, assert)
        // writeSacredMessage(stranger,assert)
    })

    it("should display the amount of coins that are in existence", async () => {
        let totalSupply = await betterTimesToken.totalSupply();
        //converting to wei:
        totalSupply = tokensFromWei(totalSupply)
        assert(totalSupply.toString() === "679000000")
    })

})