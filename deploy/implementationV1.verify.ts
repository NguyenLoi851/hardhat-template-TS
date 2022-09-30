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

        const implV1Addr = (await deployments.get('MyImplementationV1')).address

        console.log('----- START VERIFICATION -----');

        await hre.run('verify:verify', {
            address: implV1Addr,
            constructorArguments: [
                
            ]
        })    
    } catch (error) {
        console.log(error);
    }
}

verification.tags = ['VERIFICATION_IMPLEMENTATION_V1']
verification.dependencies = ['IMPLEMENTATION_V1']
verification.runAtTheEnd = true

export default verification