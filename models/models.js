var mongoose=require('mongoose'),
    Schema= mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username:String,
    avatar:String,
    dateOfRegistration:Date,
    additional:Schema.Types.Mixed
});

var MessageSchema = new Schema({
    sender: Schema.Types.ObjectId,
    receiver: Schema.Types.ObjectId,
    dateTime: Date,
    message: String,
    seen: Boolean
});

var PostsSchema = new Schema({
    senderId: Schema.Types.ObjectId,
    sender: String,
    senderImage: String,
    dateTime: Date,
    message: String
});

UserSchema.plugin(passportLocalMongoose);

mongoose.model('messages',MessageSchema);
mongoose.model('posts',PostsSchema);
module.exports = mongoose.model('users',UserSchema);


