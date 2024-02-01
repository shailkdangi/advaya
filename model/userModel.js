const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    mob_number: {
        type: Number,
        required: true,
        unique: true
    },
    mobile_otp: {
        type: Number
    },
    access_token: {
        type: String
    },
    fullname: {
        type: String
    },
    license_num: {
        type: Number
    },
    upload_license: {
        type: String
    },
    language: {
        type: String
    }
}, { timestamps: true });


const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
module.exports = mongoose.model('User', userSchema)
 