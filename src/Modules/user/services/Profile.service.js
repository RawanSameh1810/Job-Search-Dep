import { UserModel } from "../../../DB/models/User.model.js";
import { cloudinary } from "../../../config/cloudinary.config.js";
import {compareSync, hashSync} from "bcrypt"
import { BlackListModel } from "../../../DB/models/Black-List-tokens.model.js";
import { Encryption } from "../../../../Utils/Encryption.utils.js";
export const UpdatePassword = async(req ,res) => {
    const {_id}= req.authenticatedUser;
    const {oldpassword , Newpassword , confirmPassword} = req.body
    if (Newpassword != confirmPassword)
      return res.status(400).json({message : "password and confirmpassword must match!"})
    const user = await UserModel.findById(_id)
    const isMatched = compareSync (oldpassword , user.password)
    console.log(isMatched);
    
     if (!isMatched)
      return res.status(400).json({message : "Invalid password"})
    const hashPassword = hashSync(Newpassword , +process.env.UPDATE_SALT)
    user.password = hashPassword;
    await user.save();
    await BlackListModel.create(req.authenticatedUser.token)
    return res.status(201).json({message : "Password is Updated Successfully"})
}
export const uploadprofilepicture = async(req ,res) => {
    const{_id} =  req.authenticatedUser;
    const {file} = req 
    if(!file) return res.status(400).json({message:"No file Uploaded"})
    const {secure_url , public_id} = await cloudinary().uploader.upload(file.path ,{
      folder: `${process.env.CloudinaryFolder}/Users/Profile`}) //in env because it changes from 1 env to another
    const user = await UserModel.findByIdAndUpdate({_id} , { profilePic:{secure_url , public_id}} , {new:true})
    res.status(200).json({message:"profile picture uploaded Successfully" , user})
}
export const uploadcoverpicture = async(req ,res) => {
    const{_id} =  req.authenticatedUser;
    const {files} = req;
    if(!files?.length) return res.status(400).json({message:"No file Uploaded"})
    const images = []
    for (const file of files) {
     const {secure_url , public_id} = await cloudinary().uploader.upload(file.path ,{
            folder: `${process.env.CloudinaryFolder}/Users/Covers`}) 
            images.push({secure_url , public_id})
            }
    const user = await UserModel.findByIdAndUpdate({_id} , {coverPic : images} , {new:true})
    res.status(200).json({message:"cover pictures uploaded Successfully" , user})
}
export const DeleteProfilePic = async (req , res) => {
  const{_id} =  req.authenticatedUser;
  const user = await UserModel.findById(_id)
  const profilePicId = user.profilePic.public_id
  if(!profilePicId)
    return res.status(404).json({message : "There's no profile picuture"})
  await cloudinary().uploader.destroy(profilePicId) 
  return res.status(200).json({ message : " your photo is deleted successfully"})
}
export const DeleteCoverPics = async (req , res) => {
  const{_id} =  req.authenticatedUser;
  const user = await UserModel.findById(_id)
  const coverPicsIds = user.coverPic.map(o => o.public_id)
  if(coverPicsIds.length == 0)
    return res.status(404).json({message : "There's no cover photos"})
  await cloudinary().api.delete_resources(coverPicsIds)
  return res.status(200).json({ message : "cover photos are deleted successfully"})
}
export const SoftDeleteAccount = async (req , res) =>{
  const {_id} =  req.authenticatedUser;
  const user = await UserModel.findById(_id)
  if (!user)
    return res.status(404).json({message:"Something went wrong"})
  const deletedUser = await UserModel.findByIdAndUpdate({_id} , {isDeactivated : true} , {new :true})
  return res.status(200).json({message : "Account is deleted Successfully" , DeactivatedUser : deletedUser.email})
}
export const UpdateProfile = async (req , res) => {
  const {_id} = req.authenticatedUser;
  const{mobileNumber, DOB ,firstName, lastName, Gender} = req.body;
  const HashNumber = await Encryption({value : mobileNumber , secretkey : process.env.PHONE_SECRETKEY})
  const UpdatedUser = await UserModel.findByIdAndUpdate({_id},{phone : HashNumber , DOB , firstname : firstName , lastname : lastName , gender : Gender})
  if(!UpdatedUser)
      return res.status(404).json({message : 'User not found'});
  return res.status(200).json({message : "profile is updated successfully" , UpdatedUser})
}
export const GetUserInfo = async (req , res) =>{
  const {email} = req.authenticatedUser;
  const user = await UserModel.findOne({email})
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json({message : "Your info : " , user})
}
export const GetAnotherInfo = async (req, res) => {
  const { email } = req.params;
  const user = await UserModel.findOne({ email }).select("firstname lastname phone profilePic coverPic"); // we have firstname and lastname because select get what you tell it to get only so if we don't virtuals doesn't work
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json({ 
      userName: user.UserName,
      mobileNumber: user.phone, 
      profilePic: user.profilePic,
      coverPic: user.coverPic});
};
