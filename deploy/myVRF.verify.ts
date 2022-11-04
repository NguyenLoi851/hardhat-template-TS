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

        const myVRF = (await deployments.get('MyVRF')).address

        console.log('----- START VERIFICATION -----');

        await hre.run('verify:verify', {
            address: myVRF,
            constructorArguments: [5332]
        })    
    } catch (error) {
        console.log(error);
    }
}

verification.tags = ['VERIFICATION_MY_VRF']
verification.dependencies = ['MY_VRF']
// verification.runAtTheEnd = true

export default verification