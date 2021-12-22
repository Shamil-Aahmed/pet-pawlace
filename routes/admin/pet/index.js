var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const { check, validationResult } = require("express-validator");
var multer = require("multer");
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});


var imageFilter = function(req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'pawlace',
    api_key: "825464156213988",
    api_secret: "2H4GrdzJkmF5z7hNwf0cJI9JvUg"
});
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shamil1505',
    database: 'pawlace1'

});



router.post("/upload", upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        console.log(result)
    });
})

router.get("/", function(req, res) {
    var q = "select pets.status as status,pets.id as id,pets.name as name,pets.age as age, pets.image_link as image_link, pets.price as price, breed.name as breed_name,category.name as category_name from pets,breed,category where pets.breed_id=breed.id and breed.category_id=category.id";
    connection.query(q, function(error, pets) {
        if (error) {
            // console.log(error);
            return res.redirect("back")
        };
        res.render("pet/view", { pets: pets });

    });
});

router.get('/add', function(req, res) {
    var q1 = "select breed.name as breed_name,breed.id as breed_id,category.id as category_id,category.name as category_name from breed, category where breed.category_id=category.id";

    connection.query(q1, function(error1, foundBreeds) {
        if (error1) {
            req.flash("error", "Error Occured");
            return res.redirect("back");
        }
        // console.log(foundBreeds)
        res.render('pet/add', { breeds: foundBreeds });
    });

});
router.post("/add", upload.single('image'), [
    check("name")
    .exists().notEmpty()
    .withMessage("The name field is required"),
    check("pet_description")
    .exists().notEmpty()
    .withMessage("The description field is required")
    .isLength({
        min: 15
    })
    .withMessage("Minimum Length should be 15 characters"),
    check("price")
    .exists().notEmpty()
    .withMessage("price field is required"),
    check("age")
    .exists().notEmpty()
    .withMessage("The age field is required")
    .isLength({
        min: 1,
        max: 2
    })
    .withMessage("Enter age between 1-12"),
    check("breed_id")
    .exists().notEmpty()
    .withMessage("The Breed field is required")

], function(req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const alerts = error.array();
        req.flash("alerts", alerts)
        return res.redirect("back");
    }

    var newPet = {
        name: req.body.name,
        breed_id: req.body.breed_id,
        price: req.body.price,
        age: req.body.age,
        pet_description: req.body.pet_description,
        image_link: null,
        image_id: null,
    }
    cloudinary.uploader.upload(req.file.path, function(result) {
        console.log(result)
        if (result && result.public_id) {
            newPet.image_link = result.secure_url;
            newPet.image_id = result.public_id;

            var q = "insert into pets set?"
            connection.query(q, newPet, function(error, results) {
                if (error) {
                    console.log(error);
                    req.flash("error", "Error Occured");
                    return res.redirect("back");
                }
                console.log(results);
                res.redirect('/admin/pet')
            });
        } else {
            console.log(error);
            req.flash("error", "Could not upload pet");
            return res.redirect("back");
        }
    });
});

router.get("/update/:id", function(req, res) {
    var q = "select * from pets where id=" + req.params.id + " limit 1";
    connection.query(q, function(error, foundPets) {
        if (error) {
            console.log(error)
            return res.redirect("back")
        };
        if (!foundPets || foundPets.length < 1) {
            return res.redirect("/admin/pet")
        }
        console.log(foundPets);
        var q2 = "select breed.name as breed_name,breed.id as breed_id,category.id as category_id,category.name as category_name from breed, category where breed.category_id=category.id";
        connection.query(q2, function(error, foundBreeds) {
            if (error) {
                return res.redirect("back")
            };
            // console.log(foundBreeds)
            res.render("pet/update", { pet: foundPets[0], breeds: foundBreeds });
        });

    });
});

router.post("/update/:id",
    upload.single('image'), [
        check("name")
        .exists()
        .withMessage("The name field is required"),
        check("price")
        .exists().notEmpty()
        .withMessage("price field is required"),
        check("pet_description")
        .exists().notEmpty()
        .withMessage("The description field is required")
        .isLength({
            min: 15
        })
        .withMessage("Minimum Length should be 15 characters"),
        check("age")
        .exists().notEmpty()
        .withMessage("The age field is required")
        .isLength({
            min: 1,
            max: 2
        })
        .withMessage("Enter value between 1-12"),
    ], async function(req, res) {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const alerts = error.array();
            req.flash("alerts", alerts)
            return res.redirect("back");
        }
        var pets = {
            name: req.body.name,
            breed_id: req.body.breed_id,
            price: req.body.price,
            age: req.body.age,
        }
        var q = "select * from pets where id =" + req.params.id;
        connection.query(q, async function(error, pet) {
            if (error) {
                console.log(error);
                req.flash("error", "Error 3 Occured");
                return res.redirect("back");
            } else {
                console.log(pet);
                if (req.file) {
                    try {
                        var temp_id = pet[0].image_id;

                        var result = await cloudinary.v2.uploader.upload(req.file.path)
                        pets.image_id = result.public_id;
                        pets.image_link = result.secure_url;
                        var q = "update pets set ? where id = " + pet[0].id
                        connection.query(q, pets, async function(error, result) {
                            if (error) {
                                console.log(error);
                                req.flash("error", "Error 2 Occured");
                                return res.redirect("back");


                            }
                            try {
                                await cloudinary.v2.uploader.destroy(temp_id);
                                console.log(result)
                                res.redirect("/admin/pet")
                            } catch (err) {
                                console.log(err)
                                req.flash("error", err.message);
                                return res.redirect("back");
                            }

                        })
                    } catch (err) {
                        if (err) {
                            console.log(err)
                            req.flash("error", err.message);
                            return res.redirect("back");
                        }

                    }
                } else {
                    pets.image_id = pet[0].image_id;
                    pets.image_link = pet[0].image_link;
                    var q = "update pets set ? where id = " + pet[0].id
                    connection.query(q, pets, async function(error, result) {
                        if (error) {
                            console.log(error);
                            req.flash("error", "Error 2 Occured");
                            return res.redirect("back");


                        }
                        try {
                            console.log(result)
                            res.redirect("/admin/pet")
                        } catch (err) {
                            console.log(err)
                            req.flash("error", err.message);
                            return res.redirect("back");
                        }

                    })
                }

            }

        })
    });



router.get('/delete/:id', async function(req, res) {
    var q = "select * from pets where id =" + req.params.id;
    connection.query(q, async function(error, result) {
        if (error) {
            console.log(error);
            return res.redirect("back");
        }
        console.log(result);
        try {
            await cloudinary.v2.uploader.destroy(result[0].image_id);
            var q1 = "delete from pets where id =" + result[0].id;
            connection.query(q1, async function(error1, pets) {
                if (error1) {
                    console.log(error);
                    return res.redirect("back");
                }
                console.log(pets);
                res.redirect('/admin/pet');
            })
        } catch (err) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }

    })
});


module.exports = router;