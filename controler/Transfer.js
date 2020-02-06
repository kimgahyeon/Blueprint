const Web3 = require('web3');
const Bprint = require('../ABI/web3').Bprint;
const User = require('../model/user')
const crypto = require('crypto');

//Block chain 과 연결위해
if (typeof web3 !== 'undefined') {
    // metamask 통해서
    web3 = new Web3(web3.currentProvider);
} else {
    // 
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}


exports.but_token = async function (req,res) {
    password = req.body.pass;
    token = req.body.amount;
    ID = req.session.userID;
    console.log(ID)
    var address
    User.findOne({ userID: ID }, (err, doc) => {
        address = doc.account;
        console.log(address)
        console.log(password)

        web3.personal.unlockAccount(address,password);
        Bprint.buy_token(token, 100000000000, {gas : Bprint.buy_token.estimateGas(token, 100000000000) , from : address},function(e,r){
            console.log(r);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<script type="text/javascript">alert("Buy token");</script>')
            res.write('<script type="text/javascript">window.location="/Log_in";</script>')
            res.end()
        })
    })

}