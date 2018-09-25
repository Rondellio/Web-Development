// JavaScript source code
module.exports = function () {
    var express = require('express');
    var router = express.Router();


    //Get list of all special abilities
    function getAbilities(res, mysql, context, complete) {
        mysql.pool.query("SELECT ability_id as id, name, attack_buff, defense_buff, health_buff FROM imp_abilities", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.abilities = results;
            complete();
        });
    }

    //Display all special abilities
    router.get('/', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteChar.js"];
        var mysql = req.app.get('mysql');
        getAbilities(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('abilities', context);
            }
    
        }
    });

    //Add a special ability to the table, then reload page
    router.post('/', function (req, res) {
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "INSERT INTO imp_abilities (name, attack_buff, defense_buff, health_buff) VALUES (?, ?, ?, ?)";
        var inserts = [req.body.name, req.body.attack_buff, req.body.defense_buff, req.body.health_buff];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/abilities');
            }
        });
    });

    //Delete a special ability from the table
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM imp_abilities WHERE ability_id = ?";
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
