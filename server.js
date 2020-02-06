const express = require('express');
const app = express();
const port = process.env.PORT || 3000
const router = require('./route/router');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const buyer = require('./controler/Buyer');
const repairman = require('./controler/Repairman');
const Printer = require('./model/printer')
///
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/print')

Print_status = setInterval(function () {
  Printer.find((err,doc)=>{
      for(i =0 ;i<doc.length;i++){
          if(Object.is(printer.getPrinters(doc[i].model).status,"NO-TONER")){
            buyer.order_toner(doc[i].buyer);
          }
          if(Object.is(printer.getPrinters(doc[i].model).status,"PAPER-OUT")){
            buyer.order_paper(doc[i].buyer);
          }
          if(Object.is(printer.getPrinters(doc[i].model).status,"BREAK-DOWN")){
            repairman.order_repair(doc[i].buyer);
          }
      }
  });
}, 60 * 60 * 1000)


/*if use https server
var options = {  
    key: fs.readFileSync('./private.pem'),
    cert: fs.readFileSync('./public.pem')
};
*/


//server parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//use cookie 
app.use(cookieParser());
//session information
app.use(session({
    key: 'blue',
    secret: 'print',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000
    }
}))

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
//use router
app.use(router)

//client error message
app.use(function (req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
})

//server error message
app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');

})

//server start
app.listen(port, err => {
    if (err) console.log(err)
    else {
        console.log("Server Start")
        console.log("http://localhost:" + port)
    }
})