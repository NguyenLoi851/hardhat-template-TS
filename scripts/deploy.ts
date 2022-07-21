import { ethers, run } from "hardhat";

async function timeout(ms: number){
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
const [deployer] = await ethers.getSigners();

  const Code = await ethers.getContractFactory("Code");
  const name: string = "LoiCoin";
  const symbol: string = "LC";
  console.log("Deploy with accounts: ",deployer.address);
  console.log("Balance of deployer: ", (await deployer.getBalance()).toString());
  
  const code = await Code.deploy(name, symbol);
  await code.deployed();

  console.log("Contract is deployed at: ",code.address);
  

  await timeout(60000);
  await run("verify:verify", {
    address: code.address,
    constructorArguments: [name, symbol],
    contract: "contracts/Code.sol:Code"
  })
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// address: 0x3c8DA8100A53245F4499DbF039AF553E889D6E18