const User = require("../model/user")
const Bprint = require('../ABI/web3').Bprint;

/*
잉크 : 고유 번호(001) + Date.now() + number;
종이 : 고유 번호(002) + Date.now() + number;
수리 : 고유 번호(003) + Date.now() + number;
*/

var number = 1;
exports.order_repair = async function (addr) {
    
    var address
    User.findOne({userID : addr},(err,doc)=>{
        address = doc.account;
    })

    var model = req.body.model_number;
    var order_number = "003" + toString(Date.now()) + toString(number)
    number++;
    Number(order_number);

    console.log("order_number : " + order_number);

    Bprint.order_repair(address,order_number, { gas: Bprint.order_repair.estimateGas(address,order_number) }, function (e, r) {

    })

}

exports.clear_repair = async function (req, res) {

    console.log("clear_repair")
    var order_number = req.body.number;
    console.log(order_number)
    var address
    User.findOne({ userID: req.session.userID }, (err, doc) => {
        if (doc) {
            address = doc.account;
        }
    })

    Bprint.index_repair(order_number, function (e, r1) {
        console.log(r1)
        console.log(r1.toNumber())

        Bprint.Repair_Order(r1.toNumber(), function (e, r2) {
            if (r2[4] == false) {
                Bprint.clear_repair(r1.toNumber(), address, { gas: Bprint.clear_repair.estimateGas(r1.toNumber(), address) }, function (e, r3) {
                    console.log(r3);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<script type="text/javascript">alert("Accept Repair Order");</script>')
                    res.write('<script type="text/javascript">window.location="/Log_in";</script>')
                    res.end()

                })
            }
            else {
                console.log("이미 다른 사람이 선택한 수리 주문입니다.");
            }
        })

    })
}