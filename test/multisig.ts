import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"
import { ethers } from "hardhat"

import { MyToken } from "../typechain-types/contracts/multisig/MyToken"
import { MyToken__factory } from "../typechain-types/factories/contracts/multisig/MyToken__factory"

import { GnosisSafeL2 } from "../typechain-types/contracts/multisig/GnosisSafeL2"
import { GnosisSafeL2__factory } from "../typechain-types/factories/contracts/multisig/GnosisSafeL2__factory"

import { GnosisSafeProxy} from "../typechain-types/contracts/multisig/proxy/GnosisSafeProxy.sol/GnosisSafeProxy"
import { GnosisSafeProxy__factory } from "../typechain-types/factories/contracts/multisig/proxy/GnosisSafeProxy.sol/GnosisSafeProxy__factory"

import { GnosisSafeProxyFactory } from "../typechain-types/contracts/multisig/proxy/GnosisSafeProxyFactory"
import { GnosisSafeProxyFactory__factory } from "../typechain-types/factories/contracts/multisig/proxy/GnosisSafeProxyFactory__factory"
import { expect } from "chai"
import { AbiCoder, Interface, keccak256, toUtf8Bytes } from "ethers/lib/utils"

describe("Contract", ()=>{

    enum Operation {
        Call,
        DelegateCall
    }

    type DataMessage = {
        to: string
        value: BigNumber
        data: string
        operation: Operation
        safeTxGas: BigNumber
        baseGas: BigNumber
        gasPrice: BigNumber
        gasToken: string
        refundReceiver: string
        nonce: BigNumber
    }

    async function deployFixture(){
        let deployer: SignerWithAddress
        let owner1: SignerWithAddress
        let owner2: SignerWithAddress
        let myToken: MyToken
        let gnosisSafeProxyFactory: GnosisSafeProxyFactory
        let gnosisSafeL2: GnosisSafeL2
        let zeroAddress: string = '0x'+'0'.repeat(40);

        [deployer, owner1, owner2] = await ethers.getSigners();
        myToken = await new MyToken__factory(deployer).deploy();
        gnosisSafeProxyFactory = await new GnosisSafeProxyFactory__factory(deployer).deploy()
        gnosisSafeL2 = await new GnosisSafeL2__factory(deployer).deploy()

        return {deployer, owner1, owner2, myToken, gnosisSafeProxyFactory, gnosisSafeL2, zeroAddress}
    }

    it("Should run", async()=>{
        const {deployer, owner1, owner2, myToken, gnosisSafeProxyFactory, gnosisSafeL2, zeroAddress} = await loadFixture(deployFixture)
        await myToken.connect(deployer).safeMint(deployer.address)
        expect(await myToken.ownerOf(0)).to.be.equal(deployer.address)
        expect(await myToken.owner()).to.be.equal(deployer.address)
    
        // create our new gnosis safe proxy contract, which includes many owners
        const abi = [
            "function setup(address[],uint256,address,bytes,address,address,uint256,address)",
            "function safeMint(address)"    
        ]
        const iface = new Interface(abi)
        const data = iface.encodeFunctionData("setup",[
            [deployer.address,owner1.address,owner2.address], // owners
            2, // threshold
            zeroAddress, // to
            "0x", // data
            zeroAddress, // fallbackHandler
            zeroAddress, // paymentToken
            0, // payment amount
            zeroAddress, // paymentReceiver
        ])
        // console.log(data)
        const tx = await gnosisSafeProxyFactory.connect(deployer).createProxy(gnosisSafeL2.address, data)
        // const events = gnosisSafeProxyFactory.filters.ProxyCreation()
        // console.log(events)
        const txReceipt = await tx.wait()
        const events = txReceipt.events
        const proxyCreationEvent = events![1]
        const ourGnosisSafeProxyAddress = proxyCreationEvent.args!.proxy
        // const ourGnosisSafeProxy: GnosisSafeProxy = new GnosisSafeProxy__factory(deployer).attach(ourGnosisSafeProxyAddress)
        const ourGnosisSafeProxy: GnosisSafeL2 = new GnosisSafeL2__factory(deployer).attach(ourGnosisSafeProxyAddress)
        
        // get info of our new gnosis safe proxy
        const owners = await ourGnosisSafeProxy.getOwners()
        // console.log(owners)

        // transfer ownership of MyToken contract from deployer to our new gnosisSafeProxy
        await myToken.connect(deployer).transferOwnership(ourGnosisSafeProxy.address);
        expect(await myToken.owner()).to.be.equal(ourGnosisSafeProxy.address)

        // revert mint by previous owner
        await expect(myToken.connect(deployer).safeMint(owner1.address)).to.be.reverted

        // mint to deployer with multisig
        const dataMessageOwner2: DataMessage = {
            to: myToken.address,
            value: BigNumber.from(0),
            data: iface.encodeFunctionData("safeMint",[deployer.address]),
            operation: Operation.Call,
            safeTxGas: BigNumber.from(0),
            baseGas: BigNumber.from(0),
            gasPrice: BigNumber.from(0),
            gasToken: zeroAddress,
            refundReceiver: zeroAddress,
            nonce: await ourGnosisSafeProxy.nonce()
        }

    })
})
        // console.log(proxyCreationEvent.args)
        // console.log("=====================================================")
        // console.log(await (await gnosisSafeProxyFactory.connect(deployer).createProxy(gnosisSafeL2.address, data)).wait());
        
        /*
        0xb63e800d
        0000000000000000000000000000000000000000000000000000000000000100 // 32 // 16*16
        0000000000000000000000000000000000000000000000000000000000000002 // 64 // threshold
        0000000000000000000000000000000000000000000000000000000000000000 // 
        0000000000000000000000000000000000000000000000000000000000000180
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000003 // 
        0000000000000000000000009460b481366b7462af4f7991d430e5eb97faaeb5
        00000000000000000000000034e0ab7ac91e9c2281ead1b215f3c95efaf0f215
        000000000000000000000000f41ba28610a002440cc724cad80d31f4554070f8
        0000000000000000000000000000000000000000000000000000000000000000
        */

        // data = zeroAddress
        /**
        0xb63e800d
        0000000000000000000000000000000000000000000000000000000000000100
        0000000000000000000000000000000000000000000000000000000000000002
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000180
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000003
        0000000000000000000000009460b481366b7462af4f7991d430e5eb97faaeb5
        00000000000000000000000034e0ab7ac91e9c2281ead1b215f3c95efaf0f215
        000000000000000000000000f41ba28610a002440cc724cad80d31f4554070f8
        0000000000000000000000000000000000000000000000000000000000000014
        0000000000000000000000000000000000000000000000000000000000000000
        */

        // data = "0x"
        /*
        0xb63e800d
        0000000000000000000000000000000000000000000000000000000000000100
        0000000000000000000000000000000000000000000000000000000000000002
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000180
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000000
        0000000000000000000000000000000000000000000000000000000000000003
        0000000000000000000000009460b481366b7462af4f7991d430e5eb97faaeb5
        00000000000000000000000034e0ab7ac91e9c2281ead1b215f3c95efaf0f215
        000000000000000000000000f41ba28610a002440cc724cad80d31f4554070f8
        0000000000000000000000000000000000000000000000000000000000000000
        */

