function router(onlineUsers) {
    var express = require('express');

    var passport = require('passport');
    var User = require('../models/models');
    var router = express.Router();
    var userData = require('../data/user');
    var postData = require('../data/posts');
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

                postData.getPosts(10,0)
                    .then(function(posts){
                        posts = posts.map(function(post){
                            post.dateTime = /*new Date(post.dateTime);*/
                                    'asd';

                            return post;
                        });

                        res.render('index',
                            {
                                title: 'TSN',
                                users: allUsers,
                                user: req.user,
                                posts: posts
                            });
                    });
            });
    });

    router.post('/register', function (req, res) {
        console.log(req.body);
        var username = req.body.username.toLowerCase(),
            password = req.body.password,
            userDetails = {
                username: username,
                avatar: '/images/default-avatar.jpg',
                dateOfRegistration: Date.now()
            };

        if(!/^[A-z0-9-]+$/.test(username)){
            return res.json({
                error:true,
                errorMessage:'Username must contain only letters, digits and dashes and must start with a letter'
            });
        } else if(username.length < 5) {
            return res.json({
                error:true,
                errorMessage:'Username must be at least 5 symbols'
            });
        }  else if(password.length < 6) {
            return res.json({
                error:true,
                errorMessage:'Password must be at least 6 symbols'
            });
        }

        User.register(new User(userDetails), password, function (err, account) {
            if (err) {
                return res.json({
                    error: true,
                    errorMessage: 'Sorry. That username already exists'
                });
            }

            passport.authenticate('local')(req, res, function () {
                return res.json({
                    error: false,
                    success: true
                });
            });
        });
    });

    router.post('/login', function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) return next(err);
            if (!user) {
                return res.json({
                    error: true,
                    errorMessage: 'Login failed, please check your credentials and try again',
                    success: false
                });
            }

            req.login(user, function (err) {
                if (err) return next(err);
                return res.json({
                    err: false,
                    success: true
                });
            });
        })(req, res, next);
    });

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/ping', function (req, res) {
        res.status(200).send("pong!");
    });

    // router.get('/from/:id', function (req, res) {
    //     var idFrom = req.params.id;
    //     messageData.getMessagesFromUser(idFrom)
    //         .then(function (messages) {
    //             res.json(messages);
    //         });

    // });

    // router.get('/from/:id', function (req, res) {
    //     var idFrom = req.params.id;
    //     messageData.getMessagesFromUser(idFrom)
    //         .then(function (messages) {
    //             res.json(messages);
    //         });
    // });

    // router.get('/to/:id', function (req, res) {
    //     var idTo = req.params.id;
    //     messageData.getMessagesToUser(idTo, 5)
    //         .then(function (messages) {
    //             res.json(messages);
    //         });

    // });

    // router.get('/unread/:id', function (req, res) {
    //     var id = req.params.id;
    //     messageData.getUnreadMessages(id)
    //         .then(function (messages) {
    //             res.json(messages);
    //         })
    // });

    return router;
}

module.exports = router;

