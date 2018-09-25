// JavaScript source code
module.exports = function () {
    var express = require('express');
    var router = express.Router();


    //Get list of all classes
    function getClasses(res, mysql, context, complete) {
        mysql.pool.query("SELECT class_id as id, name, attack_power as attack, defense_power as defense, health_points as health FROM imp_class", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.charClasses = results;
            complete();
        });
    }

    //Display all classes
    router.get('/', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteChar.js"];
        var mysql = req.app.get('mysql');
        getClasses(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('charClasses', context);
            }
    
        }
    });

    //Add a class to the table, then reload page
    router.post('/', function (req, res) {
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "INSERT INTO imp_class (name, attack_power, defense_power, health_points) VALUES (?, ?, ?, ?)";
        var inserts = [req.body.name, req.body.attack_power, req.body.defense_power, req.body.health_points];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/charClasses');
            }
        });
    });

    //Delete a class from the table
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM imp_class WHERE class_id = ?";
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

