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

        const ttttAddr = (await deployments.get('TTTT')).address

        console.log('----- START VERIFICATION -----');

        await hre.run('verify:verify', {
            address: ttttAddr,
            // constructorArguments: [
            //     "Token1","T1"
            // ],
            contract: "contracts/TTTT.sol:TTTT"
        })    
    } catch (error) {
        console.log(error);
    }
}

verification.tags = ['VERIFY_TTTT']
// verification.dependencies = ['TTTT']
// verification.runAtTheEnd = true

export default verification