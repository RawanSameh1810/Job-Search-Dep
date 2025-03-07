import mongoose from 'mongoose';
import { ApplicationModel } from './Application.model.js';
const JobOpportunitySchema = new mongoose.Schema({
    jobTitle :{
        type : String ,
        required : [true , "*required" ] 
    } ,
    jobLocation :{
        type : String ,
        enum : ["onsite", "remotely", "hybrid"]
    } ,
    workingTime: {
        type : String ,
        enum: ["part-time", "full-time"],
        required: [true, "Working time is required"]
    },
    seniorityLevel : {
        type: String,
        enum: ["fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"],
        required: [true, "Seniority level is required"]
    },
    jobDescription:{
      type : String
    },
    technicalSkills: [String], 
    softSkills: [String],
    addedBy : { 
       type : mongoose.Schema.Types.ObjectId,
       ref: "User" ,
       required : [true , "*required" ]},
    updatedBy :  {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User" },
    companyId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    closed : {
        type : Boolean ,
        default : false
    }
} , {timestamps : true }) 
//===========================DeleteHook===============================
JobOpportunitySchema.pre('remove', async function(next) {
    try {
        await ApplicationModel.deleteMany({ JobId: this._id });
        next();
    } catch (error) {
        next(error); 
    }
});

export const JobOpportunityModel = mongoose.models.JobOpportunity || mongoose.model( 'JobOpportunity' , JobOpportunitySchema )

  