import mongoose from "mongoose";

const dbconnection = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "Portfolio",
    })
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((error) => {
        console.error(`Database connection failed: ${error}`);
    });
};

export default dbconnection;
