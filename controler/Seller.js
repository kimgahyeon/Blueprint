const User = require("../model/user")
const Bprint = require('../ABI/web3').Bprint;

exports.accept_toner = async function (req, res) {
    console.log("accept_toner")
    var order_number = req.body.number;
    console.log(order_number)
    var address
    User.findOne({ userID: req.session.userID }, (err, doc) => {
        if (doc) {
            address = doc.account;
        }
    })
    
    Bprint.index_toner(order_number, function (e, r1) {
        console.log(r1)
        console.log(r1.toNumber())

        Bprint.Toner_Order(r1.toNumber(), function (e, r2) {
            if (r2[5] == false) {
                Bprint.accept_toner(r1.toNumber(), address, { gas: Bprint.accept_toner.estimateGas(r1.toNumber(), address) }, function (e, r3) {
                    console.log(r3);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<script type="text/javascript">alert("Accept Toner Order");</script>')
                    res.write('<script type="text/javascript">window.location="/Log_in";</script>')
                    res.end()
                })
            }
            else {
                console.log("이미 다른 사람이 선택한 잉크 주문입니다.");
            }
        })

    })
}

exports.accept_paper = async function (req, res) {
    console.log("accept_paper")
    var order_number = req.body.number;
    console.log(order_number)
    var address
    User.findOne({ userID: req.session.userID }, (err, doc) => {
        if (doc) {
            address = doc.account;
        }
    })

    Bprint.index_paper(order_number, function (e, r1) {
        console.log(r1)
        console.log(r1.toNumber())

        Bprint.Paper_Order(r1.toNumber(), function (e, r2) {
            if (r2[5] == false) {
                Bprint.accept_paper(r1.toNumber(), address, { gas: Bprint.accept_paper.estimateGas(r1.toNumber(), address) }, function (e, r3) {
                    console.log(r3);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<script type="text/javascript">alert("Accept Paper Order");</script>')
                    res.write('<script type="text/javascript">window.location="/Log_in";</script>')
                    res.end()
                })
            }
            else {
                console.log("이미 다른 사람이 선택한 잉크 주문입니다.");
            }
        })

    })
}