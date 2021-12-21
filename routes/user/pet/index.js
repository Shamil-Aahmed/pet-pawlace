var express = require('express');
var router = express.Router();
var mysql = require('mysql2');


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
router.get("/checkout/:id", function(req, res) {
        var q = "select * from pets where id =" + req.params.id;
        connection.query(q, function(error, pet, field) {
            if (error) {
                console.log(error)
                return res.redirect("back")
            }
            console.log(pet)
            res.render("checkout", { pet: pet[0] })
        })
    })
    // router.post("checkout/:id", function(req, res) {
    //     var q = "select * from pets where pets.id =" + req.params.id;
    //     connection.query(q, function(error, pet, field) {
    //         if (error) {
    //             console.log(error)
    //             return res.redirect("back")
    //         }
    //         console.log(pet)
    //         res.render("checkout", { pet: pet[0] })
    //     })
    // })



module.exports = router;