var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

const { check, validationResult } = require("express-validator");


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shamil1505',
    database: 'pawlace1'

});
router.get("/", function(req, res) {
    var q = "select * from pets";
    connection.query(q, function(error, pets, fields) {
        if (error) {
            // console.log(error);
            return res.redirect("back")
        };
        res.render("user/pet", { pets: pets });
    });
});

router.get("/:id", function(req, res) {
    var q = "select * from pets where pets.id = " + req.params.id;
    connection.query(q, function(error, pet, fields) {
        if (error) {
            console.log(error);
            return res.redirect("back")
        };
        console.log(pet);
        res.render("user/petdetails", { pet: pet[0] });
    });
});
router.get("/checkout/:pet_id", function(req, res) {
    var q = "select pets.id as id,pets.name as name,pets.age as age, pets.pet_description as pet_description, pets.image_link as image_link, pets.price as price, breed.name as breed_name,category.name as category_name from pets,breed,category where pets.id =" + req.params.pet_id + " and pets.breed_id=breed.id and breed.category_id=category.id";
    connection.query(q, function(error, pet, field) {
        if (error) {
            console.log(error)
            return res.redirect("back")
        }
        console.log(pet)
        res.render("checkout", { pet: pet[0] })
    })
})
router.post("/checkout/:id", [
        check("address")
        .exists()
        .withMessage("The Address field is required"),
        check("country")
        .exists().notEmpty()
        .withMessage("Country field is required"),
        check("city")
        .exists().notEmpty()
        .withMessage("The City field is required"),
        check("phone_no")
        .exists().notEmpty()
        .withMessage("The Phone field is required")
    ], isPetAvailable,
    async function(req, res) {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const alerts = error.array();
            console.log(alerts)
            req.flash("alerts", alerts)
            return res.redirect("back");
        }
        var order = {
            user_id: req.user.id,
            pet_id: req.params.id,
            city: req.body.city,
            address: req.body.address,
            country: req.body.country,
            phone_no: req.body.phone_no
        }
        var q = "insert into orders set?";
        connection.query(q, order, async function(error, result) {
            if (error) {
                console.log(error);
                req.flash("error", "Checkout couldn't proceed");
                return res.redirect("back");
            }

            var q1 = "update pets set pets.status='booked' where pets.id=" + req.params.id;
            connection.query(q1, async function(error, result) {
                if (error) {
                    console.log(error);
                    req.flash("error", "Could not update pets status");
                    return res.redirect("back");
                }
                req.flash("success", "Your request has been received. You will receive approval email.");
                res.redirect("/")
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