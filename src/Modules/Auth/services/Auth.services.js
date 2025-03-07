import {compareSync, hashSync} from "bcrypt"
import { Encryption ,Decryption} from "../../../../Utils/Encryption.utils.js";
import { UserModel } from "../../../DB/models/User.model.js";
import { emitter } from "../../../Services/send-Email.service.js";
import { tokens , Refresh_tokens} from "../../../../Utils/Tokens.js";
import{OAuth2Client} from 'google-auth-library';
import { providers } from "../../../constants/models.Constants.js";
import { v4 as uuidv4 } from 'uuid' 
import { BlackListModel } from "../../../DB/models/Black-List-tokens.model.js";
import jwt from 'jsonwebtoken'
export const SignUp = async(req , res) =>{
    const {firstname , lastname , email , password , confirmPassword , phone , DOB , gender , role , profilePicture , age , isPublic } = req.body;
    if(password !== confirmPassword) {return res.status(400).json({message : "Confirmed Password not match !"})}
    const isExist = await UserModel.findOne({email})
    if(isExist) return res.status(409).json({message : "Email is already Exists!"})
    const otp = Math.floor(Math.random() * 1000).toString()
    emitter.emit('sendEmail' , {
        to : email ,
        subject : "Verify your Email" ,
        html : `<h1> Verify your email </h1>
        <p> otp is ${otp}  MAKE YOUR ACCOUNT VERFIED 👀 </p>`
      })
    const hashOtp = hashSync(otp , +process.env.OTP_SALT)
    const user = new UserModel ({firstname ,lastname , email , password  , phone , DOB , gender , role , profilePicture , isPublic ,age})    
    user.otp.push({
            code: hashOtp,
            type: "confirmEmail",
            expiresIn: new Date(Date.now() +  10 * 60 * 1000) , 
          })
    await user.save();
    if(!user) 
        return res.status(500).json({message:"User creation failed!"})
    return res.status(201).json({message:"User is created successfully!" ,user})
}
export const VerifyEmail = async (req , res) =>{
    const {email ,Confirmotp} = req.body;
    const user = await UserModel.findOne({email})
    if (!user.email) return res.status(404).json({message : 'I can Not found you 😨 please check your credentials'})
    const otpData = user.otp.find(o => o.type === "confirmEmail");
    if (!otpData) return res.status(404).json({ message: "Your OTP is not found" });
    if (otpData.expiresIn < Date.now()) {
        await UserModel.updateOne( {email},{isEmailVerified: false, $pull: { otp: { type: "confirmEmail" }}});
        return res.status(400).json({ message: "Your OTP has expired you must regenerate another one" });
    }
    const isVerfied = compareSync(Confirmotp , otpData.code) 
    if(!isVerfied) return res.status(404).json({message : 'Your otp is invalid'})
    await UserModel.updateOne( {email},{isEmailVerified: true, $pull: { otp: { type: "confirmEmail" }}});
    res.status(200).json({message:"YOUR ACCOUNT IS VERFIED SUCCESFULLY"})
}
export const regenerateOtp = async (req , res) =>{
    const {email} = req.body 
    const user = await UserModel.findOne({email})
    if (!user)
        return res.status(404).json({message:"Email is not found"})
    const otp = Math.floor(Math.random() * 1000).toString()
    emitter.emit('sendEmail' , {
        to : email ,
        subject : "Verify your Email" ,
        html : `<h1> Verify your email </h1>
        <p> otp is ${otp} Wish you success at this try 🤗 </p>`
      })
    const hashOtp = hashSync(otp , +process.env.OTP_SALT)
    user.otp.push({
        code: hashOtp,
        type: "confirmEmail",
        expiresIn: new Date(Date.now() +  0.5 * 60 * 1000) , 
      })
await user.save();
res.status(201).json({message : "otp is regenrated successfully"})
}

export const login = async (req , res) => {
    const {email , password} = req.body;
    const user = await UserModel.findOne({email})
    if (!user) return res.status(404).json({message : "Email or password is invalid"})
    const confirmpassword = compareSync(password , user.password)
    if (!confirmpassword) return res.status(404).json({message : "Email or password is invalid"})
    if(user.bannedAt) return res.status(403).json({message : "Currently you can't access the account"})
    const accesstoken = tokens(user.id , user.email)
    const Refreshtoken = Refresh_tokens(user.id , user.email)
    return res.status(200).json({message : "User login successfully" , accesstoken , Refreshtoken})
}


