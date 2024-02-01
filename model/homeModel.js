const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    Videos:{
        type: String,
    },
    Chapters:{
        type: String,
    }
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
module.exports = mongoose.model('User', userSchema)
 