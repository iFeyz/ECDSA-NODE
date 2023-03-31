const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const createAddress = require("./generate")
const fs = require('fs');
const secp = require("ethereum-cryptography/secp256k1");
const {toHex} = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "b45f825e04936da81ded63de5a04dda2a860eb6c3c59148311b607779c30a66c": 100,
  "7c9ba27441d77b262dbcfccb6c5cfa0bcdbe0834730b81b5b1ff6e4529432746": 50,
  "0x3": 75,
};

app.get("/generate",(req,res)=>{
  let _addressReturn = []
  const _address = createAddress()
  var data = fs.readFileSync('./address.json', 'utf8');
  if(!data){
    _addressReturn.push(_address);
    fs.writeFileSync('./address.json', JSON.stringify(_addressReturn), 'utf8');
  } else{
    _addressReturn.push(JSON.parse(data)[0]);
    _addressReturn.push(_address);
    fs.writeFileSync('./address.json', JSON.stringify(_addressReturn), 'utf8');
  }

  res.send({address : _address});
});


app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async(req, res) => {
  const { privateKey,sender, recipient, amount } = req.body; 
  function hashMessage(msg) {
    return keccak256(utf8ToBytes(msg))   
   }

   async function signMessage(msg , privateKey){
    const _hashMessage = await hashMessage(msg);
    const signatureObject = await secp.sign(_hashMessage, privateKey,{recovered:true});
    return signatureObject;
  }

  async function recoverKey(message, signature, recoveryBit) {
    const hashedMessage = await hashMessage(message);
    return secp.recoverPublicKey(hashedMessage,signature,recoveryBit)
  }
  const result = await signMessage(recipient, privateKey);
  let pubKey = await secp.getPublicKey(privateKey);
  const pubKeyHash = await keccak256(pubKey);
  const publicAddressCheck = await recoverKey(recipient, result[0],0);
  console.log(toHex(publicAddressCheck));
  console.log(toHex(pubKeyHash));
  if (toHex(publicAddressCheck) === "0x" + toHex(pubKeyHash))
  {
   
    setInitialBalance(sender);
    setInitialBalance(recipient);
  
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }

  }

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
