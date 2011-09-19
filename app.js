// Module dependencies.

var express = require('express'),
    everyauth = require('everyauth'),
    conf = require('./conf');

var usersById = {};
var nextUserId = 0;
var usersByTwitId = {};
var usersByFbId = {};
var usersByGhId = {};

everyauth
  .twitter
    .consumerKey(conf.twit.consumerKey)
    .consumerSecret(conf.twit.consumerSecret)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
      return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
    })
    .redirectPath('/');

everyauth.facebook
  .appId(conf.fb.appId)
  .appSecret(conf.fb.appSecret)
  .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
      return usersByFbId[fbUserMetadata.id] || (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
  })
  .redirectPath('/');

everyauth.github
  .appId(conf.github.appId)
  .appSecret(conf.github.appSecret)
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, ghUser) {
      return usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = addUser('github', ghUser));
  })
  .redirectPath('/');

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

/*everyauth.everymodule.findUserById( function (userId, callback) {*/
/*User.findById(userId, callback);*/
/*// callback has the signature, function (err, user) {...}*/
/*});*/


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'foobar' }));
  app.use(express.bodyParser());
  app.use(everyauth.middleware());
  app.use(express.methodOverride());
  app.use(app.router);
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
    /*console.log(req.session);*/
  res.render('index', { title: 'Home' });
});

app.get('/private', function(req, res){
    /*console.log(req.session);*/
    if(req.session.auth && req.session.auth.loggedIn){
      res.render('private', {title: 'Protected'});
    }else{
      console.log("The user is NOT logged in");
      /*console.log(req.session);*/
      res.redirect('/');
    }
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
