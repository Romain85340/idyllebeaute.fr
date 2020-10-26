const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    checkInsult: async (req, res, next) => {
        const userID = req.session.userID
        const comment = req.body.comment
        let trashTalk;

        data = new FormData();
        data.append('text', `${comment}`);
        data.append('lang', 'fr');
        data.append('mode', 'standard');
        data.append('api_user', process.env.API_INSULT_USER);
        data.append('api_secret', process.env.API_INSULT_PW);

        axios({
            url: 'https://api.sightengine.com/1.0/text/check.json',
            method:'post',
            data: data,
            headers: data.getHeaders()
          })
          .then(function (response) {
            // on success: handle response
            trashTalk = response.data.profanity.matches[0]
            console.log(response.data.profanity.matches[0]);

            if(typeof trashTalk !== 'undefined'){
              req.flash("error", "Pas d'insulte s'il vous plait!"),
              res.redirect(`/user-area/${userID}`)
            } else {
                next();
            }
          })
          .catch(function (error) {
            // handle error
            if (error.response) {console.log(error.response.data);}
            else {console.log(error.message);}
          })
    }
}