export const ForgetPassword = async (req , res) => {
    const {email} = req.body;
    const user = await UserModel.findOne({email})
    if (!user)
      return res.status(404).json({message:"Email is not found"})
    const otp = Math.floor(Math.random() * 1000).toString()
    emitter.emit('sendEmail' , {
     to : email ,
     subject : "Account Recovery" ,
     html : `<h1>Reset Your Password</h1>
     <p> otp is ${otp}</p>` ,
     email:user.email ,
     })
     const HashOtp = hashSync(otp , +process.env.FORGET_SALT)
     user.otp.push({
        code: HashOtp,
        type: "forgetPassword",
        expiresIn: new Date(Date.now() +  10 * 60 * 1000) , 
      })
     await user.save();
     return res.status(200).json({message:"use the Otp that I send to reset your password "})
}

export const ResetPassword = async (req , res) => {
    const{email , otp , password ,confirmpassword } = req.body;
    if (password !== confirmpassword )
        return res.status(400).json({message: 'password and confirmpassword does not match'})
    const user = await UserModel.findOne({email})
    if (!user)
      return res.status(404).json({message:"Email is not found"})
    const otpData = user.otp.find(o => o.type === "forgetPassword");
    if (!otpData) return res.status(404).json({ message: "Your OTP is not found" });
    if (otpData.expiresIn < Date.now()) {
        await UserModel.updateOne( {email},{ $pull : { otp: { type: "forgetPassword"}}});
        return res.status(400).json({ message : "Your OTP has expired you must regenerate another one" });
    }
    const isVerfied = compareSync(otp , otpData.code) 
    if(!isVerfied) return res.status(404).json({message : 'Your otp is invalid'})
    const hashPassword = hashSync (password , +process.env.RESET_SALT)
    await UserModel.updateOne( {email},{password:hashPassword , $pull : { otp: { type: "forgetPassword" }}});
    return res.status(200).json({message:"YOUR Password reset successfully , Login to try the new one 👍"})
}

export const GmailLoginService = async (req , res) => {
    const {idToken} = req.body 
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience:process.env.GOOGLE_CLIENT_ID , 
  });
  const payload = ticket.getPayload();
  const {email , email_verified} = payload;
  if(!email_verified) return res.status(400).json({message:"invalid credentials"})
  const user = await UserModel.findOne({email ,Provider:providers.Google})
  if (!user) return res.status(404).json({message : "Email or password is invalid"})
  const accesstoken = tokens(user.id , user.email)
  const Refreshtoken = Refresh_tokens(user.id , user.email)
  return res.status(200).json({message : "User login successfully" , accesstoken , Refreshtoken})
}
export const GmailRegisterService = async (req , res) =>{
  const {idToken} = req.body 
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
  });
    const payload = ticket.getPayload();
    const {email , email_verified ,name} = payload
    if(!email_verified) return res.status(400).json({message:"invalid credentials"})
    const isExist = await UserModel.findOne({email})
    if(isExist) return res.status(409).json({message : "Email is already Exists!"})
        const user = new UserModel (
                {username:name ,
                 email ,
                 password : hashSync(uuidv4(), +process.env.SIGNUP_SALT) ,
                 Provider :providers.Google,
                 isEmailVerified :true})
    await user.save();
    if(!user) 
        return res.status(500).json({message:"User creation failed!"})
    return res.status(201).json({message:" user signUp successfully"})
}
export const RefreshToken = async (req , res) =>{
    const {refreshtoken} = req.headers;
    const DecodedData = jwt.verify(refreshtoken , process.env.JWT_SECRET_REFRESH)
    const isExistOnBlackList = await BlackListModel.findOne({jti : DecodedData.jti})
    if(isExistOnBlackList || DecodedData.exp < Math.floor(Date.now() / 1000)){
        return res.status(400).json({ message: "Sorry, You must login" });}
    const accesstoken = jwt.sign({_id : DecodedData._id , email : DecodedData.email} , process.env.JWT_SECRET_LOGIN , {expiresIn : '1h' , jwtid : uuidv4()})
    return res.status(200).json({message : "Token is Refreshed successfully", accesstoken}) 
}
export const LogOut = async (req , res) => {
    const {accesstoken , refreshtoken} = req.headers;
    const DecodedAccesstoken = jwt.verify(accesstoken , process.env.JWT_SECRET_LOGIN)
    const DecodedRefreshtoken = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH)
    const user = await BlackListModel.insertMany([{tokenId : DecodedAccesstoken.jti , expirayDate : DecodedAccesstoken.exp} , {tokenId : DecodedRefreshtoken.jti , expirayDate : DecodedRefreshtoken.exp}])
    return res.status(200).json({message : 'User is logged out successfully'})
}