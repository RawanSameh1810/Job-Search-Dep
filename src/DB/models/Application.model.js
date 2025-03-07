import mongoose from 'mongoose';
import { status } from '../../constants/models.Constants.js';
const ApplicationSchema = new mongoose.Schema({
    JobId :{
        type : mongoose.Schema.Types.ObjectId ,
        ref: "JobOpportunity",
        required: [true, "Job ID is required"]
    } ,
    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    } ,
    userCv:{
        secure_url : String,
        public_id : String
    }, 
    status : {
        type : String ,
        default : status.Pending ,
        enum : Object.values(status)
    }
} , {timestamps : true }) 
//==============================Virtuals========================
ApplicationSchema.virtual('userData', {
    ref: 'User',
    localField: 'userId', 
    foreignField: '_id', 
    justOne: true, 
});
ApplicationSchema.set('toObject', { virtuals: true });
ApplicationSchema.set('toJSON', { virtuals: true });
export const ApplicationModel = mongoose.models.Application || mongoose.model( 'Application' , ApplicationSchema )

  