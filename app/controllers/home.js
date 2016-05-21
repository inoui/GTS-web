process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var express = require('express'),
  router = express.Router(),
  config = require('../../config/config'),
  mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  smtpTransport = require("nodemailer-smtp-transport"),
  Winner = mongoose.model('Winner'),
  User = mongoose.model('User'),
  ejs = require('ejs'),
  _ = require('lodash'),
  fs = require('fs'),
  key = 'cest la suisse et ca doit etre loonnngggg',
  encryptor = require('simple-encryptor')(key),
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
                    title: 'Jeu-concours - Le Grand Tour de Suisse',
                    email: user.email,
                    id: user.id
                });
            } else {
                res.render('index', {
                    title: 'Jeu-concours - Le Grand Tour de Suisse',
                    email: '',
                    id: null
                });

            }
        });
    } else {
        res.render('index', {
            title: 'Jeu-concours - Le Grand Tour de Suisse',
            email: '',
            id: null
        });

    }

});

router.get('/reglement', function (req, res, next) {
    res.render('terms-conditions', {
        title: 'Reglements - Jeu-concours - Le Grand Tour de Suisse'
    });
});

router.post('/merci', function (req, res, next) {

    var userId = req.body.id;
    if (userId && userId !== '') {
        User.findById(userId, function (err, usr) {
            var updated = _.merge(usr, req.body);
            updated.save(function (err, user) {
                res.render('thankyou', {
                    title: 'Jeu-concours - Le Grand Tour de Suisse',
                    user: user
                });
            });
        });
    } else {
        User.create(req.body, function (err, user) {
            res.render('thankyou', {
                title: 'Jeu-concours - Le Grand Tour de Suisse',
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



router.get('/qr', function (req, res, next) {
    var qr = req.query.qr;
    qr = require('querystring').unescape(qr);
    var obj = encryptor.decrypt(qr);
    console.log(obj);
    Winner.find(obj, function (err, win) {

        if (!win.length) {
            Winner.create(obj, function() {
                res.render('winner', {
                    winner:true,
                    title:"QR VERIFICATION"
                });
            });
        } else {
            res.render('winner', {
                winner:false,
                title:"QR VERIFICATION"
            });

        }
    })
});







function sendEmailer(user, req) {
    var fullUrl = config.app.url;
    var compiled = ejs.compile(fs.readFileSync(__dirname + '/../views/emailer/emailer.ejs', 'utf8'));
    var html = compiled({ _id: user._id, email: user.email, url: fullUrl });
    var mailOptions = {
        from: "Grand Tour de Suisse <concours@grandtourdesuisse.fr>",
        to: user.email,
        subject: "Jeu-concours - Le Grand Tour de Suisse",
        text: "Merci!",
        html: html
    }
    transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
        }
    });
    transporter.close();
}
