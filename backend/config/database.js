const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // We pull the URI from your .env file for security
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure if we can't connect to the database
    }
};

module.exports = connectDB;