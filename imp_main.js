/*  
    Uses express, dbcon for database connection, body parser to parse form data 
    handlebars for HTML templates  
*/

var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
//new
var path = require('path') //for CSS and images

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);
app.use('/', express.static('public')); //new tt
app.use('/home', require('./home.js')); //new tt
app.use('/charClasses', require('./charClasses.js'));

app.use('/weapons', require('./weapons.js'));
app.use('/armor', require('./armor.js'));
app.use('/abilities', require('./abilities.js'));
app.use('/charBuild', require('./charBuild.js'));
app.use('/abilityChar', require('./abilityChar.js'));
//app.use('/updateChar', require('./updateChar.js'));
//app.use('/updateAbilities', require('./updateAbilities.js'));


//app.use('/home', express.static('public'));

//new
app.use(express.static(path.join(__dirname, '/public'))); //for CSS
//app.use(express.static(path.join(__dirname, 'public/images'))); //for images


app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});