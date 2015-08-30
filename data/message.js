var fs = require('fs');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var User = mongoose.model('users');
var Message = mongoose.model('messages');

var data = {
    saveMessage: function(messageData){
        console.log('will save message ',messageData);
        var promise = new Promise(function (resolve, reject) {
            var message = new Message({
                sender: mongoose.Types.ObjectId(messageData.sender),
                receiver: mongoose.Types.ObjectId(messageData.receiver),
                dateTime: Date.now(),
                message: messageData.message
            });

            console.log('saving ',message);
            message.save(function(err, dbData) {
               if(err) {
                   console.log('err',err);
                   err.text ='Database error';
                   reject(err);
                   return;
               }

                console.log('resolve',dbData);
                resolve(dbData);
            });
        });

        return promise;
    },
    getMessage: function (messageId) {
        var promise = new Promise(function (resolve, reject) {
            resolve(Message.findOne({_id:messageId}));
        });

        return promise;
    },
    getMessagesToUser: function(userId) {
        var promise = new Promise(function (resolve, reject) {
            resolve(Message.find({receiver:userId}));
        });

        return promise;
    },
    getMessagesFromUser: function(userId) {
        var promise = new Promise(function (resolve, reject) {
            Message.find({sender:mongoose.Types.ObjectId(userId)},function(err,messages){
                if(err){
                    reject(err);
                    return;
                }

                resolve(messages);
            });
        });

        return promise;
    },
    getMessagesToUser: function(userId) {
        var promise = new Promise(function (resolve, reject) {
            Message.find({receiver:mongoose.Types.ObjectId(userId)},function(err,messages){
                if(err){
                    reject(err);
                    return;
                }

                resolve(messages);
            });
        });

        return promise;
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