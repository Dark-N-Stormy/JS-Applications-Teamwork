var express = require('express');
var mongoose=require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sha1 = require('sha1');
var exphbs  = require('express-handlebars');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var onlineUsers = [];

//Models
require('./models/models');

//Data
var db = require('./data/db');
var userData = require('./data/user');

//Routes
var routes = require('./routes/index');
var users = require('./routes/users');
var register = require('./routes/register');



//Configuring
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ioHandler = require('./ioHandler')(io,onlineUsers);


db.connect('mongodb://tsn:BkD2#+9hns_E)6Cj@dogen.mongohq.com:10011/tsn')

// view engine & views setup
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
    secret: 'Y9M?5t<FEQ~?S"a!',
    resave:true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.use('/', routes);
app.use('/users', users);
app.use('/register', register);

var User = require('./models/models');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = {
    app:app,
    server:server
};

