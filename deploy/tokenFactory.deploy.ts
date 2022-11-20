import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployTokenFactory: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('TokenFactory', {
        from: deployer,
        // args: ["Token1","T1"],
        log: true,
        deterministicDeployment: false,
    })
}

deployTokenFactory.tags = ['TOKEN_FACTORY']

export default deployTokenFactory