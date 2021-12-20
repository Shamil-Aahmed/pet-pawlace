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
    var q = "select * from category";
    connection.query(q, function(error, categories) {
        if (error) {
            return res.redirect("back");
        };
        res.render("category/view", { categories: categories });
    });
});

router.get("/add", function(req, res) {
    res.render("category/add");
});

router.post("/add", [

    check("name")
    .exists().notEmpty()
    .withMessage("The name field is required"),

], function(req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const alerts = error.array();
        req.flash("alerts", alerts)
        return res.redirect("back");
    }
    var newCategory = {
        name: req.body.name,
    };
    var q = "insert into category set ?";
    connection.query(q, newCategory, function(error, result) {
        if (error) {
            req.flash("error", "Error Occured");
            return res.redirect("back")
        };
        console.log(result);
        res.redirect("/admin/category");
    });
});

router.get("/update/:id", function(req, res) {
    var q = "select * from category where id=" + req.params.id + " limit 1";
    connection.query(q, function(error, foundCategory) {
        if (error) {
            return res.redirect("back")
        };
        console.log(foundCategory)
        res.render("category/update", { category: foundCategory[0] });
    });
});

router.post("/update/:id", [
        check("name")
        .exists().notEmpty()
        .withMessage("The name field is required"),
    ],
    function(req, res) {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const alerts = error.array();
            req.flash("alerts", alerts)
            return res.redirect("back");
        }
        var category = {
            name: req.body.name
        };
        var q = "update category set ? where id=" + req.params.id;
        connection.query(q, category, function(error, updateCategory) {
            if (error) {
                return res.redirect("back")
            };
            console.log(updateCategory);
            res.redirect("/admin/category");
        });
    });
router.get("/delete/:id", function(req, res) {
    var q = "delete from category where id = " + req.params.id;
    connection.query(q, function(error, result) {
        if (error) {
            console.log(error);
            return res.redirect("back")
        };
        console.log(result);
        res.redirect("/admin/category");
    });
});

module.exports = router;