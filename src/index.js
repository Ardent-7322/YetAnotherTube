//require(`dotenv`).config({path: `./env`})

import dotenv from "dotenv";
import connectDB from "./DB/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
    app.on("error", (error) => {
      console.log("App is not listning", error);
      throw error;
    });
  })

.catch((err) => {
    console.log("MongoDB connection failed", err);
  });

//Whenever try to connect Dabatabse always wrap them in try n catch or in Promises (error comes freqenntly ) and use async await (db always takes time to establish connection)

/* Approch 1
import express from "express"
const app = express()

(async() =>{
    try{
        await mongoose.connect (`${process.env.MONGOBD_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("App is not listning" ,error);
            throw error
        })

        app.listen(process.env.PORT ,()=>{
            console.log(`Server is running on port 
                 ${process.env.PORT}`);

        })
    }catch (error){
        console.log("Error while connecting to database", error)
        throw err
    }
})()
*/
