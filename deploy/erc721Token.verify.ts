require('dotenv').config()

import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const verification: DeployFunction = async(hre: HardhatRuntimeEnvironment) =>{

    try {
        const { ethers, deployments, getNamedAccounts} = hre
        const { deployer } = await getNamedAccounts()

        await new Promise((res, _) =>{
            setTimeout(()=>{
                res(true)
            }, 15000)
        })

        const erc721TokenAddress = (await deployments.get('Erc721Token')).address

        console.log('----- START VERIFICATION -----');

        await hre.run('verify:verify', {
            address: erc721TokenAddress,
            constructorArguments: [
                "E721T1","E721T1"
            ],
            contract: "contracts/nft/Erc721Token.sol:Erc721Token"
        })    
    } catch (error) {
        console.log(error);
    }
}

verification.tags = ['VERIFICATION_ERC721TOKEN']
verification.dependencies = ['ERC721TOKEN']
verification.runAtTheEnd = true

export default verification