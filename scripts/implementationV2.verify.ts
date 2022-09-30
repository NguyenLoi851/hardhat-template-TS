import { run } from "hardhat"

async function main(){
    await new Promise((res, _) =>{
        setTimeout(()=>{
            res(true)
        }, 15000)
    })

    await run('verify:verify', {
        address: '0x0C45232Ea6Df53e72A1D7cc33399878e9b0bdDbb',
        constructorArguments: [

        ]
    })
}

main().catch((error)=>{
    console.error(error);
    process.exit(1);
})