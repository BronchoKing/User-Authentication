const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter your username']
    },

    email: {
        type: String,
        required: [true, 'Please enter your email'],
        validate: [validator.isEmail, 'Please enter a valid email'],
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: 8,
        maxlength: 50
    },

    confirmpassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(val) {
                return val === this.password;
            },
            message: "Password & Confirm password does not match please"
        }
    }
});



userSchema.pre('save', async function() {
    if(!this.isModified('password')) return;    

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmpassword = undefined;
});

userSchema.methods.comparePasswordInDb = async function(pswd, pwswDb) {
    return await bcrypt.compare(pswd, pwswDb);
}

const User = mongoose.model('User', userSchema);

module.exports = User;