const jwt = require('jsonwebtoken');
const userModel = require('../model/homeModel');

const homepage = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch videos and chapters concurrently
        const [videos, chapters] = await Promise.all([
            Videos.find(), // Assuming Video is your Mongoose model for videos
            Chapters.find() // Assuming Chapter is your Mongoose model for chapters
        ]);

        // Assuming 'videos' and 'chapters' are arrays containing the fetched video and chapter data
        console.log("Videos fetched successfully:", videos);
        console.log("Chapters fetched successfully:", chapters);

        res.status(200).json({ userId, videos, chapters }); // Sending userId, videos, and chapters in the response
    } catch (error) {
        console.error("Error fetching videos and chapters:", error);
        res.status(500).send("Internal Server Error");
    }
};
module.exports = {
    homepage
};
