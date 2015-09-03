var fs = require('fs');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var User = mongoose.model('users');
var Message = mongoose.model('messages');

var data = {
    saveMessage: function (messageData) {
        console.log('will save message ', messageData);
        var promise = new Promise(function (resolve, reject) {
            var message = new Message({
                sender: mongoose.Types.ObjectId(messageData.sender),
                receiver: mongoose.Types.ObjectId(messageData.receiver),
                dateTime: Date.now(),
                message: messageData.message,
                seen: false
            });

            console.log('saving ', message);
            message.save(function (err, dbData) {
                if (err) {
                    console.log('err', err);
                    err.text = 'Database error';
                    reject(err);
                    return;
                }

                console.log('resolve', dbData);
                resolve(dbData);
            });
        });

        return promise;
    },
    getMessage: function (messageId) {
        var promise = new Promise(function (resolve, reject) {
            resolve(Message.findOne({_id: messageId}));
        });

        return promise;
    },
    getMessagesToUser: function (userId) {
        var promise = new Promise(function (resolve, reject) {
            resolve(Message.find({receiver: userId}));
        });

        return promise;
    },
    getMessagesFromUser: function (userId) {
        var promise = new Promise(function (resolve, reject) {
            Message.find({sender: mongoose.Types.ObjectId(userId)}, function (err, messages) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(messages);
            });
        });

        return promise;
    },
    getMessagesToUser: function (userId, limit, unseen) {
        var limit = limit || 10;
        var unseen = unseen || false;
        var query = {
            receiver: mongoose.Types.ObjectId(userId)
        };

        if (unseen) {
            query['seen'] = false
        }

        var promise = new Promise(function (resolve, reject) {
            Message.find(query)
                .sort({dateTime: -1})
                .limit(limit)
                .exec(function (err, messages) {
                    if (err) {
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
            var allUsers = User.find({}).sort({active: -1, username: 1});

            resolve(allUsers);
        });

        return promise;
    },
    getUnreadMessages: function(userId){
        var promise = new Promise(function (resolve, reject) {
            Message.aggregate([
                {$match:{receiver:mongoose.Types.ObjectId(userId) ,seen:false}},
                {$group:{
                    _id: '$sender',
                    count:{$sum:1},
                    messages:{$push:'$message'}
                }},
                {$sort: {dateTime:-1}}
            ], function(err,messages){
                if(err){
                    reject(err);
                }
                resolve(messages);
            });
        });

        return promise;
    },
    seenAll: function(data){
        var sender = data.partnerId,
            receiver = data.userId;

        var promise = new Promise(function (resolve, reject) {
            Message.update({
                receiver:receiver,
                sender:sender,
                seen:false
            }, {
                seen:true
            }, {
                multi:true
            }, function(err, res){
                if(err){
                    reject(err)
                    return;
                }

                return res;
            });
        });

        return promise;
    },
    custom: function(){
        var promise = new Promise(function (resolve, reject) {
            Message.aggregate([
                {$match:{seen:false}},
                {$group:{
                    _id: '$receiver',
                    count:{$sum:1}
                }}
            ], function(err,messages){
                if(err){
                    reject(err);
                }
                resolve(messages);
            });
            //Message.find({},{},{'group':'sender'},function(err,messages){
            //    if(err){
            //        reject(err);
            //    }
            //    resolve(messages);
            //});
        });

        return promise;
    }
};


module.exports = data;