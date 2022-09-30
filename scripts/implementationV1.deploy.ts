import { ethers, run, upgrades } from 'hardhat'

async function main() {
    const ImplementationV1 = await ethers.getContractFactory("MyImplementationV1")
    const transparentProxy = await upgrades.deployProxy(ImplementationV1, [])
    await transparentProxy.deployed()
    console.log("Proxy is deployed at: ",transparentProxy.address);
}

main().catch((error)=>{
    console.error(error);
    process.exit(1);
})