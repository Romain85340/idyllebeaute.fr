require("../controllers/auth")
const bcrypt = require('bcrypt');

module.exports = {
    getUserPage: async (req, res) => {
        // const id = req.session.userID
        const id = req.params.id        
        
        try {
            const user = await query("SELECT id, firstname, lastname, age, email, concat(substr(phone,1,2),' ',substr(phone,3,2),' ',substr(phone,5,2),' ',substr(phone,7,2),' ',substr(phone,9,2)) AS phone FROM users WHERE id = ?", [id])
            const comments = await query("SELECT id, commentary FROM commentary WHERE user_id = ?", [id])
            const oneMessage = await query("SELECT m.content AS content, us.firstname AS send_firstname, us.lastname AS send_lastname, ur.firstname AS receive_firstname, ur.lastname AS receive_lastname FROM message AS m INNER JOIN users AS us ON us.id = m.send_user_id INNER JOIN users AS ur ON ur.id = m.receive_user_id WHERE us.id = ? OR ur.id = ? ORDER BY m.content ASC LIMIT 1;", [id, id])
            const allMessage = await query("SELECT m.content AS content, us.id AS send_id, us.firstname AS send_firstname, us.lastname AS send_lastname, ur.id AS receive_id, ur.firstname AS receive_firstname, ur.lastname AS receive_lastname FROM message AS m INNER JOIN users AS us ON us.id = m.send_user_id INNER JOIN users AS ur ON ur.id = m.receive_user_id WHERE us.id = ? OR ur.id = ? ORDER BY m.id ASC", [id, id])
            res.render("user-area", {error: req.flash("error"), success: req.flash("success") ,comments, user: user[0], message: oneMessage[0], allMessage, successEdit: req.flash("successEdit")})
        } catch(err){
            res.send(err)
        }
    },
    addComment: async (req, res) => {
        const userID = req.session.userID
        const comment = req.body.comment

        try {
            await query("INSERT INTO commentary (user_id, commentary) VALUES ( ?, ? )", [userID, comment])
            req.flash("success", "Le commentaire a bien été ajoutée")
            res.redirect(`/user-area/${userID}`)
        } catch(err){
            res.send(err)
        }
    },
    deleteComment: async (req, res) => {
        const id = req.params.id
        const userID = req.session.userID
        try {
            await query("DELETE FROM commentary WHERE id = ?", [id])
            res.redirect(`/user-area/${userID}`)
        } catch(err){
            res.send(err)
        }
    },
    getEditProfilUser: async (req, res) => {
        const id = req.params.id
        try {
            const user = await query("SELECT id, firstname, lastname, email, phone FROM users WHERE id = ?", [id])
            res.render("user-area-edit-profil", {user: user[0], error: req.flash("error"), success: req.flash("success")})
        } catch(err){
            res.send(err)
        }
    },
    editProfil: async (req, res) => {
        const id = req.params.id
        const firstname = req.body.firstname
        const lastname = req.body.lastname
        const email = req.body.email
        const phone = req.body.phone
        const age = req.body.age

        try {
            if(!firstname || !lastname || age === '' || !phone || !email){
                req.flash("error", "Remplissez tout les champs pour valider la modification"),
                res.redirect(`/user-area/edit-profil/${id}`)
            } else {
                await query("UPDATE users SET firstname = ?, lastname = ?, email = ?, phone = ?, age = ? WHERE id = ?", [firstname, lastname, email, phone, age, id])
                req.flash("successEdit", "Votre profil à été modifier avec succes")
                res.redirect(`/user-area/${id}`)
            }
        } catch(err){
            res.send(err)
        }
    },
    editPasswordProfil: async (req, res) => {
        const userID = req.session.userID
        const id = req.params.id
        const password = req.body.password
        const password2 = req.body.password2
        const user = await query("SELECT id, firstname, lastname, email, phone FROM users WHERE id = ?", [id])

        try {
            if(!password || !password2){
                req.flash("error", "Remplissez tout les champs pour modifier votre mot de passe"),
                res.redirect(`/user-area/edit-profil/${userID}`)
            }
            else if(password != password2){
                req.flash("error", "Les mot de passe ne corresponde pas"),
                res.redirect(`/user-area/edit-profil/${userID}`)
            } else {
                bcrypt.hash(password, 10, async (err, hash) => {
                    if(err){
                        res.send(err)
                    } else {
                        await query("UPDATE users SET password = ? WHERE id = ?", [hash, id])
                        req.flash("successEdit", "Mot de passe modifier avec succes!"),
                        res.redirect(`/user-area/${userID}`)
                    }
                })
            }
        } catch(err){
            res.send(err)
        }
    },
    deleteProfil: async (req, res) => {
        const id = req.params.id
        try {
                await query("DELETE FROM message WHERE send_user_id = ? OR receive_user_id = ?", [id, id])
                await query("DELETE FROM commentary WHERE user_id = ?", [id])
                await query("DELETE FROM users WHERE id = ?", [id])
                req.session.destroy()
                res.redirect("/")
              
            } catch(err){
            res.send(err)
        }
    },
    userSendMessage: async (req, res) => {
        const userID = req.session.userID
        const content= req.body.content
        try {
            await query("INSERT INTO message (send_user_id, receive_user_id, content) VALUES (?, 10, ?)", [userID, content])
            req.flash("successEdit", "Le message à bien été envoyer")
            res.redirect(`/user-area/${userID}`)
        } catch(err) {
            res.send(err)
        }
    }
}
