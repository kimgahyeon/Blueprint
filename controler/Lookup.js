const fs = require('fs');
const User = require('../model/user')
var ejs = require('ejs')
const Bprint = require('../ABI/web3').Bprint;


//대기중인 주문
exports.pending_toner_list = async function (req, res) {
    var list_s = new Array();
    var list_o = new Array();
    var list_r = new Array();
    var list_n = new Array();
    var list_p = new Array();
    var j = 0;
    var list = await Bprint.num_toner()


    if (list.toNumber() == 0) {
        var manage = fs.readFileSync('./views/html_css/accept_toner.ejs', 'utf8');
        var user_info = ejs.render(manage, { o_num: list_o, sender: list_s, recept: list_r, num: list_n, price: list_p });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    }

    for (var i = 0; i < list.toNumber(); i++) {
        await Bprint.Toner_Order(i, function (e, r) {
            j++;
            if (r[5] == false) {
                list_s.push(r[0])
                list_r.push(r[1])
                list_n.push(r[2])
                list_p.push(r[3])
                list_o.push(r[4])
            }

            if (j == list.toNumber()) {
                var manage = fs.readFileSync('./views/html_css/accept_toner.ejs', 'utf8');
                var user_info = ejs.render(manage, { o_num: list_o, sender: list_s, recept: list_r, num: list_n, price: list_p });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(user_info);
                res.end();
            }
        })
    }
}

exports.pending_paper_list = async function (req, res) {
    var list_s = new Array();
    var list_o = new Array();
    var list_r = new Array();
    var list_n = new Array();
    var list_p = new Array();
    var j = 0;
    var list = await Bprint.num_paper()

    if (list.toNumber() == 0) {
        var manage = fs.readFileSync('./views/html_css/accept_paper.ejs', 'utf8');
        var user_info = ejs.render(manage, { o_num: list_o, sender: list_s, recept: list_r, num: list_n, price: list_p });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    }

    for (var i = 0; i < list.toNumber(); i++) {
        await Bprint.Paper_Order(i, function (e, r) {
            j++;
            if (r[5] == false) {
                list_s.push(r[0])
                list_r.push(r[1])
                list_n.push(r[2])
                list_p.push(r[3])
                list_o.push(r[4])
            }
            if (j == list.toNumber()) {
                var manage = fs.readFileSync('./views/html_css/accept_paper.ejs', 'utf8');
                var user_info = ejs.render(manage, { o_num: list_o, sender: list_s, recept: list_r, num: list_n, price: list_p });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(user_info);
                res.end();
            }
        })
    }
}

exports.my_toner_order = async function (req, res) {
    var list_o = new Array();
    var list_a = new Array();
    var list_n = new Array();
    var list_p = new Array();
    var j = 0;
    var list = await Bprint.num_toner()


    if (list.toNumber() == 0) {
        var manage = fs.readFileSync('./views/html_css/toner_list.ejs', 'utf8');
        var user_info = ejs.render(manage, { o_num: list_o,address:list_a, num: list_n, price: list_p });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    }

    var address;
    var m,n;
    User.findOne({ userID: req.session.userID }, (err, doc) => {
        if (doc) {
            address = doc.account;
            if(Object.is(doc.information,"buyer")){
                m = 0;
                n = 1;
            }else if(Object.is(doc.information,"seller")){
                m = 1;
                n = 0;
            }
        }
    })

    for (var i = 0; i < list.toNumber(); i++) {
        await Bprint.Toner_Order(i, function (e, r) {
            j++;
            if (Object.is(address, r[m])) {
                list_a.push(r[n])
                list_n.push(r[2])
                list_p.push(r[3])
                list_o.push(r[4])
            }
            if (j == list.toNumber()) {
                var manage = fs.readFileSync('./views/html_css/toner_list.ejs', 'utf8');
                var user_info = ejs.render(manage, { o_num: list_o,address:list_a, num: list_n, price: list_p });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(user_info);
                res.end();
            }
        })
    }
}

exports.my_paper_order = async function (req, res) {
    var list_o = new Array();
    var list_a = new Array();
    var list_n = new Array();
    var list_p = new Array();
    var j = 0;
    var list = await Bprint.num_paper()

    if (list.toNumber() == 0) {
        var manage = fs.readFileSync('./views/html_css/paper_list.ejs', 'utf8');
        var user_info = ejs.render(manage, { o_num: list_o, address: list_a, num: list_n, price: list_p });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    }

    var address
    User.findOne({ userID: req.session.userID }, (err, doc) => {
        if (doc) {
            address = doc.account;
            if(Object.is(doc.information,"buyer")){
                m = 0;
                n = 1;
            }else if(Object.is(doc.information,"seller")){
                m = 1;
                n = 0;
            }
        }
    })

    for (var i = 0; i < list.toNumber(); i++) {
        await Bprint.Paper_Order(i, function (e, r) {
            j++;

            if (Object.is(address, r[m])) {
                list_a.push(r[n])
                list_n.push(r[1])
                list_p.push(r[2])
                list_o.push(r[3])
            }

            if (j == list.toNumber()) {
                var manage = fs.readFileSync('./views/html_css/paper_list.ejs', 'utf8');
                var user_info = ejs.render(manage, { o_num: list_o, address: list_a, num: list_n, price: list_p });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(user_info);
                res.end();
            }
        })
    }
}


