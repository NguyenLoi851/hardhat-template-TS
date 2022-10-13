// console.log("Hello")
// console.log((Date.now()/1000).toFixed())
// console.log((Date.now()/1000).toFixed() + 3)
// console.log(typeof((Date.now()/1000).toFixed() + 3))

import { BigNumber } from "ethers";

// console.log(1_000_000)
console.log(BigNumber.from('2').pow(256).sub(1))