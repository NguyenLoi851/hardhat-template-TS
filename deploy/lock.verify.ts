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

        const lockAddr = (await deployments.get('Lock')).address

        console.log('----- START VERIFICATION -----');

        await hre.run('verify:verify', {
            address: lockAddr,
            constructorArguments: [
                ethers.utils.parseUnits('1',18)
            ]
        })    
    } catch (error) {
        console.log(error);
    }
}

verification.tags = ['VERIFICATION_LOCK']
verification.dependencies = ['LOCK']
verification.runAtTheEnd = true

export default verification