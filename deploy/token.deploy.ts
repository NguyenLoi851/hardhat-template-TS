import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployToken: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('Token', {
        from: deployer,
        args: ["Token1","TT1"],
        log: true,
        deterministicDeployment: false,
    })
}

deployToken.tags = ['TOKEN']

export default deployToken