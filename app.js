/**
 * Module dependencies.
 */

var express = require('express'),
    auth = require('connect-auth'),
    twitKey = "809JiWRofheAvdYgO4ACA",
    twitSec = "tNe4jr0aCiPRe52QVsVY1IJsZKcesf3ORyabmfQ6Ms";

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'foobar' }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(auth( [
    auth.Twitter({
       consumerKey: twitKey, 
       consumerSecret: twitSec})
  ]) );
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Connect Auth Protection Method
function protect(req, res, next) {
  if( req.isAuthenticated() ){ next(); }
  else {
    req.authenticate(function(error, authenticated) {
      if( error ) next(new Error("Problem authenticating"));
      else {
        if( authenticated === true)next();
        else if( authenticated === false ) next(new Error("Access Denied!"));
        else {
          // Abort processing, browser interaction was required 
          // (and has happened/is happening)
        }
      }
    })
  }
}

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});

app.get('/private', protect, function(req, res){
  res.render('private', {title: 'Protected'});
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
