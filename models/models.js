var mongoose=require('mongoose'),
    Schema= mongoose.Schema;

var UserSchema=new Schema({
    id:Number,
    username:String,
    pass:String,
    token:String
});

mongoose.model('users',UserSchema);


