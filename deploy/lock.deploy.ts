import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { keccak256 } from 'ethers/lib/utils'

const deployLock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, getNamedAccounts} = hre
    const { deploy, deterministic } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('Lock', {
        from: deployer,
        args: [ethers.utils.parseUnits('150', 18)],
        log: true,
        deterministicDeployment: true,
    })

    // const res = await deterministic('Lock', {
    //     salt: keccak256('0x1234'),
    //     from: deployer,
    //     args: [ethers.utils.parseUnits('150', 18)],
    //     log: true
    // })

    // console.log(res.address)
    // console.log(res.implementationAddress)
    // await res.deploy()
}

deployLock.tags = ['LOCK']

export default deployLock