import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployPriceConsumerV3: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('PriceConsumerV3', {
        from: deployer,
        args: [],
        log: true,
        deterministicDeployment: false,
    })
}

deployPriceConsumerV3.tags = ['PRICE_CONSUMER_V3']

export default deployPriceConsumerV3