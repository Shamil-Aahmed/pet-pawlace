var express = require('express');
var router = express.Router();
var mysql = require("mysql2");
const { check, validationResult } = require("express-validator");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "shamil1505",
    database: "pawlace1",
});


router.get("/", function(req, res) {
    var q = "select * from breed";
    connection.query(q, function(error, breeds) {
        if (error) {
            return res.redirect("back")
        };
        res.render("breed/view", { breeds: breeds });
    });
});

router.get("/add", function(req, res) {
    var q = "select * from category";
    connection.query(q, function(error, foundCategories) {
        if (error) {
            req.flash("error", "Error Occured");
            return res.redirect("back")
        };
        console.log(foundCategories);
        res.render("breed/add", { categories: foundCategories });
    });
});

router.post("/add", [

    check("name")
    .exists().notEmpty()
    .withMessage("The name field is required"),
    check("category_id")
    .exists().notEmpty()
    .withMessage("The category field is required"),
], function(req, res) {

    const error = validationResult(req);
    if (!error.isEmpty()) {
        const alerts = error.array();
        req.flash("alerts", alerts)
        return res.redirect("back");
    }
    var newBreed = {
        name: req.body.name,
        category_id: req.body.category_id
    };
    var q = "insert into breed set ?";
    connection.query(q, newBreed, function(error, result) {
        if (error) {
            req.flash("error", "Error Occured");
            return res.redirect("back")
        };
        console.log(result);
        res.redirect("/admin/breed");
    });
});

router.get("/update/:id", function(req, res) {
    var q = "select * from breed where id=" + req.params.id + " limit 1";
    connection.query(q, function(error, foundBreed) {
        if (error) {
            return res.redirect("back")
        };
        var q2 = "select * from category";
        connection.query(q2, function(error, foundCategories) {
            if (error) {
                return res.redirect("back")
            };
            console.log(foundCategories)
            res.render("breed/update", { breed: foundBreed[0], categories: foundCategories });
        });

    });
});

router.post("/update/:id", [

    check("name")
    .exists().notEmpty()
    .withMessage("The name field is required"),
    check("category_id")
    .exists().notEmpty()
    .withMessage("The category field is required"),
], function(req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const alerts = error.array();
        req.flash("alerts", alerts)
        return res.redirect("back");
    }
    var breed = {
        name: req.body.name,
        category_id: req.body.category_id
    };
    var q = "update breed set ? where id=" + req.params.id;
    connection.query(q, breed, function(error, updateBreed) {
        if (error) {
            return res.redirect("back")
        };
        console.log(updateBreed);
        res.redirect("/admin/breed");
    });
});
router.get("/delete/:id", function(req, res) {
    var q = "delete from breed where id = " + req.params.id;
    connection.query(q, function(error, result) {
        if (error) {
            console.log(error);
            return res.redirect("back")
        };
        console.log(result);
        res.redirect("/admin/breed");
    });
});

module.exports = router;