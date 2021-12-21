var express = require("express");
var router = express.Router();
var mysql = require("mysql2");
var bcrypt = require("bcrypt");
var passport = require('passport');
var middleware = require("../../../middlewares")

const { check, validationResult } = require("express-validator");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "shamil1505",
    database: "pawlace1",
});


router.get("/login", function(req, res) {
    res.render("admin/auth/login");
});

router.post("/login", [
    check("email")
    .exists().notEmpty()
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Email format is not valid"),
    check("password")
    .exists().notEmpty()
    .withMessage("Password field is required")

], passport.authenticate('local-admin-login', {
    successRedirect: '/admin/auth/home', // redirect to the secure profile section
    failureRedirect: '/admin/auth/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}), function(req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const alerts = error.array();
        req.flash("alerts", alerts)
        return res.redirect("back");
    }
    var q = "select * from users where email = '" + req.body.email + "'";
    connection.query(q, function(error, user) {
        if (error) {
            console.log(error);
            req.flash("error", error);
            return res.redirect("back");
        }
        if (!user || user.length < 1) {
            req.flash("error", "No Admin with this email exists");
            return res.redirect("back");
        }

        if (user[0].is_admin == 1) {
            console.log(user[0].is_admin)
            bcrypt.compare(
                req.body.password,
                user[0].password,
                function(error1, result) {
                    if (error1) {
                        console.log(error1);
                        req.flash("error", error1);
                        return res.redirect("back");
                    }
                    if (!result) {
                        console.log("Password :" + result);
                        req.flash("error", "Wrong Password");
                        return res.redirect("back");
                    }
                    res.redirect("/admin/auth/home");
                }

            );
        } else {
            req.flash("error", "You are not an ADMIN");
            return res.redirect("back");
        }
    })
})

router.get("/logout", function(req, res) {
    req.logOut();
    req.flash("success", "You have been logged out");
    res.redirect("/admin/auth/login")
});

router.get("/home", middleware.isLoggedIn, function(req, res) {
    res.render("admin/homepage")
})

module.exports = router;