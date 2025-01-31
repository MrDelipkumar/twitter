import mongoose from "mongoose";

const connectDb = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDB Connected")
    }
    catch(error){
            console.log(`Error in connecting Db: ${error}`)
            process.exit(1)
    }
}

export default connectDb;