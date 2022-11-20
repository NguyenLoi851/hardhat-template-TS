import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployERC721Token: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('Erc721Token', {
        from: deployer,
        args: ["E721T1","E721T1"],
        log: true,
        deterministicDeployment: false,
    })
}

deployERC721Token.tags = ['ERC721TOKEN']

export default deployERC721Token