import mongoose from "mongoose";

declare global {
    namespace Express {
        interface User { //this just attach the _id key to the existing Express.User default type!
            _id: mongoose.Types.ObjectId
        }
    }
}