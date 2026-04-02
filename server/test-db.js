require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    console.log("Testing connection to: " + process.env.MONGODB_URI?.replace(/:([^:@]+)@/, ':***@'));
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("Successfully connected to Atlas!");
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users in the database.`);
        console.log(users);
        
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}
testConnection();
