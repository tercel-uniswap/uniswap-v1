let fs = require("fs");
let path = require("path");
const ethers = require("ethers")
const UniswapV1FactoryABI = require("../abi/uniswap_factory.json")
const WETH9 = require("../abi/WETH9.json")
let UniswapV1FactoryBytecode = ''


let config = {
    "url": "",
    "pk": "",
    "gasPrice": "10"
}

let factory;
let ins;

if(fs.existsSync(path.join(__dirname, ".config.json"))) {
    let _config = JSON.parse(fs.readFileSync(path.join(__dirname, ".config.json")).toString());
    for(let k in config) {
        config[k] = _config[k];
    }
}

if(fs.existsSync(path.join(__dirname, "../bytecode/factory.txt"))) {
  UniswapV1FactoryBytecode = fs.readFileSync(path.join(__dirname, "../bytecode/factory.txt")).toString().trim();
  if(UniswapV1FactoryBytecode.substring(0,2) === '0x') {
    UniswapV1FactoryBytecode = UniswapV1FactoryBytecode.substring(2);
  }
  // console.log('code:', UniswapV1FactoryBytecode);
}

let ETHER_SEND_CONFIG = {
    gasPrice: ethers.utils.parseUnits(config.gasPrice, "gwei")
}

console.log("current endpoint ", config.url);
let provider = new ethers.providers.JsonRpcProvider(config.url);
let walletWithProvider = new ethers.Wallet(config.pk, provider);
let owner = walletWithProvider.address;
console.log('owner:', owner);

function sendParam(value='0') {
  return {
    value: value,
    gasPrice: ethers.utils.parseUnits(config.gasPrice, "gwei")
  }
}

function getWallet(key = config.pk) {
  return new ethers.Wallet(key, provider)
}

const sleep = ms =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve()
    }, ms)
  )

async function waitForMint(tx) {
//   console.log('tx:', tx)
  let result = null
  do {
    result = await provider.getTransactionReceipt(tx)
    await sleep(100)
  } while (result === null)
  await sleep(200)
}

async function getBlockNumber() {
  return await provider.getBlockNumber()
}


async function deployContracts() {
  // factory = new ethers.ContractFactory(
  //   WETH9.abi,
  //   WETH9.bytecode,
  //   walletWithProvider
  // )
  // ins = await factory.deploy(ETHER_SEND_CONFIG)
  // await waitForMint(ins.deployTransaction.hash)
  // console.log('WETH9:', ins.address)

  factory = new ethers.ContractFactory(
    UniswapV1FactoryABI,
    UniswapV1FactoryBytecode,
    walletWithProvider
  )
  ins = await factory.deploy(ETHER_SEND_CONFIG)
  await waitForMint(ins.deployTransaction.hash)
  console.log('UniswapV1Factory:', ins.address)
}

async function deploy() {
  
  // business contract
  console.log('deloy contract...')
  await deployContracts()

}

async function run() {
    console.log('deploy...')
    await deploy()
}

run()


