'use strict'
<<<<<<< HEAD
const express     = require('express');
const app         = express();
const bodyParser  = require('body-parser');
const morgan      = require('morgan');
const mongoose    = require('mongoose');
const passport	= require('passport');
const config      = require('./config/database'); // get db config file
const User        = require('./app/models/user'); // get the mongoose model
const port        = process.env.PORT || 8080;
const jwt         = require('jwt-simple');
 
=======
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var jwt    = require('jsonwebtoken'); 
var config = require('./config'); 
var User   = require('./app/models/user');
var apiRoutes = express.Router();     
var port = process.env.PORT || 8080;
var swig = require('swig');
var cookieParser = require('cookie-parser');
var querystring = require('querystring')

app.use(express.static(__dirname + '/public'));
app.engine('html', swig.renderFile);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'html');



mongoose.connect(config.database); 
app.set('superSecret', config.secret); 

app.use(cookieParser())
>>>>>>> 3066045db66d7e9ff255ba45f217fc49d5b04ffd
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

<<<<<<< HEAD
app.use(passport.initialize());


app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});


mongoose.connect(config.database)

require('./config/passport')(passport);


const apiRoutes = express.Router();
 
// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});
 

apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
}); 


apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  console.log(token)
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});
 

let getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};


app.use('/api', apiRoutes);


app.listen(port);
console.log('There will be dragons: http://localhost:' + port);
=======
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.get('/login', function(req, res) {
    res.render('login')
});



apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {
  		
  		if(err) throw err;
  		if(!user) res.json({ success: false, message: 'Authentication failed. User not found.' });
   		else if(user){
   			user.checkPass(req.body.password, function(isMatch){
   				if (!isMatch) res.json({ success: false, message: 'Authentication failed. Wrong password.' });
   				else{
              //let token = jwt.sign(user, app.get('superSecret'), { expiresIn: '12h' });
              res.redirect('/api?token=' + user.token)
   				}

   			})
   				
   		}

  });
});

app.get('/setup', function(req, res) {

  // create a sample user
  var person = new User({ 
    name: 'taty', 
    password: '123',
    admin: true
    
  });

  // save the sample user
  person.save(function(err, user) {
    if (err) throw err;

       user.token =  jwt.sign(user, app.get('superSecret'), { expiresIn: '12h' });
       user.save(function(err){
           if (err) throw err;
           res.json({ success: true });
       })
      
    });
});



// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        req.decoded = decoded;    
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    /*
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });*/
	return res.redirect('/login')
    
  }
});


apiRoutes.get('/', function(req, res) {
  res.render('index', {token: req.query.token})
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   

apiRoutes.get('/users/new', function(req, res){
  console.log("ok: " + req.message.rawHeaders)
  res.render('new_user.html')
})






// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// API ROUTES -------------------
// we'll get to these in a second

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
>>>>>>> 3066045db66d7e9ff255ba45f217fc49d5b04ffd
