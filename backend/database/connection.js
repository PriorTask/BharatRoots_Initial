import mongoose from "mongoose";

export const connection =()=>{
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "bharatRoots"
    }).then(()=>{
        console.log("Connected to Database")
    }).catch(err=>{
        console.log(`error occurred while connecting to Database: ${err}`)
    })
}