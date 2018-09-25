// JavaScript source code
module.exports = function () {
    var express = require('express');
    var router = express.Router();

    //Get list classes for dropdowns
    function getClasses(res, mysql, context, complete) {
        mysql.pool.query("SELECT class_id, name FROM imp_class", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.charClasses = results;
            complete();
        });
    }

    //Get list of weapons for dropdown
    function getWeapons(res, mysql, context, complete) {
        mysql.pool.query("SELECT weapon_id, name FROM imp_weapons", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.weapons = results;
            complete();
        });
    }

    //Get list of armor for dropdowns
    function getArmor(res, mysql, context, complete) {
        mysql.pool.query("SELECT armor_id, name FROM imp_armor", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.armor = results;
            complete();
        });
    }

    //Get list of created characters
    function getCreatedChars(res, mysql, context, complete) {
        mysql.pool.query("SELECT ch.char_id as id, ch.name, cl.name as class, ch.gender, a.name as armor, w.name as weapon, w.attack_buff + COALESCE(sum(ab.attack_buff),0) + cl.attack_power as attack_power, a.defense_buff + COALESCE(sum(ab.defense_buff),0) + cl.defense_power as defense_power, a.health_buff + w.health_buff + COALESCE(sum(ab.health_buff),0) + cl.health_points as health_points FROM imp_chars ch INNER JOIN imp_class cl ON cl.class_id = ch.class INNER JOIN imp_armor a ON a.armor_id = ch.armor INNER JOIN imp_weapons w ON w.weapon_id = ch.weapon LEFT JOIN imp_char_abilities ca ON ca.char_id = ch.char_id LEFT JOIN imp_abilities ab ON ab.ability_id = ca.ability_id GROUP BY ch.char_id", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            for (let char of results)
            {
                if (char.attack_power > 100) {
                    char.attack_power = 100;
                }
                if (char.defense_power > 100) {
                    char.defense_power = 100;
                }
                if (char.health_points > 100) {
                    char.health_points = 100;
                }
            }
            context.createdChars = results;

            complete();
        });
    }

    //Get list of characters filtered by class
    function getCharsByClass(req, res, mysql, context, complete) {
        var query = "SELECT ch.char_id as id, ch.name, cl.name as class, ch.gender, a.name as armor, w.name as weapon, w.attack_buff + COALESCE(sum(ab.attack_buff),0) + cl.attack_power as attack_power, a.defense_buff + COALESCE(sum(ab.defense_buff),0) + cl.defense_power as defense_power, a.health_buff + w.health_buff + COALESCE(sum(ab.health_buff),0) + cl.health_points as health_points FROM imp_chars ch INNER JOIN imp_class cl ON cl.class_id = ch.class INNER JOIN imp_armor a ON a.armor_id = ch.armor INNER JOIN imp_weapons w ON w.weapon_id = ch.weapon LEFT JOIN imp_char_abilities ca ON ca.char_id = ch.char_id LEFT JOIN imp_abilities ab ON ab.ability_id = ca.ability_id WHERE ch.class = ? GROUP BY ch.char_id";
        console.log(req.params)
        var inserts = [req.params.class]
        mysql.pool.query(query, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.createdChars = results;
            complete();
        });
    }

    //Get one specific char to update information on
    function getChar(res, mysql, context, id, complete) {
        var sql = "SELECT ch.char_id as id, ch.name, ch.gender, cl.name as class, a.name as armor, w.name as weapon FROM imp_chars ch INNER JOIN imp_class cl ON cl.class_id = ch.class INNER JOIN imp_armor a ON a.armor_id = ch.armor INNER JOIN imp_weapons w ON w.weapon_id = ch.weapon  WHERE ch.char_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.imp_chars = results[0];
            complete();
        });
    }

    /*Display all characters. Requires web based javascript to delete users with AJAX*/
    router.get('/', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteChar.js", "filterChars.js"];
        var mysql = req.app.get('mysql');
        getCreatedChars(res, mysql, context, complete);
        getArmor(res, mysql, context, complete);
        getClasses(res, mysql, context, complete);
        getWeapons(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 4) {
                res.render('charbuild', context);
            }

        }
    });

    /*Display all characters from a given class. Requires web based javascript to delete users with AJAX*/
    router.get('/filter/:class', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteChar.js", "filterChars.js"];
        var mysql = req.app.get('mysql');
        getCharsByClass(req, res, mysql, context, complete);
        getArmor(res, mysql, context, complete);
        getClasses(res, mysql, context, complete);
        getWeapons(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 4) {
                res.render('charBuild', context);
            }

        }
    });

    /* Display one person for the specific purpose of updating people */
    router.get('/:id', function (req, res) {
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatechar.js"];
        var mysql = req.app.get('mysql');
        getChar(res, mysql, context, req.params.id, complete); 
        getClasses(res, mysql, context, complete);
        getArmor(res, mysql, context, complete);
        getWeapons(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 4) {
               res.render('update-char', context);
            }

        }
    });



    /* Adds a person, redirects to the charBuild page after adding */

    router.post('/', function (req, res) {
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO imp_chars (name, class, gender, armor, weapon) VALUES (?, ?, ?, ?, ?)";
        var inserts = [req.body.name, req.body.class, req.body.gender, req.body.armor, req.body.weapon];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/charBuild');
            }
        });
    });

    /* The URI that update data is sent to in order to update a character */
    router.put('/:id', function (req, res) {
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE imp_chars SET name=?,class=?, gender=?, armor=?, weapon=? WHERE char_id=?";
        var inserts = [req.body.name, req.body.class, req.body.gender, req.body.armor, req.body.weapon, req.params.id];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.status(200);
                res.end();
            }
        });
    });

    /* Route to delete a character, simply returns a 202 upon success. Ajax will handle this. */
    router.delete('/:id', function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM imp_chars WHERE char_id = ?";
        var inserts = [req.params.id];
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