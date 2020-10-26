const express = require('express')
const PORT = 3000
const mysql = require("mysql");
const util = require('util');
const path = require('path');
const flash = require('connect-flash');
const fileUpload = require("express-fileupload");
const session = require('express-session');
const methodOverride = require('method-override');
require('dotenv').config()




// Express
const app = express()

// Mysql
const db = mysql.createConnection ({    
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE
});
db.connect((err) => {
  if (err) { throw err;}
  console.log('Connecté à la base MySQL');
});

// allows to make async requests
const query = util.promisify(db.query).bind(db)
//  Makes constants usable in any file in the project
global.db = db;
global.query = query;

// Express-session
app.use(session({
  secret: 'shhuuuuut',
  resave: false,
  saveUninitialized: true,
  name: 'biscuit',
  cookie: {   maxAge: 24 * 60 * 60 * 7 * 1000 }
}))

// Body parser
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))

// Method Override
app.use(methodOverride('_method'))

// Express Static
app.use(express.static(path.join(__dirname, './public')));

// FileUpload
app.use(fileUpload());

// EJS
app.set('view engine', 'ejs');

// Connect flash
app.use(flash());



////////////// Middleware /////////////////////
const { adminPages, userAuth } = require("./middleware/auth")
const { checkInsult } = require("./middleware/comment")




////////////// Controllers ////////////////////
// Home page
const { getHomePage } = require("./controllers/home")
// Activities
const { getAllActivitiesPage, getOneActivity } = require("./controllers/activities")
// Auth
const { getRegisterPage, postRegister, getLoginPage, postLogin, logout } = require("./controllers/auth")
// Admin
const { getAdminPage,
        createActivity,
        createCategory,
        editCategory,
        editActivity,
        deleteOneActivity,
        deleteOneUser,
        getEditActivity,
        getEditCategory,
        getListUser,
        getListCategories,
        getListActivities,
        getListComments,
        deleteOneCategory,
        getCreate,
        adminDeleteComment, 
        getAdminMessage,
        adminSendMessage,
        adminStatusUser,
        adminStatusComment,
        getAdminEditUser,
        editUser } = require("./controllers/admin")
// User
const { getUserPage,
        addComment,
        deleteComment,
        getEditProfilUser,
        editProfil,
        editPasswordProfil,
        deleteProfil,
        userSendMessage } = require("./controllers/user")


app.use(function(req, res, next){
  const userID = req.session.userID
  const roleID = req.session.roleID
  const userNAME = req.session.userNAME
  const userLASTNAME = req.session.userLASTNAME
  res.locals.userSession = {userID, roleID, userNAME, userLASTNAME}
  // console.log(res.locals.userSession);
  next();
})




////////////// Routes /////////////////////////
// Index 
app.get('/', getHomePage) //Page d'acceuil
// Activities
app.get('/activities/list/:id', getAllActivitiesPage)   // Display activities list page filter by categories
app.get('/activities/:id', getOneActivity)  // Display more info in page for one activity
// Authentification
app.get('/auth/register', getRegisterPage) // Display register page
app.post('/auth/register', postRegister)  // Register user
app.get('/auth/login', getLoginPage)   // Display login page
app.post('/auth/login', postLogin)  // Login user
app.get('/auth/logout', logout) // Logout user
// Users
app.get("/user-area/:id", userAuth, getUserPage) // Display user area
app.post("/user-area/:id", userAuth, checkInsult, addComment) // Add comment
app.delete("/user-area/delete/comment/:id", userAuth, deleteComment) // Delete comment
app.get("/user-area/edit-profil/:id", userAuth, getEditProfilUser) // Display form edit user
app.put("/user-area/edit-profil/:id", userAuth, editProfil) // Edit profil exept password
app.put("/user-area/edit-profil-password/:id", userAuth, editPasswordProfil) // Edit password of user
app.delete("/user-area/delete/:id", userAuth, deleteProfil) // User delete his profil
app.post("/user-area/send-message/:id", userAuth, userSendMessage) // User send message for admin
// Admin
app.get("/admin", adminPages, getAdminPage)  // Display admin home page
app.get("/admin/list/users", adminPages, getListUser) // Display user list page
app.get("/admin/list/activities", adminPages, getListActivities)  // Display activities list page
app.get("/admin/list/categories", getListCategories) // Display categories list
app.get("/admin/list/comments", adminPages, getListComments) // Display comments list
app.get("/admin/create", adminPages, getCreate)  // Display form for create activity
app.post("/admin/create/activity", adminPages, createActivity)  // Create activity
app.post("/admin/create/category", adminPages, createCategory)  // Create category
app.get("/admin/edit/activity/:id", adminPages, getEditActivity) // Display form for edit activity
app.put("/admin/edit/activity/:id", adminPages, editActivity) // Edit activity
app.get("/admin/edit/category/:id", adminPages, getEditCategory) // Display form for edit category
app.put("/admin/edit/category/:id", adminPages, editCategory)  // Edit category
app.delete("/admin/delete/activity/:id", adminPages, deleteOneActivity) // Delete activity
app.delete("/admin/delete/category/:id", adminPages, deleteOneCategory) // Delete categorie and its activities 
app.delete("/admin/delete/user/:id", adminPages, deleteOneUser) // Delete user
app.delete("/admin/delete/comment/:id", adminPages, adminDeleteComment) // Delete one comment
app.get("/admin/message/:id", adminPages, getAdminMessage) // Display message in admin area
app.post("/admin/message/:id", adminPages, adminSendMessage) // Admin send message
app.put("/admin/block/user/:id", adminPages, adminStatusUser) // Block or Unblock user
app.put("/admin/status/comment/:id", adminPages, adminStatusComment) // Display or not comment
app.get("/admin/edit/user/:id", adminPages, getAdminEditUser) // Display form for edit user profil
app.put("/admin/edit/user/:id", adminPages, editUser) // Edit this user


//////////// Localhost /////////////////
app.listen(PORT, () => {
    console.log(`le serveur tourne sur le port ${PORT}`);
})