const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

module.exports = {
    // Display the user registration page
    getRegisterPage: (req, res) => {
        res.render("register", {error: req.flash("error")})
    },
    // Callback for register user
    postRegister: async (req, res) => {
        // var for request form
        let firstname = req.body.firstname
        let lastname = req.body.lastname
        let age = req.body.age
        let phone = req.body.phone
        let email = req.body.email
        let password = req.body.password
        let password2 = req.body.password2
        // request SQL in const for use after
        const emailQuery = "SELECT email FROM users WHERE email = '" + email + "';"
        // Create transporter email
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_NODEMAILER,
                pass: process.env.PASSWORD_NODEMAILER
            }
        });
        // Option of this mail
        let mailOptions = {
            from: process.env.EMAIL_NODEMAILER,
            to: 'romainaubrydev85@gmail.com',  // For web site in production -> req.body.email 
            subject: 'titre du test',
            text: 'contenu du test',
            html: ` <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
                <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="card-email.css">
                <title>Document</title>
            </head>
            <body>
                <div class="container card-email">
                    <div class="card" style="max-width: 600px;">
                        <img src="https://s3-eu-west-1.amazonaws.com/sc-files.pjms.fr/p/pjms/515/000/224/081/ce4e0fef39814714b727b6bfcff13000.jpg" class="card-img-top" alt="..." style="max-width: 600px;">
                        <div class="card-body" style="max-height: 200px;">
                            <h1 style="font-family: 'Dancing Script', cursive; font-size: 50px">Bienvenue à Idylle Beauté</h1>
                          <p class="card-text" style="font-family: 'Josefin Sans', sans-serif; margin-top: 20px;">Bienvenue sur notre site. Vous pourrez obtenir des réductions, m'envoyé des messages pour plus d'informations. Au plaisir de vous revoir sur <a href="">Idylle Beauté</a> </p>
                        </div>
                      </div>
                </div>
            </body>
            </html>`
                    
            
        };

    if (!firstname || !lastname || age === '' || !phone || !email || !password || !password2) {
        req.flash("error", "Veuillez remplir tous les champs"),
        res.redirect("/auth/register")
    }
    // if password confirmation is correct
    if(password === password2){
        try {
            const resultEmail = await query(emailQuery)
            // if the request have a result
            if(resultEmail.length > 0){
                req.flash("error", "Le compte existe déjà"),
                res.redirect("/auth/register")
            } else {
                // use method hash of bcrypt for hash the password in form and insert in SQL
                bcrypt.hash(password, 10, async (err, hash) => {
                    await query ("INSERT INTO users (firstname, lastname, age, phone, email, password, role_id) VALUES (?, ?, ?, ?, ?, ?, 2);", [firstname, lastname, age, phone, email, hash]);

                    if(!err){
                        transporter.sendMail(mailOptions, async (err, data) => {
                            console.log(mailOptions);
                            if (err) {
                                res.send("erreur");
                            }
                            req.flash("success", "Vous etes bien enregistrer"),
                            res.redirect("/auth/login")
                        }); 
                    } else {
                        res.send("erreur envoi d'email")
                    }
                })       
            }
        } catch(err) {
            res.send(err)
        }
    } else{
        req.flash("error", "Les mots de passe ne sont pas identique"),
        res.redirect("/auth/register")
    }
    },
    // Display login page
    getLoginPage: (req, res) => {
        res.render("login", {success: req.flash("success"), error: req.flash("error")})
    },
    // Callback user login
    postLogin: (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        // Request SQL for check if the email exists in the database
        db.query('SELECT firstname, lastname, email, password, role_id, id, status FROM users WHERE email= ?', [email], (err, result) => {
            if (err || result.length === 0) {
                req.flash("error", "Vous n'etes pas inscrit"),
                res.redirect("/auth/login")
            } else {
                // use compare method of bcrypt for compare the password insert on the form and the password in my DB
                bcrypt.compare(password, result[0].password, (err, success) => {
                    if (err) {
                        req.flash("error", "Mot de passe incorrect"),
                        res.redirect("/auth/loginlogin")
                    }
                    if (success) {
                        if(result[0].status === 0) {
                            console.log(result[0].status);
                            req.flash("error", "Votre compte à été bloqué"),
                            res.redirect("/auth/login")
                        } else {
                            // if email and password is correct, select this user 
                        db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, result[0].password], function (err, results) {
                            if (results.length) {
                                // if there is a result, insert in session:
                                req.session.loggedin = true;
                                req.session.userNAME = result[0].firstname;
                                req.session.userLASTNAME = result[0].lastname;
                                req.session.userID = result[0].id;
                                req.session.roleID = result[0].role_id;
                                // console.log("session",  req.session);
                                
                                // if the roleID is equal of adminID redirect in admin page 
                                if(req.session.roleID === 1){
                                    res.redirect("/admin")
                                } else {
                                    res.redirect("/")
                                }
                                
                            } else {
                                res.send(err)
                            }
                        });
                        }
                    } else {
                        req.flash("error", "Email ou mot de passe incorrect"),
                        res.redirect("/auth/login")
                    }
                })
            }
        })
    },
    // Callback for disconnect user
    logout: (req, res) => {
        req.session.destroy()
        res.redirect("/")
    }
}