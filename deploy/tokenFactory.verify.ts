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

        const tokenFactoryAddr = (await deployments.get('TokenFactory')).address

        console.log('----- START VERIFICATION -----');

        await hre.run('verify:verify', {
            address: tokenFactoryAddr,
            // constructorArguments: [
            //     "Token1","T1"
            // ],
            contract: "contracts/minimalProxy/TokenFactory.sol:TokenFactory"
        })    
    } catch (error) {
        console.log(error);
    }
}

verification.tags = ['VERIFICATION_TOKEN_FACTORY']
verification.dependencies = ['TOKEN_FACTORY']
verification.runAtTheEnd = true

export default verification