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

        const tokenAddr = (await deployments.get('Token')).address

        console.log('----- START VERIFICATION -----');

        await hre.run('verify:verify', {
            address: tokenAddr,
            constructorArguments: [
                "Token1","TT1"
            ],
            contract: "contracts/minimalProxy/Token.sol:Token"
        })    
    } catch (error) {
        console.log(error);
    }
}

verification.tags = ['VERIFICATION_TOKEN']
verification.dependencies = ['TOKEN']
verification.runAtTheEnd = true

export default verification