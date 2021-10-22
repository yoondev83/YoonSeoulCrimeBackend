const mongoose              =   require("mongoose");
const passportLocalMongoose =   require("passport-local-mongoose");
const userSchema            =   mongoose.Schema({
    userId:{
        type: String,
        maxlength: 20,
        unique: true,
        required: true,
    },
    email:{
        type: String,
        trim: true,
        index: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 5,
        required: true,
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String,
    },
    tokenExp: {
        type: Number,
    },
});
userSchema.plugin(passportLocalMongoose);
const User      =   mongoose.model("User", userSchema);

module.exports  =   {User};