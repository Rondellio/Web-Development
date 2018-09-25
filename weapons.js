// JavaScript source code
module.exports = function () {
    var express = require('express');
    var router = express.Router();


    //Get list of all weapons
    function getWeapons(res, mysql, context, complete) {
        mysql.pool.query("SELECT w.weapon_id as id, w.name, w.attack_buff, w.health_buff, sa.name as ability FROM imp_weapons w LEFT JOIN imp_abilities sa ON w.special_ability = sa.ability_id", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.weapons = results;
            complete();
        });
    }

    //Get list of special abilities
    function getAbilities(res, mysql, context, complete) {
        mysql.pool.query("SELECT ability_id as id, name FROM imp_abilities", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.abilities = results;
            complete();
        });
    }

    //Display all weapons
    router.get('/', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteChar.js"];
        var mysql = req.app.get('mysql');
        getWeapons(res, mysql, context, complete);
        getAbilities(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('weapons', context);
            }
    
        }
    });

    //Add a weapon to the table, then reload page
    router.post('/', function (req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO imp_weapons (name, attack_buff, health_buff, special_ability) VALUES (?, ?, ?, ?)";
        if (req.body.ability == "NULL")
        {
            req.body.ability = null;
        }
        var inserts = [req.body.name, req.body.attack_buff, req.body.health_buff, req.body.ability];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/weapons');
            }
        });
    });

    //Delete a weapon from the table
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM imp_weapons WHERE weapon_id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })
    
    return router;
}();
