 const express = require('express');
const route = express.Router();
const sign = require('../controler/User')
const register = require('../controler/Register')
const seller = require('../controler/Seller')
const repair = require('../controler/Repairman');
const lookup = require('../controler/Lookup')
const trans = require('../controler/Transfer')

route.route('/')
    .get(sign.session_check)

route.route('/Signup')
    .get((req, res) => {
        res.render('./html_css/create_user.html');
    })

route.route('/Log_in/Register')
    .get((req, res) => {
        res.render('./html_css/register_printer.html');
    })    

route.route('/register')
    .post(register.Register_AddPrint);

route.route('/Sign_up')
    .post(sign.createUser);

route.route('/Logout')
    .get(sign.logout);

route.route('/Log_in')
    .post(sign.login)
    .get(sign.session_move)

route.route('/Delete_Print')
    .post(register.Register_Delprint)

route.route('/Accept_Toner')
    .post(seller.accept_toner)

route.route('/Accept_Paper')
    .post(seller.accept_paper)

route.route('/Clear_Repair')
    .post(repair.clear_repair)

route.route('/Log_in/Manage')
    .get(lookup.manage_printer)

route.route('/Log_in/List/Paper')
    .get(lookup.my_paper_order)

route.route('/Log_in/List/Toner')
    .get(lookup.my_toner_order)
  
route.route('/Log_in/List/Repair')
    .get(lookup.list_repair)

route.route('/MyList_Toner')
    .get(lookup.my_toner_order)

route.route('/MyList_Paper')
    .get(lookup.my_paper_order)

route.route('/MyList_Repair')
    .get(lookup.my_list_repair)

route.route('/OrderList_Toner')
    .get(lookup.pending_toner_list)

route.route('/OrderList_Paper')
    .get(lookup.pending_paper_list)
route.route('/buy')
    .post(trans.but_token)
module.exports = route;