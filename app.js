
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
  
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var flash = require('connect-flash');

passport.use(new Strategy({
    consumerKey: 'FIhnpzjezyhXYLY7NEA8yLApW',
    consumerSecret: 'PPUmkYnmXwtcUFWaa51im9GdvDTa94Kup18oUOuLpxo3ZEx9Ad',
    callbackURL: 'https://freecodecamp-dynamic-voting.herokuapp.com/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var app = express();


app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/auth/twitter',
  passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function login(req, res, next) {
  if (!req.user) {
    req.flash('info', '请先登录');
    res.redirect('/');
    next();
  } else {
    next();
  }
}
app.get('/vote', login, routes.my);
app.get('/vote/new', login, routes.create);
app.post('/vote/new', login, routes.save);
app.get('/vote/:id', routes.view);
app.post('/vote/:id', routes.vote);
app.get('/delete/:id', login, routes.delete);
                                     
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
