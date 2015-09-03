function router(onlineUsers) {
    var express = require('express');

    var passport = require('passport');
    var User = require('../models/models');
    var router = express.Router();
    var userData = require('../data/user');
    var messageData = require('../data/message');
    var app = require('../app.js');

    router.get('/', function (req, res) {
        userData.getAllUsers()
            .then(function (allUsers) {
                allUsers = allUsers.map(function (singleUser) {
                    return {
                        id: singleUser._id,
                        username: singleUser.username,
                        avatar: singleUser.avatar,
                        active: singleUser.active
                    }
                });


                res.render('index', {title: 'TSN', users: allUsers, user: req.user});
            });
    });

    router.get('/register', function (req, res) {
        res.render('register', {});
    });

    router.post('/register', function (req, res) {
        var userDetails = {
            username: req.body.username,
            avatar: '/images/default-avatar.jpg',
            active: true,
            dateOfRegistration: Date.now()
        };

        User.register(new User(userDetails), req.body.password, function (err, account) {
            if (err) {
                return res.render('register', {
                    error: true,
                    errorMessage: 'Sorry. That username already exists. Try again.'
                });
            }

            passport.authenticate('local')(req, res, function () {
                res.redirect('/');
            });
        });
    });

    router.get('/login', function (req, res) {
        res.render('login', {user: req.user});
    });

    router.post('/login', passport.authenticate('local'), function (req, res) {
        res.redirect('/');
    });

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/ping', function (req, res) {
        res.status(200).send("pong!");
    });

    router.get('/from/:id', function (req, res) {
        var idFrom = req.params.id;
        messageData.getMessagesFromUser(idFrom)
            .then(function (messages) {
                res.json(messages);
            });

    });

    router.get('/from/:id', function (req, res) {
        var idFrom = req.params.id;
        messageData.getMessagesFromUser(idFrom)
            .then(function (messages) {
                res.json(messages);
            });
    });

    router.get('/to/:id', function (req, res) {
        var idTo = req.params.id;
        messageData.getMessagesToUser(idTo, 5)
            .then(function (messages) {
                res.json(messages);
            });

    });

    router.get('/unread/:id', function (req, res) {
        var id = req.params.id;
        messageData.getUnreadMessages(id)
            .then(function (messages) {
                res.json(messages);
            })
    });

    return router;
}

module.exports = router;

