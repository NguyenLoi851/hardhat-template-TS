import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Contract, ContractInterface } from "ethers"
import { ethers } from "hardhat"
import axios from 'axios'
import 'dotenv/config'
import { UniswapV2ERC20, UniswapV2ERC20__factory } from '../typechain-types'
import { logTokenBalance, logEthBalance} from './utils'

describe("Forking mainnet", () => {
    async function deployFixture() {
        let deployer: SignerWithAddress
        let users: SignerWithAddress[]
        let seaportAddr, DAITokenAddr: string
        let seaport, daiToken: Contract
        let seaportABI, DAITokenABI: ContractInterface
        let url: string
        var impersonatedSigner: SignerWithAddress[] = Array();

        [deployer, ...users] = await ethers.getSigners()

        impersonatedSigner.push(await ethers.getImpersonatedSigner('0x54aBDa6CC4C21ea4fFe476BF1b6B8b4FD39b18a6'))
        impersonatedSigner[1] = await ethers.getImpersonatedSigner('0x6FFFE9a866ef7D60931559e3E5a49809d886588C')

        // seaport contract
        seaportAddr = '0x00000000006c3852cbEf3e08E8dF289169EdE581'
        url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${seaportAddr}&apikey=${process.env.ETHERSCAN_API_KEY}`
        const response = await axios.get(url)
        seaportABI = response.data.result
        seaport = new Contract(seaportAddr, seaportABI)

        // DAI token contract
        DAITokenAddr = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
        url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${DAITokenAddr}&apikey=${process.env.ETHERSCAN_API_KEY}`
        const response2 = await axios.get(url)
        DAITokenABI = response2.data.result
        daiToken = new Contract(DAITokenAddr, DAITokenABI)

        return { deployer, users, seaport, impersonatedSigner, seaportAddr, daiToken}
    }

    xit("Should block number, network", async () => {
        const { deployer, users } = await loadFixture(deployFixture)
        console.log(deployer.address)
        const printAddr = (item: SignerWithAddress) => {
            console.log(item.address)
        }
        users.map(printAddr)
        console.log(await ethers.provider.getBlockNumber())
        console.log(await ethers.provider.getNetwork())
    })

    xit("Should transaction", async () => {
        console.log(await ethers.provider.getTransaction('0xef387ef38439bf43cd61052f6af6998183155baf0e0eb89edb2533ac2c566476'))
    })

    xit("Should impersonated signer", async () => {
        const {deployer, users, seaport, impersonatedSigner} = await loadFixture(deployFixture)
        console.log(await impersonatedSigner[0].getBalance())
    })

    xit("Should seaport", async()=>{
        const {deployer, users, seaport} = await loadFixture(deployFixture)
        console.log(await seaport.connect(deployer).name())
        console.log(await seaport.connect(users[0]).information())
    })

    it("Should DAI token", async()=>{
        const {deployer, daiToken, impersonatedSigner} = await loadFixture(deployFixture)
        console.log(await daiToken.connect(deployer)['name']())
        logEthBalance('impersonatedSigner 1', await impersonatedSigner[1].getBalance())
        logTokenBalance('impersonatedSigner 1', await daiToken.connect(impersonatedSigner[1]).balanceOf(impersonatedSigner[1].address), "DAI")
        logTokenBalance('deployer', await daiToken.connect(deployer).balanceOf(deployer.address),'DAI')

        await daiToken.connect(impersonatedSigner[1]).transfer(deployer.address, ethers.utils.parseUnits('1000'))
        logEthBalance('impersonatedSigner 1', await impersonatedSigner[1].getBalance())
        logTokenBalance('impersonatedSigner 1', await daiToken.connect(impersonatedSigner[1]).balanceOf(impersonatedSigner[1].address), "DAI")
        logTokenBalance('deployer', await daiToken.connect(deployer).balanceOf(deployer.address),'DAI')

    })
})