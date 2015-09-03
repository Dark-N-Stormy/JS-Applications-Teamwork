var mongoose=require('mongoose'),
    Schema= mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username:String,
    avatar:String,
    active:Boolean,
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

UserSchema.plugin(passportLocalMongoose);

mongoose.model('messages',MessageSchema);
module.exports = mongoose.model('users',UserSchema);


