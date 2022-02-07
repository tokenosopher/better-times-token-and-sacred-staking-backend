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

    it("should display the amount of coins that are in existence", async () => {
        let totalSupply = await betterTimesToken.totalSupply();
        //converting to wei:
        totalSupply = tokensFromWei(totalSupply)
        assert(totalSupply.toString() === "679000000")
    })
})