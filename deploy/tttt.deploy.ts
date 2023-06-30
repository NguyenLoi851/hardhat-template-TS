import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployTTTT: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('TTTT', {
        from: deployer,
        // args: ["Token1","T1"],
        log: true,
        deterministicDeployment: false,
    })
}

deployTTTT.tags = ['TTTT']

export default deployTTTT