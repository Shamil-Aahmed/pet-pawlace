var express = require("express");
var router = express.Router();
var mysql = require("mysql2");
var bcrypt = require("bcrypt");
var passport = require("passport")

const { check, validationResult } = require("express-validator");
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "shamil1505",
    database: "pawlace1",
});

router.get("/signup", function(req, res) {
    res.render("user/auth/signup");
});

router.post(
    "/signup", [
        check("name")
        .exists()
        .withMessage("The name field is required")
        .notEmpty()
        .withMessage("The name field is required"),
        check("email")
        .exists().notEmpty()
        .withMessage("Email field is required")
        .isEmail()
        .withMessage("Email format is not valid")
        .custom(async(email) => {
            return new Promise((resolve, reject) => {
                var q = "select * from users where email='" + email + "'";
                connection.query(q, function(error, result) {
                    if (error) {
                        reject(new Error(error.sqlMessage))
                    }
                    if (result && result.length > 0) {
                        reject(new Error('E-mail already in use'))
                    }
                    resolve(true)
                });
            });
        }),
        check("password")
        .exists().notEmpty()
        .withMessage("Password field is required")
        .isLength({ min: 8, max: 16 })
        .withMessage("Password length should be 8 to 16 characters"),

    ],
    function(req, res) {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const alerts = error.array();
            req.flash("alerts", alerts)
            return res.redirect("back");
        }
        var hashedPassword = bcrypt.hashSync(
            req.body.password,
            5,
            function(error, hash) {
                if (error) {
                    console.log(error);
                }
            }
        );
        var newUser = {
            email: req.body.email,
            name: req.body.name,
            password: hashedPassword,
        };
        console.log(hashedPassword);
        var q = "insert into users set ?";
        connection.query(q, newUser, function(error, result) {
            if (error) {
                console.log(error.sqlMessage);
                req.flash("error", error.sqlMessage);
                return res.redirect("back");
            }
            // console.log(result);
            res.status(200);
            res.redirect("/");
        });

    }
);

router.get("/login", function(req, res) {
    res.render("user/auth/login");
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

], passport.authenticate('local-login', {
    successRedirect: '/pet', // redirect to the secure profile section
    failureRedirect: '/auth/login', // redirect back to the signup page if there is an error
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
            req.flash("error", "No user with this email exists");
            return res.redirect("back");
        }
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
                res.redirect("/");
            }
        );
    });
});

router.get("/logout", function(req, res) {
    req.logOut();
    req.flash("success", "You have been logged out");
    res.redirect("/auth/login")
});

module.exports = router;