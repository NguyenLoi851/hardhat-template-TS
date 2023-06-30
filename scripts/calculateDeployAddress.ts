import { ethers } from "ethers"

const getAddress = (from: string, nonce: number) => {
    console.log(ethers.utils.getContractAddress({
        from,
        nonce
    })) 
}

// getAddress('0x9460b481366b7462af4f7991d430e5eB97FAAEB5', 70)
// getAddress('0x9460b481366b7462af4f7991d430e5eB97FAAEB5', 71)
getAddress('0x9460b481366b7462af4f7991d430e5eB97FAAEB5', 72)
