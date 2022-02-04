const BetterTimesToken = artifacts.require("BetterTimesToken");

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

    it("neither owner or tokenUser or stranger should be able to call sacred message one and two")
})