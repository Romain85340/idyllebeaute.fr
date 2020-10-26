const fileUpload = require("express-fileupload");
const bcrypt = require('bcrypt');

module.exports = {
    // Display the admin home page
    getAdminPage: async (req, res) => {
        try {
            const categories = await query("SELECT * FROM categories")
            const activities = await query("SELECT a.image AS activity_image, a.name AS activity_name, a.id AS activity_id, a.price AS activity_price, a.categorie_id AS category_id, a.time AS activity_time, a.text AS activity_text, c.name AS category_name FROM activities  AS a INNER JOIN categories AS c ON c.id = a.categorie_id ORDER BY a.categorie_id")
            const users = await query("SELECT id, firstname, lastname, age, phone FROM users")
            const commentaries = await query("SELECT u.firstname, u.lastname, c.commentary FROM commentary AS c INNER JOIN users AS u ON u.id = c.user_id")
            res.render("admin-home", {users, commentaries, activities, categories})
        } catch(err){
            res.send(err)
        }
    },
    // Display the user list page
    getListUser: async (req, res) => {
        try {
            const users = await query("SELECT id, firstname, lastname, age, email, phone, status FROM users")
            res.render("admin-list-user", {users, success: req.flash("success")})
        } catch(err){
            res.send(err)
        }
    },
    // Display the activities list page
    getListActivities: async (req, res) => {
        try {
            const activities = await query("SELECT a.image AS activity_image, a.name AS activity_name, a.id AS activity_id, a.price AS activity_price, a.categorie_id AS category_id, a.time AS activity_time, a.text AS activity_text, c.name AS category_name FROM activities  AS a INNER JOIN categories AS c ON c.id = a.categorie_id ORDER BY a.categorie_id")
            res.render("admin-list-activities", {activities, success: req.flash("success")})
        } catch(err){
            res.send(err)
        }
    },
    // Display list of categories
    getListCategories: async (req, res) => {
        try {
            const categories = await query("SELECT id, name, image FROM categories")
            res.render("admin-list-categories", {categories, success: req.flash("success")})
        } catch(err){
            res.send(err)
        }
    },
    // Display page with form for create activity or category
    getCreate : (req, res) => {
        let category = "SELECT id, name FROM categories"
        
        // Query SQL
        db.query( category, (err, result) => {
            // console.log(result);
            if (err) {
                return res.status(500).send(err);
            }
             res.render("admin-create", {categories: result, errorActivity: req.flash("error-activity"), errorCategory: req.flash("error-category")})
        })
    },
    // Create activities
    createActivity:  async (req, res) => {
         
        // var for request form
        let name = req.body.name
        let categorie_id = req.body.categorie_id
        let price = req.body.price
        let text = req.body.text
        let time = req.body.time
        
        if(!name || !categorie_id || !price || !text || !time){
            return req.flash("error-activity", "N'oubliez pas de remplir tout les champs"),
            res.redirect("/admin/create")
        }
        // if there is no file in the form
        if (!req.files){
            return req.flash("error-activity", "N'oubliez pas d'ajouter une image"),
            res.redirect("/admin/create")
        }

        let imageUpload = req.files.image
        // var for upload name image in mySQL
        let image = `/images/${imageUpload.name}` 
        
        
        // if the image has the correct format
        if (imageUpload.mimetype === "image/jpeg" || imageUpload.mimetype === "image/jpg" || imageUpload.mimetype === "image/gif" || imageUpload.mimetype === "image/png") {
            // Use the mv() method to place the file somewhere in NodeJS
            imageUpload.mv(`public/images/${imageUpload.name}`, async function(err) {
                if (err){
                    return res.status(500).send(err);
                }
                try{
                    await query('INSERT INTO activities (name, categorie_id, price, time, text, image) VALUES (?, ?, ?, ?, ?, ?);',[name, categorie_id, price, time, text, image])
                    req.flash("success", "L'activité a bien été crée avec succes!"),
                    res.redirect("/admin/list/activities")
                }catch(err) {
                    res.send(err)
                }
            });
        }
    },
    // Create category
    createCategory: async (req, res) => {

        // var for request form
        let name = req.body.name

        if(!name){
            return req.flash("error-category", "Donner a nom a la categorie"),
            res.redirect("/admin/create")
        }
        // if there is no file in the form
        if (!req.files){
            return req.flash("error-category", "Ajoutez une image à votre categorie"),
            res.redirect("/admin/create")
        }

        let imageUpload = req.files.image
        // var for upload name image in mySQL
        let images = `/images/${imageUpload.name}`

        // if the image has the correct format
        if (imageUpload.mimetype === "image/jpeg" || imageUpload.mimetype === "image/jpg" || imageUpload.mimetype === "image/gif" || imageUpload.mimetype === "image/png") {
            // Use the mv() method to place the file somewhere in NodeJS
            imageUpload.mv(`public/images/${imageUpload.name}`, async function(err) {
                if (err){
                    return res.status(500).send(err);
                }
                try{
                    await query('INSERT INTO categories (name, image) VALUES (?, ?);',[name, images])
                    req.flash("success", "La categorie a été crée avec succes!"),
                    res.redirect("/admin/list/categories")
                }catch(err) {
                    res.send(err)
                }
            });
        }
    },
    // Display form page for edit category
    getEditCategory: (req, res) => {
        const id = req.params.id
        const category = "SELECT name, id FROM categories WHERE id = ?"

        db.query( category, [id], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render("edit-category", {category: result[0]})
        })
    },
    // Edit one category
    editCategory: async (req, res) => {
        let id = req.params.id
        let name = req.body.name

        if (!req.files){
            try {
                await query("UPDATE categories SET name = ? WHERE id = ?",[name, id])
                return req.flash("success", "Votre categorie a été mis à jour!"),
                res.redirect("/admin/list/categories")
            } catch (err){
                res.send(err)
            }
        }
        let imageUpload = req.files.image
        let images = `/images/${imageUpload.name}`

        if (imageUpload.mimetype === "image/jpeg" || imageUpload.mimetype === "image/jpg" || imageUpload.mimetype === "image/gif" || imageUpload.mimetype === "image/png") {
            imageUpload.mv(`public/images/${imageUpload.name}`, async function(err) {
                if (err){
                    return res.status(500).send(err);
                }
                try{
                    await query("UPDATE categories SET image = ?, name = ? WHERE id = ?",[images, name, id])
                    req.flash("success", "Votre categorie a été mis à jour!"),
                    res.redirect("/admin/list/categories")
                }catch(err) {
                    res.send(err)
                }
            });
        }
    },
    // Display form page for edit one activity
    getEditActivity: async (req, res) => {
        const id = req.params.id 

        try {
            const activity = await query("SELECT id, name, categorie_id, price, time, text, image FROM activities WHERE id = ?", [id])
            const categories = await query("SELECT name, id FROM categories")
            console.log(activity);
            res.render("edit-activity", {activity: activity[0], categories})
        } catch(err){
            res.send(err)
        }
    },
    // Edit one activity
    editActivity: async (req, res) => {

        let id = req.params.id
        let name = req.body.name
        let price = req.body.price
        let text = req.body.text
        let time = req.body.time


        if (!req.files){
            try {
                await query("UPDATE activities SET name = ?, price = ?, text = ?, time = ? WHERE id = ?",[name, price, text, time, id])
                return req.flash("success", "Votre activité a été mis à jour!"),
                res.redirect("/admin/list/activities")
            } catch (err){
                res.send(err)
            }
        }
        let imageUpload = req.files.image
        let images = `/images/${imageUpload.name}`

        if (imageUpload.mimetype === "image/jpeg" || imageUpload.mimetype === "image/jpg" || imageUpload.mimetype === "image/gif" || imageUpload.mimetype === "image/png") {
            imageUpload.mv(`public/images/${imageUpload.name}`, async function(err) {
                if (err){
                    return res.status(500).send(err);
                }
                try{
                    await query("UPDATE activities SET image = ?, name = ?, price = ?, text = ?, time = ? WHERE id = ?",[images, name, price, text, time, id])
                    req.flash("success", "Votre activité a été mis à jour!"),
                    res.redirect("/admin/list/activities")
                }catch(err) {
                    res.send(err)
                }
            });
        }
    },
    // Delete one activity
    deleteOneActivity: async (req, res) => {
        const id = req.params.id;
        try {
            await query("DELETE FROM activities WHERE id = ?", [id]);
            req.flash("success", "L'activité a bien été supprimé"),
            res.redirect("/admin/list/activities")
        } catch(err) {
            res.send(err)
        }
    },
    // Delete one category
    deleteOneCategory: async (req, res) => {
        const id = req.params.id;
        try {
            // Delete activities of this categories
            await query("DELETE FROM activities WHERE categorie_id = ?", [id])
            // Delete this category
            await query("DELETE FROM categories WHERE id = ?", [id]);
            req.flash("success", "La categorie a bien été supprimé"),
            res.redirect("/admin/list/categories")
        } catch(err) {
            res.send(err)
        }
    },
    // Delete one user
    deleteOneUser: async (req, res) => {
        const id = req.params.id;
        try {
            // Delete commentary of this user
            await query("DELETE FROM commentary WHERE user_id = ?", [id])
            // Delete user
            await query("DELETE FROM users WHERE id = ?", [id]);
            req.flash("success", "L'utilisateur a été supprimé avec succes!"),
            res.redirect("/admin/list/users")
        } catch(err) {
            res.send(err)
        }
    },
    // Display list of comments
    getListComments: (req, res) => {
        const id = req.params.id
        const comments = "SELECT c.id, u.firstname, u.lastname, c.status, c.commentary FROM commentary AS c INNER JOIN users AS u ON u.id = c.user_id"

        db.query(comments, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render("admin-list-comment", {comments: result, success: req.flash("success"), error: req.flash("error")})
        })
    },
    // Delete one comment
    adminDeleteComment : (req, res) => {
        const id = req.params.id
        const deleteComment = "DELETE FROM commentary WHERE id = ?"

        db.query(deleteComment, [id], (err) => {
            if(err){
                res.send(err)
            }
            req.flash("success", "Le commentaire a été supprimer avec succes"),
            res.redirect("/admin/list/comments")
        })
    },
    // Display message with one user
    getAdminMessage : async (req, res) => {
        const id = req.params.id 

        try {
            const user = await query("SELECT id, firstname, lastname FROM users WHERE id = ?", [id])
            const allMessage = await query("SELECT m.content AS content, us.id AS send_id, us.firstname AS send_firstname, us.lastname AS send_lastname, ur.id AS receive_id, ur.firstname AS receive_firstname, ur.lastname AS receive_lastname FROM message AS m INNER JOIN users AS us ON us.id = m.send_user_id INNER JOIN users AS ur ON ur.id = m.receive_user_id WHERE us.id = ? OR ur.id = ? ORDER BY m.id ASC", [id, id])
            res.render("admin-user-message", {allMessage, user: user[0]})
        } catch(err){
            res.send(err)
        }
    },
    // Send message for this user
    adminSendMessage : async (req, res) => {
        const id = req.params.id
        const content= req.body.content
        try {
            await query("INSERT INTO message (send_user_id, receive_user_id, content) VALUES (10, ?, ?)", [id, content])
            res.redirect(`/admin/message/${id}`)
        } catch(err) {
            res.send(err)
        }
    },
    // Block or Unblock user
    adminStatusUser : async (req, res) => {
        const id = req.params.id
        const statusUser = await query("SELECT status FROM users WHERE id = ?", [id])

        try {
            if (statusUser[0].status === 0){
                await query("UPDATE users SET status = true WHERE id = ?", [id])
                req.flash("success", "L'utilisateur a bien été débloqué!"),
                res.redirect("/admin/list/users")
            } else  {
                console.log("test");
                await query("UPDATE users SET status = false WHERE id = ?", [id])
                req.flash("success", "L'utilisateur a bien été bloqué!"),
                res.redirect("/admin/list/users")
            } 
        } catch(err){
            res.send(err)
        }
    },
    // Display or not comment
    adminStatusComment : async (req, res) => {
        const id = req.params.id
        const statusComment = await query("SELECT status FROM commentary WHERE id = ?", [id])
        const numberCommentApparent = await query("SELECT id FROM commentary WHERE status = true")
        console.log(numberCommentApparent.length);
       
        try {
            if(statusComment[0].status === 0){
                if(numberCommentApparent.length >= 3){
                    req.flash("error", "Vous ne pouvez afficher que 3 commentaires sur le site"),
                    res.redirect("/admin/list/comments")
                } else {
                    await query("UPDATE commentary SET status = true WHERE id = ?", [id])
                    req.flash("success", "Le commentaire est visible sur le site"),
                    res.redirect("/admin/list/comments")
                }
            } else {
                await query("UPDATE commentary SET status = false WHERE id = ?", [id])
                req.flash("success", "Le commentaire n'est plus visible sur le site")
                res.redirect("/admin/list/comments")
            }
                
        } catch(err){
            res.send(err)
        }
    },
    // Display form for edit user
    getAdminEditUser: async (req, res) => {
        const id = req.params.id
        
        try {
            const userProfil = await query("SELECT id, firstname, lastname, age, email, phone FROM users WHERE id = ?", [id])
            console.log(userProfil);
            res.render("admin-edit-user", {user: userProfil[0]})
        } catch(err){
            res.send(err)
        }
    },
    // Edit this user
    editUser: async (req, res) => {
        const id = req.params.id
        const { firstname, lastname, password, age, phone, email } = req.body

        try{
            if(!firstname || !lastname || !age || !phone || !email){
                req.flash("error", "Veuillez completer tout les champs"),
                res.redirect("/admin/list/users")
            } else {
                if(!password){
                    await query("UPDATE users SET firstname = ?, lastname = ?, email = ?, age = ?, phone = ? WHERE id = ?", [firstname, lastname, email, age, phone, id])
                    req.flash("success", `Le profil de ${firstname} ${lastname} a bien été modifié, exepté le mot de passe!`),
                    res.redirect("/admin/list/users")
                } else {
                    bcrypt.hash(password, 10, async (err, hash) => {
                        if(err){
                            res.send(err)
                        } else {
                            await query("UPDATE users SET firstname = ?, lastname = ?, password = ?, email = ?, age = ?, phone = ? WHERE id = ?", [firstname, lastname, hash, email, age, phone, id])
                            req.flash("success", `Le profil de ${firstname} ${lastname} a bien été modifié`),
                            res.redirect("/admin/list/users")
                        }
                    })
                }
            }
        } catch(err) {
            res.send(err)
        }
    }

}