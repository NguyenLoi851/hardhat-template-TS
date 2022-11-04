// import { HardhatRuntimeEnvironment} from 'hardhat/types'
// import { DeployFunction } from 'hardhat-deploy/types'

// const deployImplV1: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
//     const { ethers, deployments, getNamedAccounts} = hre
//     const { deploy } = deployments
//     const { deployer } = await getNamedAccounts()

//     await deploy('MyImplementationV2', {
//         from: deployer,
//         args: [],
//         log: true,
//         deterministicDeployment: false,
//         proxy: {
//             proxyContract: 'OpenZeppelinTransparentProxy',
//             methodName: 'upgradeTo',
//             viaAdminContract: '0x320a63a00e01b6bd7306E3E2F20923D7C6AC7fCE'
//         }
//     })
// }

// deployImplV1.tags = ['IMPLEMENTATION_V2']

// export default deployImplV1

// NOT WORK