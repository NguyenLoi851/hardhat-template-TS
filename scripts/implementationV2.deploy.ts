import { ethers, run, upgrades } from 'hardhat'

async function main() {
    const ImplementationV2 = await ethers.getContractFactory("MyImplementationV2")
    // const transparentProxy = await upgrades.deployProxy(ImplementationV1, [])
    const impl = await ImplementationV2.deploy();
    await impl.deployed()
    // console.log("Proxy is deployed at: ",transparentProxy.address);
    console.log("Impl2 addr: ", impl.address)
}

main().catch((error)=>{
    console.error(error);
    process.exit(1);
})