import { required } from 'joi';
import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  senderId : {
    type : mongoose.Schema.Types.ObjectId ,
    ref: "User",
    required : [true , "*required" ]
  } ,
  recievedId : {
    type : mongoose.Schema.Types.ObjectId ,
    ref: "User",
    required : [true , "*required" ]
  },
  messages : [
    { 
    message: {
      type: String,
      required : [true , "*required" ]},
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"]
  }}]
} , {timestamps : true }) 
export const ChatModel = mongoose.models.Chat || mongoose.model( 'Chat' , ChatSchema )

  