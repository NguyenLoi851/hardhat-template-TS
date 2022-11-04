import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployMyVRF: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('MyVRF', {
        from: deployer,
        args: [5332],
        log: true,
        deterministicDeployment: false,
    })
}

deployMyVRF.tags = ['MY_VRF']

export default deployMyVRF