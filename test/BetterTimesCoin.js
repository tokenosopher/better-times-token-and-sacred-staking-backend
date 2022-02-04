const BetterTimesToken = artifacts.require("BetterTimesToken");

contract("BetterTimesToken", ([owner, tokenUser]) => {
    let betterTimesToken;

    before(async () => {
        betterTimesToken = await BetterTimesToken.deployed()
    })

    it("should deploy smart contract", async () => {
        console.log(betterTimesToken.address)
        assert(betterTimesToken.address !== "")
    })

})