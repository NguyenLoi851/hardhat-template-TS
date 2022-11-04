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

        const priceConsumerV3 = (await deployments.get('PriceConsumerV3')).address

        console.log('----- START VERIFICATION -----');

        await hre.run('verify:verify', {
            address: priceConsumerV3,
            constructorArguments: []
        })    
    } catch (error) {
        console.log(error);
    }
}

verification.tags = ['VERIFICATION_PRICE_CONSUMER_V3']
verification.dependencies = ['PRICE_CONSUMER_V3']
// verification.runAtTheEnd = true

export default verification