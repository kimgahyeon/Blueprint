const Web3 = require('web3');
const Abi = require('../ABI/abi');

//Block chain 과 연결위해
if (typeof web3 !== 'undefined') {
    // metamask 통해서
    web3 = new Web3(web3.currentProvider);
} else {
    // 
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

web3.personal.unlockAccount('0x57ecb0286e1ac4beb1a07caaf25dbc10cbbf926d', 'password')
web3.eth.defaultAccount = '0x57ecb0286e1ac4beb1a07caaf25dbc10cbbf926d';

const Bprint_Contract = web3.eth.contract(Abi.abi);
exports.Bprint = Bprint_Contract.at(Abi.address);
exports.web3;
