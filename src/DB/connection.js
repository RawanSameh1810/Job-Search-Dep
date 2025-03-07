import mongoose from "mongoose"

export const database_connection = async() =>{
   try{ 
     const conn = await mongoose.connect(process.env.DB_HOST_CONNECTION_STRING)
     console.log("DATABASE CONNECTED !");
     }
    catch(error){
        console.log("Something went wrong with database" , error)
    }
}