const Printer = require('../model/printer');
const Bprint = require('../ABI/web3').Bprint;


exports.Register_AddPrint = async function (req, res) {
    var model = req.body.model_number;
    var lo = req.body.location;
    Bprint.add_device(model, lo,{ gas: Bprint.add_device.estimateGas(model,lo) }, function (e, r) {
        console.log("Register printer : " + model);
        
        new Printer({model : model, location : lo}).save((doc,err)=>{
            console.log(doc);
        })

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<script type="text/javascript">alert("Register printer");</script>')
        res.write('<script type="text/javascript">window.location="/Log_in";</script>')
        res.end()
    })
}

exports.Register_Delprint = async function (req, res) {
    var model = req.body.model_number;
    Bprint.del_device(model, { gas: Bprint.del_device.estimateGas(model) }, function (e, r) {
       
        console.log("Delete printer : " + model);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<script type="text/javascript">alert("Delete printer");</script>')
        res.write('<script type="text/javascript">window.location="/Log_in";</script>')
        res.end()
    })
}