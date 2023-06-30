import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"
import { ethers } from "hardhat"
import { MyToken, MyToken__factory, Distribute, Distribute__factory} from "../typechain-types"

describe("Estimate gas",()=>{
    async function deployFixture(){
        let users: SignerWithAddress[]
        let myToken: MyToken
        let distributeContract: Distribute

        [...users] = await ethers.getSigners()

        myToken = await new MyToken__factory(users[0]).deploy();
        distributeContract = await new Distribute__factory(users[0]).deploy(myToken.address);
        // await myToken.connect(users[0]).transfer(distributeContract.address, await myToken.balanceOf(users[0].address))
        await myToken.connect(users[0]).approve(distributeContract.address, await myToken.balanceOf(users[0].address))
        return {users, myToken, distributeContract}
    }

    xit("Should", async()=>{
        const {users, myToken, distributeContract} = await loadFixture(deployFixture)
        await myToken.connect(users[0]).mint(users[1].address, ethers.utils.parseUnits('1000'));
        // console.log(users.address)
    })
    it("Should", async()=>{
        const {users, myToken, distributeContract} = await loadFixture(deployFixture)
        let accounts: string[] = Array();
        let amounts: BigNumber[] = Array();
        let maxAccounts = 993;
        for(let i=0;i<maxAccounts;i++){
            accounts.push(users[i%20].address);
            amounts.push(ethers.utils.parseUnits('1','1'))
        }
        // for(let i=0,cnt=0;cnt<maxAccounts && i<2;i++){
        //     users.forEach(function (item){
        //         // console.log(item.address)
        //         accounts.push(item.address)
        //         amounts.push(ethers.utils.parseUnits('1'))
        //         cnt++;
        //     })
        // }
        // console.log(await myToken.balanceOf(users[5].address))
        console.log(accounts.length);
        await distributeContract.connect(users[0]).distribute(accounts, amounts, {gasLimit: 7920026});
        // console.log(await myToken.balanceOf(users[5].address))
    })

})