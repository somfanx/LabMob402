var express = require ('express');
var expressHbs = require('express-handlebars')

var app = express();

app.engine('handlebars', expressHbs({
    layoutsDir: __dirname + '/views/layouts',
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


app.get('/', function(req, res){
    res.render('index');
});
app.use(express.static('assets'));



app.listen(process.env.PORT || '3002');

