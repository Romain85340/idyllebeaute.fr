require("../controllers/auth")

module.exports = {
    // Middleware for check if the roleID in express-session is equal to adminID
    adminPages: (req, res, next) => {
        if(req.session.roleID === 1) {
            next();
        } else {
            res.redirect("/")
        }
    },
    userAuth: (req, res, next) => {
        if(req.session.userID > 0) {
            next();
        }else {
            res.redirect("/auth/login")
        }
    }
}