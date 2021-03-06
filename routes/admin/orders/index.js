var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const { check, validationResult } = require("express-validator");
var multer = require("multer");
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox727c3495070a4db79fc2e8fe8c8b448e.mailgun.org";
const mg = mailgun({ apiKey: "3bcafde2278abed321930631ea8d2948-1831c31e-19b14a1a", domain: DOMAIN });


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shamil1505',
    database: 'pawlace1'

});


router.get("/", function(req, res) {
    var q = "select orders.status as status,orders.id as id,users.name as user_name,pets.name as pet_name, pets.image_link as pet_image_link, pets.price as pet_price, orders.phone_no as phone_no, orders.address as address, orders.country as country, orders.city as city from orders,pets,users where orders.user_id=users.id and orders.pet_id=pets.id";
    connection.query(q, function(error, orders) {
        if (error) {
            // console.log(error);
            req.flash("error", error.sqlMessage)
            return res.redirect("back")
        };

        res.render("order/view", { orders: orders });

    });
});

router.get("/verify/:id", function(req, res) {
    var q1 = "update orders set orders.status='verified' where orders.id=" + req.params.id;
    connection.query(q1, async function(error, result) {
        if (error) {
            console.log(error);
            req.flash("error", "Could not verify");
            return res.redirect("back");
        }
        q2 = "select users.email as email from users,orders where orders.id=" + req.params.id + " and orders.user_id=users.id";

        connection.query(q2, async function(error, result) {
            if (error) {
                console.log(error);
                req.flash("error", "Could not verify");
                return res.redirect("back");
            }
            const data = {
                from: "Mailgun Sandbox <postmaster@sandbox727c3495070a4db79fc2e8fe8c8b448e.mailgun.org>",
                to: result[0].email,
                subject: "Adoption verified",
                text: "Your Adoption has been verified"
            };

            mg.messages().send(data, function(error, body) {
                if (error) {
                    console.log(error);
                    req.flash("error", "Could not send emails");
                    return res.redirect("back");
                }
                console.log(body);
                // Send Email
                req.flash("success", "Your request has been received. You will receive approval email.");
                res.redirect("/admin/orders")
            });
        })



    })
});

function isPetAvailable(req, res, next) {
    var q = "select * from pets where pets.id = " + req.params.id;
    connection.query(q, function(error, pet, fields) {
        if (error) {
            console.log(error);
            return res.redirect("back")
        };
        if (pet[0].status != 'available') {
            req.flash("error", "Pet is not available");
            return res.redirect("back")
        }
        next()
    });
}

module.exports = router;