const User = require("../model/user")
const crypto = require('crypto');
const fs = require('fs');
const ejs = require('ejs')
const Bprint = require('../ABI/web3').Bprint;
const Web3 = require('web3');

//Block chain 과 연결위해
if (typeof web3 !== 'undefined') {
    // metamask 통해서
    web3 = new Web3(web3.currentProvider);
} else {
    // 
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}


exports.createUser = async function (req, res) {
    /*
    userID : String,
    password_hash : String,gk
    email : String,
    information : String,
    account : String
    */
    var userId = req.body.id;
    var password = req.body.password;
    var em = req.body.email;
    var info = req.body.info;

    // hash해줌
    var encrypt = crypto.createHash('sha256').update(password);

    // encrypt를 16진수로 바꿈
    var crypto_pass = encrypt.digest('hex');

    //"0x57ecb0286e1ac4beb1a07caaf25dbc10cbbf926d"
    // model/User을 받아서 원하는 id를 검색
    User.findOne({ userID: userId }, (err, doc) => {
        // 검색하고자 하는 정보가 존재하면
        if (doc) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<script type="text/javascript">alert("id already exist");</script>')
            res.write('<script type="text/javascript">window.location="/Signup";</script>')
            res.end()
            //pop up already id exist message
        } else { //same id not exist
            // web3의 newAccount를 호출, await: 트랜잭션이 시간이 걸리니까 끝날때까지 기다려줌.
            var address = web3.personal.newAccount(password);
            //"0x57ecb0286e1ac4beb1a07caaf25dbc10cbbf926d"
            new User({
                userID: userId,
                password_hash: crypto_pass,
                email: em,
                information: info,
                account: address
            }).save((err, doc) => {
                if (doc) { // id create success
                    console.log(doc);
                    console.log(info)
                    if (Object.is(info, "seller")) {
                        Bprint.add_seller(address, { gas: Bprint.add_seller.estimateGas(address) }, function (e, r) {
                            console.log("err : " + e)
                            console.log("result : " + r)
                        })
                    } else if (Object.is(info, "repairman")) {
                        Bprint.add_repairman(address, { gas: Bprint.add_seller.estimateGas(address) }, function (e, r) {
                            console.log("err : " + e)
                            console.log("result : " + r)
                        })
                    }
                    res.render('./html_css/main_page.html');
                } else { // db생성 실패하면
                    console.log(err);
                }
            })
        }
    })
}


exports.login = async function (req, res) {

    var userId = req.body.id;
    var password = req.body.password;

    var state;
    var encrypt = crypto.createHash('sha256').update(password);
    var crypto_pass = encrypt.digest('hex');

    User.findOne({ userID: userId }, (err, doc) => {

        if (doc) {
            // 비밀번호 일치하는지 확인
            if (doc.password_hash === crypto_pass) {
                req.session.userID = userId;

                // 판매자로 로그인하면
                if (Object.is(doc.information, "seller")) {
                    // 판매자 로그인 페이지로 render         

                    var seller = fs.readFileSync('./views/html_css/seller_login.ejs', 'utf8');
                    Bprint.balanceOf(doc.account, function (e, r) {
                        var balance = r.toNumber();
                        console.log(balance)
                        var user_info = ejs.render(seller, { user_id: doc.userID, user_balance: balance });
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(user_info);
                        res.end();
                    })

                } else if (Object.is(doc.information, "buyer")) {
                    
                    var buyer = fs.readFileSync('./views/html_css/buyer_login.ejs', 'utf8');
                    Bprint.balanceOf(doc.account, function (e, r) {
                        var balance = r.toNumber();
                        console.log(balance)
                        var user_info = ejs.render(buyer, { user_id: doc.userID, user_balance: balance });
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(user_info);
                        res.end();
                    })
                } else if (Object.is(doc.information, "repairman")) {

                    var repairman = fs.readFileSync('./views/html_css/repairman_login.ejs', 'utf8');
                    Bprint.balanceOf(doc.account, function (e, r) {
                        var balance = r.toNumber();
                        console.log(balance)
                        var user_info = ejs.render(repairman, { user_id: doc.userID, user_balance: balance });
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(user_info);
                        res.end();
                    })
                }
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<script type="text/javascript">alert("id password not correct");</script>')
                res.write('<script type="text/javascript">window.location="/";</script>')
                res.end()
            }
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<script type="text/javascript">alert("id password not correct");</script>')
            res.write('<script type="text/javascript">window.location="/";</script>')
            res.end()
        }
    })
}

// 로그인 상태의 메인페이지에서 다시 관리페이지로 가기 위해
exports.session_move = async function (req, res) {
    var userId = req.session.userID;
    User.findOne({ userID: userId }, (err, doc) => {
        console.log(doc)
        if (doc) {
            // 비밀번호 일치하는지 확인
            req.session.userID = userId;
            // 판매자로 로그인하면
            if (Object.is(doc.information, "seller")) {
                // 판매자 로그인 페이지로 render         

                var seller = fs.readFileSync('./views/html_css/seller_login.ejs', 'utf8');
                Bprint.balanceOf(doc.account, function (e, r) {
                    var balance = r.toNumber();
                    console.log(balance)
                    var user_info = ejs.render(seller, { user_id: doc.userID, user_balance: balance });
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(user_info);
                    res.end();
                })

            } else if (Object.is(doc.information, "buyer")) {

                var buyer = fs.readFileSync('./views/html_css/buyer_login.ejs', 'utf8');
                Bprint.balanceOf(doc.account, function (e, r) {
                    var balance = r.toNumber();
                    console.log(balance)
                    var user_info = ejs.render(buyer, { user_id: doc.userID, user_balance: balance });
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(user_info);
                    res.end();
                })
            } else if (Object.is(doc.information, "repairman")) {

                var repairman = fs.readFileSync('./views/html_css/repairman_login.ejs', 'utf8');
                Bprint.balanceOf(doc.account, function (e, r) {
                    var balance = r.toNumber();
                    console.log(balance)
                    var user_info = ejs.render(repairman, { user_id: doc.userID, user_balance: balance });
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(user_info);
                    res.end();
                })
            }
        } else
            res.render('./html_css/main_page.html');
    })
}
exports.session_check = async function (req, res) {
    if (req.session.userID !== undefined) {
        console.log("session")
        var session_page = fs.readFileSync('./views/html_css/session_login.ejs', 'utf8');
        var user_info = ejs.render(session_page, { name: req.session.userID })
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    } else {
        console.log("no session")
        res.render('./html_css/main_page.html')
    }
}


exports.logout = async function (req, res) {
    req.session.userID = undefined
    res.redirect('/')
}