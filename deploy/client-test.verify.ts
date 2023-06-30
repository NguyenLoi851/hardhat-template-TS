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
            }, 150)
        })

        const clientTestAddr = (await deployments.get('ClientTest')).address

        console.log('----- START VERIFICATION -----');

        await hre.run('verify:verify', {
            address: clientTestAddr,
            // constructorArguments: [
            //     "Token1","TT1"
            // ],
            contract: "contracts/client-test/ClientTest.sol:ClientTest"
        })    
    } catch (error) {
        console.log(error);
    }
}

verification.tags = ['VERIFICATION_CLIENT_TEST']
// verification.dependencies = ['CLIENT_TEST']
// verification.runAtTheEnd = true

export default verification