exports.list_paper = async function (req, res) {
    var list_s = new Array();
    var list_o = new Array();
    var list_r = new Array();
    var list_n = new Array();
    var list_p = new Array();
    var j = 0;
    var list = await Bprint.num_paper()

    if (list.toNumber() == 0) {
        var manage = fs.readFileSync('./views/html_css/paper_list.ejs', 'utf8');
        var user_info = ejs.render(manage, { o_num: list_o, recept: list_r, num: list_n, price: list_p });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    }


    for (var i = 0; i < list.toNumber(); i++) {
        await Bprint.Paper_Order(i, function (e, r) {
            j++;

            list_r.push(r[0])
            list_n.push(r[1])
            list_p.push(r[2])
            list_o.push(r[3])


            if (j == list.toNumber()) {
                var manage = fs.readFileSync('./views/html_css/paper_list.ejs', 'utf8');
                var user_info = ejs.render(manage, { o_num: list_o, recept: list_r, num: list_n, price: list_p });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(user_info);
                res.end();
            }
        })
    }
}



exports.list_toner = async function (req, res) {


    var list_o = new Array();
    var list_r = new Array();
    var list_n = new Array();
    var list_p = new Array();
    var j = 0;
    var list = await Bprint.num_toner()


    if (list.toNumber() == 0) {
        var manage = fs.readFileSync('./views/html_css/toner_list.ejs', 'utf8');
        var user_info = ejs.render(manage, { o_num: list_o, recept: list_r, num: list_n, price: list_p });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    }

    for (var i = 0; i < list.toNumber(); i++) {
        await Bprint.Toner_Order(i, function (e, r) {
            j++;
            list_r.push(r[0])
            list_n.push(r[1])
            list_p.push(r[2])
            list_o.push(r[3])

            if (j == list.toNumber()) {
                var manage = fs.readFileSync('./views/html_css/toner_list.ejs', 'utf8');
                var user_info = ejs.render(manage, { o_num: list_o, recept: list_r, num: list_n, price: list_p });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(user_info);
                res.end();
            }
        })
    }
}

exports.list_repair = async function (req, res) {
    var list_o = new Array();
    var list_r = new Array();
    var list_p = new Array();
    var j = 0;
    var list = await Bprint.num_repair()

    if (list.toNumber() == 0) {
        var manage = fs.readFileSync('./views/html_css/accept_repair.ejs', 'utf8');
        var user_info = ejs.render(manage, { o_num: list_o, recept: list_r, price: list_p });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    }



    for (var i = 0; i < list.toNumber(); i++) {
        await Bprint.Repair_Order(i, function (e, r) {
            j++;

            list_r.push(r[0])
            list_p.push(r[2])
            list_o.push(r[3])
            list_r.p

            if (j == list.toNumber()) {
                var manage = fs.readFileSync('./views/html_css/accept_repair.ejs', 'utf8');
                var user_info = ejs.render(manage, { o_num: list_o, recept: list_r, price: list_p });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(user_info);
                res.end();
            }
        })
    }
}

exports.my_list_repair = async function (req, res) {
    var list_o = new Array();
    var list_a = new Array();
    var list_p = new Array();
    var j = 0;
    var list = await Bprint.num_repair()

    if (list.toNumber() == 0) {
        var manage = fs.readFileSync('./views/html_css/repair_list.ejs', 'utf8');
        var user_info = ejs.render(manage, { o_num: list_o, address: list_a, price: list_p });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    }

    var address
    User.findOne({ userID: req.session.userID }, (err, doc) => {
        if (doc) {
            address = doc.account;
            if(Object.is(doc.information,"buyer")){
                m = 0;
                n = 1;
            }else if(Object.is(doc.information,"repairman")){
                m = 1;
                n = 0;
            }
        }
    })


    for (var i = 0; i < list.toNumber(); i++) {
        await Bprint.Repair_Order(i, function (e, r) {
            j++;
            if (Object.is(address, r[m])) {
                list_a.push(r[n])
                list_p.push(r[3])
                list_o.push(r[4])
            }

            if (j == list.toNumber()) {
                var manage = fs.readFileSync('./views/html_css/repair_list.ejs', 'utf8');
                var user_info = ejs.render(manage, { o_num: list_o, address: list_a, price: list_p });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(user_info);
                res.end();
            }
        })
    }
}

exports.manage_printer = async function (req, res) {

    var dev = new Array();
    var loc = new Array();

    var j = 0;
    var list = await Bprint.num_device()


    if (list.toNumber() == 0) {
        var manage = fs.readFileSync('./views/html_css/manage_printer.ejs', 'utf8');
        var user_info = ejs.render(manage, { deviceId: dev, location: loc });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(user_info);
        res.end();
    }

    for (var i = 0; i < list.toNumber(); i++) {
        await Bprint.Device(i, function (e, r) {
            j++;
            console.log(r)
            if (r[0] !== 0) {
                loc.push(r[0])
                dev.push(r[1].toNumber())
            }
            if (j == list.toNumber()) {
                var manage = fs.readFileSync('./views/html_css/manage_printer.ejs', 'utf8');
                var user_info = ejs.render(manage, { deviceId: dev, location: loc });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(user_info);
                res.end();
            }
        })
    }
}