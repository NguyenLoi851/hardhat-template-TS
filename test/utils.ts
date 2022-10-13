import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "ethers"

export const logTokenBalance = (user: string, balance: ethers.BigNumber)=>{
    console.log("Balance of",user,":", Number(balance)/Number(ethers.utils.parseUnits('1')), 'token')
}

export function logEthBalance(user: string, balance: ethers.BigNumber){
    console.log("Balance of",user,":", Number(balance)/Number(ethers.utils.parseUnits('1')), 'ETH')
}

export const sign = async(
    signer: SignerWithAddress,
    name: string, verifyingContract: string,
    owner: string, spender: string, value: ethers.BigNumber,
    nonce: ethers.BigNumber, deadline: number
    )=>{
    const domain = {
        name,
        version: '1',
        chainId: 31337,
        verifyingContract
    }

    const types = {
        Permit: [
            {name: 'owner', type: 'address'},
            {name: 'spender', type: 'address'},
            {name: 'value', type: 'uint256'},
            {name: 'nonce', type: 'uint256'},
            {name: 'deadline', type: 'uint256'},
        ]
    }

    const valueOfTypes = {
        owner,
        spender,
        value,
        nonce,
        deadline
    }

    return await signer._signTypedData(domain, types, valueOfTypes)
}

export const maxUint256 = ethers.BigNumber.from('2').pow(256).sub(1)