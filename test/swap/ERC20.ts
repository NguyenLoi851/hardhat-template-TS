import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { logTokenBalance, logEthBalance, sign1 } from '../utils'

import { ERC20 } from '../../typechain-types/contracts/swap/core/test/ERC20'
import { ERC20__factory } from '../../typechain-types/factories/contracts/swap/core/test/ERC20__factory'

describe("ERC20", ()=>{

    async function deployFixture(){
        let deployer: SignerWithAddress
        let users: SignerWithAddress[]
        let token: ERC20
        let name: string

        [deployer, ...users] = await ethers.getSigners();
        token = await new ERC20__factory(deployer).deploy(ethers.utils.parseUnits('1000',18));
        name = await token.name();

        return {deployer, users, token, name}
    }

    xit("Should list accounts", async()=>{
        const {deployer, users, token} = await loadFixture(deployFixture)
        const myFunc = (item: SignerWithAddress)=>{
            console.log(item.address)
        }
        users.map(myFunc)
    })

    xit("Should mint", async()=>{
        const {deployer, users, token} = await loadFixture(deployFixture)
        console.log(await token.balanceOf(deployer.address))
    })

    async function transferFixture(){
        const {deployer, users, token} = await loadFixture(deployFixture)
        
        await token.connect(deployer).transfer(users[0].address,ethers.utils.parseUnits('100'));
        await token.connect(deployer).transfer(users[1].address,ethers.utils.parseUnits('100'));
        await token.connect(deployer).transfer(users[2].address,ethers.utils.parseUnits('100'));
        await token.connect(deployer).transfer(users[3].address,ethers.utils.parseUnits('100'));
        await token.connect(deployer).transfer(users[4].address,ethers.utils.parseUnits('100'));
        await token.connect(deployer).transfer(users[5].address,ethers.utils.parseUnits('100'));
        await token.connect(users[2]).transfer(users[0].address,ethers.utils.parseUnits('20'));

        await token.connect(users[5]).approve(users[4].address, ethers.utils.parseUnits('80'));
        await token.connect(users[4]).transferFrom(users[5].address, users[1].address, ethers.utils.parseUnits('30'));
        
        /**
         * Balance:
         * deployer 1000
         * user0 100-120
         * user1 100-130
         * user2 100-80
         * user3 100
         * user4 100
         * user5 100-70
         * 
         * Allowance:
         * user5 - user4 80-50(
         * 
         * Permit:
         * user3 - user2 (user 1 call permit()) (50)
         * 
         */
        return {token}

    }

    xit("Should transfer", async()=>{
        const {deployer, users} = await loadFixture(deployFixture)
        const {token} = await loadFixture(transferFixture)
        logTokenBalance('deployer', await token.balanceOf(deployer.address))
        logTokenBalance('user 0', await token.balanceOf(users[0].address))
        logEthBalance('deployer', await deployer.getBalance())
    })

    xit("Should balance", async()=>{
        const {deployer, users} = await loadFixture(deployFixture)
        const {token} = await loadFixture(transferFixture)
        logTokenBalance('deployer', await token.balanceOf(deployer.address))
        logTokenBalance('user 0', await token.balanceOf(users[0].address))
        logTokenBalance('user 1', await token.balanceOf(users[1].address))
        logTokenBalance('user 2', await token.balanceOf(users[2].address))
        logTokenBalance('user 3', await token.balanceOf(users[3].address))
        logTokenBalance('user 4', await token.balanceOf(users[4].address))
        logTokenBalance('user 5', await token.balanceOf(users[5].address))
    })

    xit("Should info",async()=>{
        const {deployer, users} = await loadFixture(deployFixture)
        const {token} = await loadFixture(transferFixture)
        console.log(await token.DOMAIN_SEPARATOR())
        console.log(await token.PERMIT_TYPEHASH())
        console.log(await token.allowance(users[5].address, users[4].address))
        console.log(await token.nonces(users[1].address))
    })

    it("Should permit 1", async()=>{
        const {deployer, users, name} = await loadFixture(deployFixture)
        const {token} = await loadFixture(transferFixture)
        
        // user3 permit user2 50 token
        const user3Nonce = await token.nonces(users[3].address)
        const deadline = +(Date.now()/1000).toFixed() + 3*24*60*60
        const value = ethers.utils.parseUnits('50')
        const signature1 = await sign1(users[3], name, token.address, users[3].address, users[2].address, value,user3Nonce, deadline)
        console.log(signature1)
        const splitedSignature1 = ethers.utils.splitSignature(signature1)

        console.log(await token.allowance(users[3].address, users[2].address))

        await token.connect(users[1]).permit(users[3].address, users[2].address, value, deadline, splitedSignature1.v, splitedSignature1.r, splitedSignature1.s)

        console.log(await token.allowance(users[3].address, users[2].address))

    })

})