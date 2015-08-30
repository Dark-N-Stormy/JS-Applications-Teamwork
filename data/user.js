var fs = require('fs');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var sha1 = require('sha1');
var User = mongoose.model('users');

var data = {
    getUser: function (userData) {
        var promise = new Promise(function (resolve, reject) {

        });

        return promise;
    },
    saveUser: function (userData) {

    },
    getUserById: function (id) {

    },
    getAllUsers: function () {
        var promise = new Promise(function (resolve, reject) {
            var allUsers = User.find({}).sort({active: -1,username: 1});

            resolve(allUsers);
        });

        return promise;
    }
};


module.exports = data;
