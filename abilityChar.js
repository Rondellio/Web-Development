// JavaScript source code
module.exports = function () {
    var express = require('express');
    var router = express.Router();

    /* get characters to populate in dropdown */
    function getChars(res, mysql, context, complete) {
        mysql.pool.query("SELECT char_id, name FROM imp_chars", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.char = results;
            complete();
        });
    }

    /* get Abilities to populate in dropdown */
    function getAbilities(res, mysql, context, complete) {
        sql = "SELECT ability_id, name FROM imp_abilities";
        mysql.pool.query(sql, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end()
            }
            context.abilities = results
            complete();
        });
    }

    /* get characters with their abilities */
    function getCharsWithAbilities(res, mysql, context, complete) {
        sql = "SELECT c.name, c.char_id as char_id, ab.name AS ability, ab.ability_id as ability_id FROM imp_chars c INNER JOIN imp_char_abilities ca on c.char_id = ca.char_id INNER JOIN imp_abilities ab on ab.ability_id = ca.ability_id ORDER BY c.name, ability"
        mysql.pool.query(sql, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end()
            }
            context.char_with_ability = results
            complete();
        });
    }


    /* List chaaracters and abilities along with 
     * displaying a form to associate a character with multiple abilities
     */
    router.get('/', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteChar.js"];
        var mysql = req.app.get('mysql');
        var handlebars_file = 'abilityChar'

        getChars(res, mysql, context, complete);
        getAbilities(res, mysql, context, complete);
        getCharsWithAbilities(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 3) {
                res.render(handlebars_file, context);
            }
        }
    });

    /* Associate abilitie(s) with a char and 
     * then redirect to the abilityChar page after adding 
     */
    router.post('/', function (req, res) {
        console.log("We get the multi-select ability dropdown as ", req.body.abilities)
        var mysql = req.app.get('mysql');
        // let's get out the certificates from the array that was submitted by the form 
        var ability = req.body.abilities
        var character = req.body.char
        for (let abils of ability) {
            console.log("Processing ability id " + abils)
            var sql = "INSERT INTO imp_char_abilities (char_id, ability_id) VALUES (?,?)";
            var inserts = [character, abils];
            sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
                if (error) {
                    //TODO: send error messages to frontend as the following doesn't work
                    /* 
                    res.write(JSON.stringify(error));
                    res.end();
                    */
                    console.log(error)
                }
            });
        } //for loop ends here 
        res.redirect('/abilityChar');
    });

    /* Delete an ability from a character */
    /* This route will accept a HTTP DELETE request in the form
     * /char_id/{{char_id}}/ability_id/{{ability_id}} -- which is sent by the AJAX form 
     */
    router.delete('/char_id/:char_id/ability_id/:ability_id', function (req, res) {
        //console.log(req) //I used this to figure out where did pid and cid go in the request
        console.log(req.params.char_id)
        console.log(req.params.ability_id)
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM imp_char_abilities WHERE char_id = ? AND ability_id = ?";
        var inserts = [req.params.char_id, req.params.ability_id];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            } else {
                res.status(202).end();
            }
        })
    })

    return router;
}();