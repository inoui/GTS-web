process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  smtpTransport = require("nodemailer-smtp-transport"),
  Article = mongoose.model('Article'),
  User = mongoose.model('User'),
  ejs = require('ejs'),
  _ = require('lodash'),
  fs = require('fs');

var smtpTransport = nodemailer.createTransport(smtpTransport({
    host : "smtp.forestwines.com",
    secureConnection : false,
    auth : {
        user : "ali@forestwines.com",
        pass : "ma123lika"
    }
}));

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  var userId = req.query.id;
  var userData;
  if(userId !== undefined){
    console.log("user _id is: "+userId);
    User.findById(userId, function (err, user) {
    //   if (err) return err;
        if (user) {
            console.log(user);
            res.render('index', {
              title: 'Jeux-concours - Le grand tour de Suisse',
              email: user.email,
              id : user.id
            });
        } else {
            res.render('index', {
              title: 'Jeux-concours - Le grand tour de Suisse',
              email: '',
              id : null
            });

        }
    });
} else {
    res.render('index', {
      title: 'Jeux-concours - Le grand tour de Suisse',
      email: '',
      id : null
    });

}

});

router.post('/merci', function (req, res, next) {
  console.log(req.body);
  var userId = req.body.id;
  console.log(userId);
  if(userId && userId !== ''){
      console.log("userId");
      User.findById(userId, function (err, usr){
          console.log(usr);

          var updated = _.merge(usr, req.body);
          updated.save(function(err, user) {
              res.render('thankyou', {
                title: 'Jeux-concours - Le grand tour de Suisse',
                user:user
              });
          });
      });
  } else {
      console.log("PASuserId");
      User.create(req.body, function(err, user) {
          console.log(err);
          console.log(user);
          res.render('thankyou', {
            title: 'Jeux-concours - Le grand tour de Suisse',
            user:user
          });

      });
  }


});

router.post('/email', function (req, res, next) {
  var user = new User({
        email: req.body.user.email,
        newsletter: req.body.user.newsletter
    });
    user.save()
    .then(
      (newuser) =>{
       return sendEmailer(newuser)
      },
      (err) => {
          res.send(500, err.message);
      }
    ).then(
        (newuser) => {
            res.json({
                user: newuser,
                message: 'Success'
            })
        },
        (err) => {
            res.send(500, err.message);
        }
    )
});

function sendEmailer(user) {
  var compiled = ejs.compile(fs.readFileSync(__dirname + '/../views/emailer/emailer.ejs', 'utf8'));
  var html = compiled({ _id : user._id, email : user.email });

  return new Promise((res, rej) => {
    var mailOptions={
          from : "ali@forestwines.com",
          to : user.email,
          subject : "Your Subject",
          text : "Merci!",
          html : html
      }
      console.log(mailOptions);
      smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
              console.log(error);
              res("error: " + error);
          }else{
              console.log(response.response.toString());
              console.log("Message sent: " + response.message);
              res(user);
          }
      });
  })

}
