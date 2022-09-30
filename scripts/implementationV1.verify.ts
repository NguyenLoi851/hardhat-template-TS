import { run } from "hardhat"

async function main(){
    await new Promise((res, _) =>{
        setTimeout(()=>{
            res(true)
        }, 15000)
    })

    await run('verify:verify', {
        address: '0x69046B5E67511B0457970BA98d337de5092f1b4d',
        constructorArguments: [

        ]
    })
}

main().catch((error)=>{
    console.error(error);
    process.exit(1);
})