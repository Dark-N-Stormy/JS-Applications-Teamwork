var fs = require('fs');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var sha1 = require('sha1');

var data = {
    connect: function (connectionString) {
        mongoose.connect(connectionString);
        console.log('Connected to database');
    }
};

module.exports = data;