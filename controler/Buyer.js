const User = require('../model/user')
const Bprint = require('../ABI/web3').Bprint;


// 주문번호 생성
// 잉크 고유번호(001) + Date.now() + numforInk; 0012018112150
// 종이 고유번호(002) + Date.now() + numforPaper;
// 수리 고유번호(003) + Date.now() + numforRepair;

// 주문번호 중복 방지 위한 변수
var numforToner, numforPaper = 0;
exports.order_toner = async function (addr){
    // String으로 연결하여 주문번호 생성
    var address
    User.findOne({userID : addr},(err,doc)=>{
        address = doc.account;
    })

    //계정
    var TonerOrderNum = '001' + toString(Date.now()) + toString(numforToner);
    numforToner++; // 중복을 방지하기 위해 
    TonerOrderNum = parseInt(TonerOrderNum); // 주문번호가 uint80타입이므로 int로 parse해줌
    
    Bprint.order_toner(address,TonerOrderNum, {gas:Bprint.order_toner.estimateGas(address,TonerOrderNum)},(e,r)=>{
        console.log("Toner order number : " + TonerOrderNum);

    })
}


exports.order_paper = async function (addr){

    var address
    User.findOne({userID : addr},(err,doc)=>{
        address = doc.account;
    })


    // 종이 주문번호 생성
    var PaperOrderNum = '002' + toString(Date.now()) + toString(numforPaper);
    numforPaper++;
    PaperOrderNum = parseInt(PaperOrderNum);

    Bprint.order_paper(address,PaperOrderNum, {gas:Bprint.order_paper.estimateGas(address,PaperOrderNum)},(e,r)=>{
        console.log("Paper order number : "+PaperOrderNum);
    })
}
