import { BigNumberish, ethers, Signer } from "ethers";
import 'dotenv/config'

const buildSignature = async(
    signer: Signer,
    userAddr: string,
    tokenId: BigNumberish,
    expiresAt: BigNumberish,
    UIDContractAddr: string,
    nonce: BigNumberish,
    chainId: BigNumberish
) => {
    console.log(ethers.utils.solidityPack(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256'],
        [userAddr, tokenId, expiresAt, UIDContractAddr, nonce, chainId]
    ));

    const msgHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
            ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256'],
            [userAddr, tokenId, expiresAt, UIDContractAddr, nonce, chainId]
        )
    )

    console.log(msgHash)
    console.log('=')
    console.log(ethers.utils.arrayify(msgHash))
    console.log('=')
    console.log(await signer.signMessage(ethers.utils.arrayify(msgHash)))
    // console.log(await signer.signMessage(ethers.getBytes(msgHash)))
}

const admin = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY as any)

buildSignature(
    admin, 
    '0x34E0Ab7Ac91e9c2281Ead1b215F3c95EfAf0f215',
    1,
    2000000000,
    '0x5042f8CCCDDaBD2deEBa9E9B6b8255a67a7C56a6',
    0,
    80001
)