var fs = require('fs');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var sha1 = require('sha1');
var User = mongoose.model('users');

function data(onlineUsers) {
    var onlineUsers =[];

    return {
        getUser: function (userData) {
            var promise = new Promise(function (resolve, reject) {

            });

            return promise;
        },
        getAllUsers: function () {
            var promise = new Promise(function (resolve, reject) {
                var allUsers = User.find({}).sort({username: 1});

                resolve(allUsers);
            });

            promise.then(function(allUsers) {
                var currentOnlineUsers = onlineUsers.map(function(user){
                    return user.id;
                });

                for (var i = 0; i < allUsers.length; i++) {
                    if(currentOnlineUsers.indexOf(allUsers[i].id)>=0){
                        allUsers[i].active = true;
                    } else {
                        allUsers[i].active = false;
                    }
                }
            });

            return promise;
        },
        changeAvatar: function(id, url){
            var promise = new Promise(function(resolve, reject){
                var update = User.update({_id:mongoose.Types.ObjectId(id)},{avatar:url});
                resolve(update);
            });

            return promise;
        },
        passOnlineUsers: function(users){
            onlineUsers = users;
        }
    };
}


module.exports = data();
