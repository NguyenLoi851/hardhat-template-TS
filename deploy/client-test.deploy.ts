import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployClientTest: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('ClientTest', {
        from: deployer,
        // args: ["Token1","T1"],
        log: true,
        deterministicDeployment: false,
    })
}

deployClientTest.tags = ['CLIENT_TEST']

export default deployClientTest