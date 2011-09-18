
// Module dependencies.

var express = require('express'),
    /*connect = require('connect'),*/
    everyauth = require('everyauth'),
    /*auth = require('connect-auth'),*/
    conf = require('./conf');

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

everyauth.debug = true;

everyauth
  .twitter
    .consumerKey(conf.twit.consumerKey)
    .consumerSecret(conf.twit.consumerSecret)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
      return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
    })
/*.findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData) {*/
/*var promise = this.Promise();*/
/*users.findOrCreateByTwitterData(twitterUserData, accessToken, accessTokenSecret, promise);*/
/*return promise;*/
/*})*/
    .redirectPath('/');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'foobar' }));
  app.use(everyauth.middleware());
  app.use(express.methodOverride());
  app.use(app.router);
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');
  app.use(express.static(__dirname + '/public'));
  everyauth.helpExpress(app);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


// Routes

app.get('/', function(req, res){
  console.log("Got the index");
  res.render('index', { title: 'Home' });
});

app.get('/private', function(req, res){
  console.log("Got the protected");
  res.render('private', {title: 'Protected'});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
