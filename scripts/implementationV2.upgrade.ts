import { ethers, upgrades } from 'hardhat'

async function main() {
    const ImplementationV2 = await ethers.getContractFactory("MyImplementationV2")
    const impl = await upgrades.upgradeProxy("0x5D58d904d8f057Ec8B21fb1FD444ac1948B863BA", ImplementationV2)
    console.log("Upgraded to", impl.address);
}

main().catch((error)=>{
    console.error(error);
    process.exit(1);
})