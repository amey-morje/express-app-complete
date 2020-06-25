var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    admin:{
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose)

var User = mongoose.model('User', User)

module.exports = User;