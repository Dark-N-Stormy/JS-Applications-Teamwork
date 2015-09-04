var fs = require('fs');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var User = mongoose.model('users');
var Posts = mongoose.model('posts');

var data = {
    getPosts: function(count, offset){
        var promise = new Promise(function (resolve, reject) {
            var posts = Posts.find({})
                .sort({dateTime:-1})
                .skip(offset)
                .limit(count);

            resolve(posts);
        });

        return promise;
    },
    savePost: function (post) {
        var promise = new Promise(function (resolve, reject) {
            var regex = /<[^>]*>/ig;
            console.log(post);
            post.message = post.message.replace(regex,'');
            delete post.token;

            var message = new Posts(post);
            console.log(message);
            message.save(function (err, dbData) {
                if (err) {
                    console.log(err);
                    err.text = 'Database error';
                    reject(err);
                    return;
                }

                resolve(dbData);
            });
        });

        return promise;
    }
};


module.exports = data;