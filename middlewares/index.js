var middlewareObj = {}

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    req.flash("error", "Please Login First")
    res.redirect('/auth/login');
}

middlewareObj.isAdmin = function(req, res, next) {
    if (req.user.is_admin == 1)
        return next();

    req.flash("error", "You are not authorized for this action")
    res.redirect('/auth/login');
}

module.exports = middlewareObj;