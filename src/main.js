import express from "express"
import { database_connection } from "./DB/connection.js"
import {config} from "dotenv"
import RouterHandler from "../Utils/Router-Handler.utils.js"
import cors from "cors"
import "./CRON/Otp.cron-job.js";
config()
const whitelist = [process.env.CORS_FE , undefined] // undefined for Post man (testing)
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
export const bootstrap = () =>{
    const app = express()
    app.use(express.json())
    app.use(cors(corsOptions))
    database_connection()
    RouterHandler(app ,express)
    app.listen(process.env.PORT , () =>{
              console.log("SERVER IS RUNNING ON PORT" , process.env.PORT);
    })
}
