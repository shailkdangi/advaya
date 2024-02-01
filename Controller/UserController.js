const jwt = require('jsonwebtoken');
const multer = require('multer');
const userModel = require('../model/userModel');
const fs = require('fs');
const path = require('path');
const util = require('util');

const hello = (req, res) => { 
    console.log("Reached hello controller");
    res.send("Hello from the controller!");
};

const addPhone = async (req, res) => {
    console.log("Received data:", req.body);
 
    const { role, phone } = req.body;
    const otp = generateOTP();
 
    try {
        const existingUser =  await userModel.findOne({ mob_number: phone });

        if (existingUser) {
            // Mobile number already exists, update the OTP
            await userModel.updateOne({ mob_number: phone }, { mobile_otp: otp });
            res.status(200).json({ message: "Mobile number exists, OTP updated successfully!", otp });
        } else {
            // Mobile number doesn't exist, insert new record
            await userModel.create({ role, mob_number: phone, mobile_otp: otp });
            res.status(200).json({ message: "Phone number and role added successfully!", otp });
        }
    } catch (error) {
        console.error("Error in addPhone:", error);
        res.status(500).send("Internal Server Error");
    }
};

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const verifyOtp = async (req, res) => {
    console.log("Received data:", req.body);

    const { phone, otp } = req.body;

    try {
        const user = await userModel.findOne({ mob_number: phone, mobile_otp: otp });

        if (user) {
            console.log("OTP verified successfully!");

            const accessToken = jwt.sign({ userId: user._id }, process.env.JWT);
            await userModel.updateOne({ _id: user.userId }, { access_token: accessToken });

            console.log("Access token generated and stored successfully!");
            res.status(200).json({ accessToken });
        } else {
            console.log("Invalid OTP!");
            res.status(400).send("Invalid OTP");
        }
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).send("Internal Server Error");
    }
};

const upload = multer({storage: multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user.userId;
        const userUploadPath = path.join('public/license_upload', userId.toString());
 
        // Create the user's folder if it doesn't exist
        fs.mkdirSync(userUploadPath, { recursive: true });
 
        cb(null, userUploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
})
});

const userDetail = async (req, res) => {
    const userId = req.user.userId;
    upload.single('upload_license')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Error uploading license file:", err);
            return res.status(500).json({ error: "File upload error" });
        } else if (err) {
            console.error("Error uploading license file:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        const upload_license = req.file ? req.file.filename : null;
        const { fullname, license_num } = req.body;

        try {
           // await userModel.userDetailUpdate(userId, fullname, license_num, upload_license);
            await userModel.updateOne({ _id: userId }, { fullname, license_num, upload_license });
            console.log("Full name, license_num, upload_license added successfully!");
            res.status(200).send("User details updated successfully!");
        } catch (error) {
            console.error("Error updating user details:", error);
            res.status(500).send("Internal Server Error");
        }
    });
};

const userlanguage = async (req, res) => {
    try {
        const { language } = req.body;
        const userId = req.user.userId;

        // Update user language using Mongoose
        const updatedUser = await userModel.findByIdAndUpdate(userId, { language });

        if (updatedUser) {
            console.log("Language updated successfully!");
            res.status(200).send("Language updated successfully!");
        } else {
            console.error("User not found");
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Error updating language:", error);
        res.status(500).send("Internal Server Error");
    }
};

const profileUpdate = async (req, res) => {
    const userId = req.user.userId;

    const upload = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const folder = getFolderName(file.fieldname);
                const userUploadPath = path.join('public', folder, userId.toString());
                fs.mkdirSync(userUploadPath, { recursive: true });
                cb(null, userUploadPath);
            },
            filename: function (req, file, cb) {
                const ext = path.extname(file.originalname);
                cb(null, file.fieldname + '-' + Date.now() + ext);
            },
        }),
    });

    // Define the fields you expect to be uploaded
    const fields = [
        { name: 'upload_license', maxCount: 1 },
        { name: 'upload_aadhar', maxCount: 1 },
        { name: 'upload_profile', maxCount: 1 },
    ];

    // Use upload.fields middleware to handle multiple file fields
    upload.fields(fields)(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Error uploading files:", err);
            return res.status(500).json({ error: "File upload error" });
        } else if (err) {
            console.error("Error uploading files:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        // Access uploaded files using req.files
        const upload_license = req.files['upload_license'] ? req.files['upload_license'][0].filename : null;
        const upload_aadhar = req.files['upload_aadhar'] ? req.files['upload_aadhar'][0].filename : null;
        const upload_profile = req.files['upload_profile'] ? req.files['upload_profile'][0].filename : null;

        // Combine uploaded file names with other profile data
        const profileData = {
            fullname: req.body.fullname,
            license_num: req.body.license_num,
            upload_license,
            upload_aadhar,
            upload_profile,
        };

        try {
            // Update user profile using Mongoose
            const updatedUser = await userModel.findByIdAndUpdate(userId, profileData);

            if (updatedUser) {
                console.log("User profile updated successfully!");
                res.status(200).send("User profile updated successfully!");
            } else {
                console.error("User not found with ID:", userId);
                res.status(404).send("User not found");
            }
        } catch (error) {
            console.error("Error processing user profile update:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
};

// Helper function to determine the folder based on the field name
function getFolderName(fieldName) {
    switch (fieldName) {
        case 'upload_license':
            return 'license_upload';
        case 'upload_aadhar':
            return 'aadhar_upload';
        case 'upload_profile':
            return 'profile_upload';
        default:
            return 'other_upload';
    }
}

module.exports = {
    hello,
    addPhone,
    verifyOtp,
    userDetail,
    userlanguage,
    profileUpdate
};
