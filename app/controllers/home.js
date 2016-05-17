process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  smtpTransport = require("nodemailer-smtp-transport"),
  Article = mongoose.model('Article'),
  User = mongoose.model('User'),
  ejs = require('ejs'),
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
  var userId = req.query._id;
  var userData;
  if(userId !== undefined){
    console.log("user _id is: "+userId);
    User.findById(userId, function (err, user) {
      if (err) return err;
      Article.find(function (err, articles) {
        if (err) return next(err);
        res.render('index', {
          title: 'Jeux-concours - Le grand tour de Suisse',
          email: user.email,
          _id : user._id,
          articles: articles
        });
      });
    });
  }else{
      Article.find(function (err, articles) {
        if (err) return next(err);
          res.render('index', {
          title: 'Jeux-concours - Le grand tour de Suisse',
          email: '',
          _id : '',
          articles: articles
        });
      });
  }

});

router.post('/merci', function (req, res, next) {
  console.log(req.body);
  if(req.body._id !==''){
    User.findById(req.body.user._id, function (err, doc){
      var user = new User(req.body);
      if (err) { return err; }
      user.save()
        .then(
        (newuser) =>{
          res.send(Article.find(function (err, articles) {
            if (err) return next(err);
              res.render('thankyou', {
              prenom: newuser.prenom,
              articles: articles
            });
          }));
        },
        (err) => {
            res.send(500, err.message);
        }
      )
    });
  }else{
    delete req.body._id;
      var user = new User(req.body);
      if (err) { return err; }
      user.save()
        .then(
        (newuser) =>{
          res.send(Article.find(function (err, articles) {
            if (err) return next(err);
              res.render('thankyou', {
              prenom: newuser.prenom,
              articles: articles
            });
          }));
        },
        (err) => {
            res.send(500, err.message);
        }
      )
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