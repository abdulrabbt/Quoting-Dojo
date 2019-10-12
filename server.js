var express = require('express');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('express-flash');
var moment = require('moment');


app.use(express.urlencoded({extended: true}));
app.use(flash());
app.use(express.static(__dirname + '/static'));
app.use(session({
    secret: 'QWER!@#$%^&*()',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/quoting_dojo', {useNewUrlParser: true, useUnifiedTopology: true});

var QuoteSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    quote: {type: String, required: true, minlength: 3},
    }, {timestamps: true});
mongoose.model('Quote', QuoteSchema);
var Quote = mongoose.model('Quote');


app.get('/', function(req, res){
    res.render('index');
})

app.get('/quotes', function(req, res){
    Quote.find({}, function(err, quotes){
        if(err){
            console.log("Error DB request");
        }
        else {
            res.render('quoting', {info: quotes, moment: moment});
        }
    }).sort({_id:-1})
});

app.post("/quotes", function(req, res){
    var quote = new Quote({name: req.body.name, quote: req.body.quote});
    quote.save(function(err){
        if(err){
            console.log("Error ", err);
            for(var key in err.errors){
                req.flash("quoteform", err.errors[key].message);
            }
            res.redirect("/");
        }
        else{
            console.log("Successfully added to DB");
            res.redirect("/quotes");
        }
    });
});

app.listen(8000, function(){
    console.log("Listening on port: 8000");
});