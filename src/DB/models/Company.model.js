import mongoose from 'mongoose';
const CompanySchema = new mongoose.Schema({
    companyName :{
        type : String ,
        required : [true , "*required" ] ,
        unique : [true , "this Name is already taken"]
    } ,
    description :{
        type : String ,
        required : true 
    } ,
    industry : {
        type : String ,
        required : [true , "*required" ]
    },
    NumberOfEmployees: {
         type : Number,
         min :[11 , "Employees number must be in range 11-20 employee"] 
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId, ref: "User", 
        required : [true , "*required" ]
    },
    logo : {
        secure_url : String,
        public_id : String
    } , 
    coverPic :[{
        secure_url : String,
        public_id : String
    }],
    legalAttachment:[{
        secure_url : String,
        public_id : String
    }],
    HRs:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    companyEmail :{
        type : String,
        unique : [true , "this Email is already taken"]
    },
    approvedByAdmin : {
        type : Boolean ,
        default : false
    }
    ,deletedAt : Date 
    ,bannedAt : Date
} , {timestamps : true }) 
export const CompanyModel = mongoose.models.Company || mongoose.model( 'Company' , CompanySchema )

