import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployTestTenderly: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const tenderlyContract = await deploy('TestTenderly', {
        from: deployer,
        // args: ["Token1","T1"],
        log: true,
        deterministicDeployment: false,
    })

    await hre.tenderly.verify({
        name: "TestTenderly",
        address: tenderlyContract.address
    })
}

deployTestTenderly.tags = ['TENDERLY']

export default deployTestTenderly

// not working