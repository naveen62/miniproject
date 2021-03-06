const mongoose = require("mongoose");
const validator = require('validator');
const jwt = require("jsonwebtoken");

const {encrypt, decrypt} = require('../utils/utils');


 const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Email is not valid");
            }
        }
    },
    password: {
        type:Object,
        required:true,
        // validate(str) {
        //     if(checkstrIncludes('password', str)) {
        //         throw new Error('Password must not contain password');
        //     }
        // }
    },
    joinedcommunity:[{
        type:String
    }],
    avatar: {
        type:Buffer
    },
    avatarthr: {
        type:Boolean,
        default:false
    },
    tokens:[{
        token: {
            type:String,
            required:true
        }
    }]
})
userSchema.pre('save', async function(next) {
    const user = this;

    if(user.isModified('password')) {
        user.password = await encrypt(user.password);
    }
    next();
})
userSchema.methods.toJSON = function() {
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;

    return userObj;
}
userSchema.methods.genAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id:user._id.toString()}, 'miniproject');
    user.tokens.push({token});
    await user.save();

    return token
}

userSchema.statics.findByCreadentials = async (email, password) => {
    const user = await User.findOne({email});
    if(!user) {
        throw new Error('User not login');
    }
    const isMatch = decrypt(user.password, password);
    
    if(!isMatch) {
        
        throw new Error('password incorrect');
    }
    return user;
}

const User = mongoose.model('User',userSchema);


module.exports = User;