var fs = require('fs');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var User = mongoose.model('users');
var Message = mongoose.model('messages');

var data = {
    saveMessage: function (messageData) {
        var regex = /<[^>]*>/ig;
        messageData.message = messageData.message.replace(regex,'');

        var promise = new Promise(function (resolve, reject) {
            var message = new Message({
                sender: mongoose.Types.ObjectId(messageData.sender),
                receiver: mongoose.Types.ObjectId(messageData.receiver),
                dateTime: Date.now(),
                message: messageData.message,
                seen: false
            });

            message.save(function (err, dbData) {
                if (err) {
                    err.text = 'Database error';
                    reject(err);
                    return;
                }

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
        var that = this;
        var messagesToReturn = [];

        var promise = new Promise(function (resolve, reject) {
            Message.aggregate([
                {$match:{receiver:mongoose.Types.ObjectId(userId) ,seen:false }},
                {$group:{
                    _id: '$sender',
                    count:{$sum:1}
                }}
            ]).exec()
                .then(function(messages){
                    if(messages.length<1){
                        resolve(messages);
                    } else {
                        console.log('w/ msg',messages);
                        resolve(that.getConversations(messages.slice(), userId, messagesToReturn)
                            .then(function(conversations){
                                //return conversations;
                                return that.addMessagesToUsersObject(messages,conversations);
                            }));
                    }
                });
        });

        return promise;
    }, getConversations: function(messages, userId, messagesToReturn){
        var that = this;
        var promise = new Promise(function(resolve, reject) {

            for (var i = 0; i < messages.length; i += 1) {
                var singleMessageGroup = JSON.parse(JSON.stringify(messages[i]));
                that.getConversation(userId, singleMessageGroup._id, singleMessageGroup.count + 10)
                    .then(function (conversation) {
                        //singleMessageGroup.messages = conversation;
                        messagesToReturn.push(conversation);
                        //messagesToReturn.push(conversation);
                        console.log('curr iter',messagesToReturn);
                        if (messagesToReturn.length === messages.length) {
                            resolve(messagesToReturn.slice(0));
                        }
                    }, function (err) {
                        console.log(err);
                        reject(err);
                    });
            }
        });

        return promise;
    },
    getConversation: function(receiver, sender, count, offset){
        var promise = new Promise(function(resolve, reject){
            receiver = mongoose.Types.ObjectId(receiver);
            sender = mongoose.Types.ObjectId(sender);
            //console.log('OFFSET', offset);
            Message.find({
                $or:[{receiver:sender,sender:receiver},
                    {sender:sender,receiver:receiver}]
            },{_id:0, __v:0})
                .sort({dateTime:-1})
                .skip(offset)
                .limit(count)
                .exec(function(err, messages){
                    if(err) {
                        console.log(err);
                        reject(err);
                    }

                    resolve((function(){
                        console.log({
                            id:sender,
                            messages:messages.reverse().slice(0)
                    });
                        return {
                        id:sender,
                        messages:messages.reverse().slice(0)
                        }
                    }()));
                });
        });

        return promise;
    },
    addMessagesToUsersObject: function(messageObject, conversation){
        for(var i=0;i<messageObject.length;i+=1){
            for (var j = 0; j < conversation.length; j++) {

                if(messageObject[i]._id.toString() === conversation[j].id.toString()){
                    messageObject[i].messages = conversation[j].messages;
                }
            }
        }

        return messageObject;
    },
    getMessages: function(data){
        var that = this;
        var promise = new Promise(function(resolve, reject){
            var receiver = mongoose.Types.ObjectId(data.myId),
                sender = mongoose.Types.ObjectId(data.id),
                count = data.count,
                offset = data.offset;
            that.getConversation(receiver,sender,count,offset)
                .then(function(messages){
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
                receiver:mongoose.Types.ObjectId(receiver),
                sender:mongoose.Types.ObjectId(sender),
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