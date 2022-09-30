import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployLock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('Lock', {
        from: deployer,
        args: [ethers.utils.parseUnits('1', 18)],
        log: true,
        deterministicDeployment: false,
    })
}

deployLock.tags = ['LOCK']

export default deployLock