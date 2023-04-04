const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        mongoose
        .connect(process.env.DB_MONGO_URI).then(() => {console.log("connected successfully")});
    } catch (error) {
        console.log("Not Connected");
    }
} 
export default connectDB;