module.exports = {
    getHomePage: async (req, res) => {

        try {
            const categories = await query("SELECT name, id, image FROM categories")
            const commentaries = await query("SELECT u.firstname, u.lastname, u.age, c.commentary FROM commentary AS c INNER JOIN users AS u ON u.id = c.user_id WHERE c.status = true")
            // console.log({categories});

            res.render("index", {categories, commentaries})
        } catch(err){
            res.send(err)
        }
        
    }
}