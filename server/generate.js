const secp = require("ethereum-cryptography/secp256k1");
const {toHex} = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

function createAddress(){

    const _privateKey = secp.utils.randomPrivateKey();
    const _publicKey = secp.getPublicKey(_privateKey);
    const address = {
        
        privateKey : toHex(_privateKey),
        publicKey : toHex(keccak256(_publicKey))
    }
    console.log(address);
    return address
}
module.exports = createAddress; 