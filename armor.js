// JavaScript source code
module.exports = function () {
    var express = require('express');
    var router = express.Router();


    //Get list of all armor
    function getArmor(res, mysql, context, complete) {
        mysql.pool.query("SELECT armor_id as id, name, defense_buff, health_buff FROM imp_armor", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.armor = results;
            complete();
        });
    }

    //Display all armor
    router.get('/', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteChar.js"];
        var mysql = req.app.get('mysql');
        getArmor(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('armor', context);
            }
    
        }
    });

    //Add an armor to the table, then reload page
    router.post('/', function (req, res) {
        var mysql = req.app.get('mysql');
        console.log(req.body)
        var sql = "INSERT INTO imp_armor (name, defense_buff, health_buff) VALUES (?, ?, ?)";
        var inserts = [req.body.name, req.body.defense_buff, req.body.health_buff];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/armor');
            }
        });
    });

    //Delete an armor from the table
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM imp_armor WHERE armor_id = ?";
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