var express = require("express");
var mysql = require("mysql2");
var bodyparser = require("body-parser");
var app = express();
var flash = require('express-flash');
var session = require('express-session')
var passport = require('passport');
var middleware = require("./middlewares")

require('./config/passport')(passport);

// app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true
}));
app.use(bodyparser.json({ limit: '50mb' }));
app.use(express.static(`${__dirname}/public`));

app.set("view engine", "ejs");

// required for passport
app.use(session({
    secret: 'petsproject',
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.alerts = req.flash("alerts");
    next();
})

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "shamil1505",
    database: "pawlace1",
});

var auth = require('./routes/admin/auth');
app.use('/admin/auth', auth);

var auth = require('./routes/user/auth');
app.use('/auth', auth);

var admin_breed = require('./routes/admin/breed');
app.use('/admin/breed', middleware.isLoggedIn, admin_breed);

var admin_category = require('./routes/admin/category')
app.use('/admin/category', middleware.isLoggedIn, admin_category);

var admin_pet = require('./routes/admin/pet');
app.use('/admin/pet', middleware.isLoggedIn, admin_pet);

var user_pet = require('./routes/user/pet')
app.use('/pet', middleware.isLoggedIn, user_pet);

app.get("/", function(req, res) {
    res.send("Home page")
});

app.listen(3000, () => {
    console.log("server is running on port 3000");
});