module.exports = {
    // Display the list of activities page
    getAllActivitiesPage: async (req, res) => {
        const id = req.params.id

        try {
            // Query SQL
            const activities = await query("SELECT a.name AS activity_name, a.id AS activity_id, a.price AS activity_price, a.categorie_id AS category_id, c.name AS category_name FROM activities  AS a INNER JOIN categories AS c ON c.id = a.categorie_id WHERE categorie_id = ?", [id])
            const category = await query("SELECT name, image FROM categories WHERE id = ?", [id])
            const pagination = await query("SELECT name, id FROM categories WHERE id != ?", [id])

            // Response of callback
            res.render("list-activities", {activities, category, pagination})

        } catch(err){
            res.send(err)
        }
    },
    // Display the Description page of a service
    getOneActivity: (req, res) => {
        let id = req.params.id;
        let activity = "SELECT a.text AS activity_text, a.name AS activity_name, c.name AS category_name, a.price AS activity_price, a.time AS activity_time, a.image AS activity_image FROM activities AS a INNER JOIN categories AS c ON c.id = a.categorie_id WHERE a.id = '" +
        id +
        "'";
        
        // Query SQL
        db.query( activity, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
             res.render("one-activity", {activity: result})
        })
    }
}