process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var express = require('express'),
  router = express.Router(),
  config = require('../../config/config'),
  mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  smtpTransport = require("nodemailer-smtp-transport"),
  Article = mongoose.model('Article'),
  User = mongoose.model('User'),
  ejs = require('ejs'),
  _ = require('lodash'),
  fs = require('fs'),
  transporter = nodemailer.createTransport();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res, next) {
    var userId = req.query.id;
    var userData;
    if (userId !== undefined) {
        User.findById(userId, function (err, user) {
            //   if (err) return err;
            if (user) {
                res.render('index', {
                    title: 'Jeux-concours - Le grand tour de Suisse',
                    email: user.email,
                    id: user.id
                });
            } else {
                res.render('index', {
                    title: 'Jeux-concours - Le grand tour de Suisse',
                    email: '',
                    id: null
                });

            }
        });
    } else {
        res.render('index', {
            title: 'Jeux-concours - Le grand tour de Suisse',
            email: '',
            id: null
        });

    }

});

router.get('/reglement', function (req, res, next) {
    res.render('terms-conditions', {
        title: 'Reglements - Jeux-concours - Le grand tour de Suisse'
    });
});

router.post('/merci', function (req, res, next) {
    
    var userId = req.body.id;
    if (userId && userId !== '') {
        User.findById(userId, function (err, usr) {
            var updated = _.merge(usr, req.body);
            updated.save(function (err, user) {
                res.render('thankyou', {
                    title: 'Jeux-concours - Le grand tour de Suisse',
                    user: user
                });
            });
        });
    } else {
        User.create(req.body, function (err, user) {
            res.render('thankyou', {
                title: 'Jeux-concours - Le grand tour de Suisse',
                user: user
            });
        });
    }
});

router.post('/email', function (req, res, next) {

    var user = new User({
        email: req.body.email,
        newsletter: req.body.newsletter ? 1 : 0
    });
    user.save(function (err, usr) {
        sendEmailer(usr, req);
        return res.status(200).json(user);
    });
});

function sendEmailer(user, req) {
    var fullUrl = config.app.url;
    var compiled = ejs.compile(fs.readFileSync(__dirname + '/../views/emailer/emailer.ejs', 'utf8'));
    var html = compiled({ _id: user._id, email: user.email, url: fullUrl });
    var mailOptions = {
        from: "Grand Tour de Suisse <contact@grandtour.byzance.world>",
        to: user.email,
        subject: "Jeux-concours - Le grand tour de Suisse",
        text: "Merci!",
        html: html
    }
    transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log(response.response.toString());
            console.log("Message sent: " + response.message);
        }
    });
    transporter.close();
}
