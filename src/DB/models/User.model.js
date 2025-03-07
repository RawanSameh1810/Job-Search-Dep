import mongoose from 'mongoose';
import { providers, System_Roles } from '../../constants/models.Constants.js';
import { hashSync } from 'bcrypt';
import { Decryption, Encryption } from '../../../Utils/Encryption.utils.js';
const UserSchema = new mongoose.Schema({
    firstname :{
        type : String ,
        trim : true ,
    } ,
    lastname :{
        type : String ,
        trim : true ,
    } ,
    email : {
        type : String ,
        required : [true , "*required" ],
        unique : [true , "this Email is already taken"]
    },
    password : {
         type : String,
         required : [true , "*required"]
    },
    phone:{
       type : String
    },
    DOB:{
      type : Date 
    },
    profilePic : {
        secure_url : String,
        public_id : String
    } , 
    coverPic :[{
        secure_url : String,
        public_id : String
    }] ,
    isDeactivated : {
        type : Boolean ,
        default :false
    },
    isEmailVerified :{
        type : Boolean,
        default : false
    },
    Provider:{
       type : String ,
       default : providers.System ,
       enum : Object.values(providers)
      },
    gender:{
        type : String ,
        default : "None",
        enum : ['Male' , 'Female' , "None"]
       }
    , otp: [
        {
          code : String ,
          type: {
            type: String,
            enum: ["confirmEmail", "forgetPassword"]
          },
          expiresIn : Date 
    }]
    ,isPublic : {
        type : Boolean ,
        default : false
    },
    role:{
        type : String ,
        default : System_Roles.user ,
        enum : Object.values(System_Roles)
       }
    ,deletedAt : Date 
    ,bannedAt : Date
} , {timestamps : true }) 
//=========================Virtuals===============================
UserSchema.virtual('UserName').
  get(function() {return `${this.firstname} ${this.lastname}`;})
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });
//============================Hooks================================
UserSchema.pre('save' , async function(){
   const Changes = this.getChanges()[`$set`]
   if(Changes.password) this.password = hashSync(this.password , +process.env.SIGNUP_SALT)
   if(Changes.phone) this.phone = await Encryption({value : this.phone , secretkey : process.env.PHONE_SECRETKEY})
})
UserSchema.post('findOne' , async function (doc) {
    if (!doc) return; 
    if(doc.phone) doc.phone = await Decryption({cipher : doc.phone , secretkey : process.env.PHONE_SECRETKEY}) 
})
export const UserModel = mongoose.models.User || mongoose.model( 'User' , UserSchema )

  