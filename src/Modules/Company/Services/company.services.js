import { cloudinary } from "../../../config/cloudinary.config.js";
import { System_Roles } from "../../../constants/models.Constants.js";
import {CompanyModel} from "../../../DB/models/Company.model.js"
import { UserModel } from "../../../DB/models/User.model.js";

export const AddCompany = async (req, res) => {
    const { companyName, description, industry, address, numberOfEmployees, companyEmail} = req.body;
    const HRs = req.body.HRs ? JSON.parse(req.body.HRs) : [];
    const createdBy = req.authenticatedUser._id;
    const existingCompany = await CompanyModel.findOne({ $or: [{ companyName }, { companyEmail }] });
    if (existingCompany) {
      return res.status(400).json({ message: "Company name or email already exists" });
    }
    let validHRs = [];
    if (HRs && HRs.length > 0) {
        const hrUsers = await UserModel.find({ email: { $in: HRs } }, "_id");
        validHRs = hrUsers.map((user) => user._id);
    }
    const {files} = req;
    if(!files?.length) return res.status(400).json({message:"No file Uploaded"})
    const Attachments = []
    
    for (const file of files) {
     const {secure_url , public_id} = await cloudinary().uploader.upload(file.path ,{
            folder: `${process.env.CloudinaryFolder}/Companies/Attachments`}) 
            Attachments.push({secure_url , public_id})
            }   
    const newCompany = await CompanyModel.create({
      companyName,
      description,
      industry,
      address,
      NumberOfEmployees : numberOfEmployees,
      companyEmail,
      createdBy,
      HRs:validHRs,
      legalAttachment : Attachments
    });
    res.status(201).json({ message: "Company added successfully", company: newCompany });
}
export const UpdateCompany = async (req, res) => {
            const { companyId } = req.params;
            const OwnerId = req.authenticatedUser._id;
            const company = await CompanyModel.findById(companyId);
            if (!company) return res.status(404).json({ message: "Company not found" });
            if(OwnerId.toString() != company.createdBy.toString())
                return res.status(403).json({message : "Forbidden"})
            if ('legalAttachment' in req.body) {
                return res.status(403).json({ message: "Updating legalAttachment is not allowed" });
            }
            const {...updateData } = req.body;  //legal attachment lesa
            const updatedCompany = await CompanyModel.findByIdAndUpdate(
                companyId,{ $set: updateData }, { new: true});
            res.status(200).json({ message: "Company updated successfully", company: updatedCompany });  
}
export const SoftDeleteCompany = async (req , res) =>{
    const {_id} =  req.authenticatedUser;
    const{email} = req.params
    const user = await UserModel.findById(_id)
    const existingCompany = await CompanyModel.findOne({companyEmail : email});
    if (!existingCompany) 
        return res.status(404).json({ message: "Company Not found" });
    if(_id.toString()!= existingCompany.createdBy.toString() && user.role !== System_Roles.admin)
        res.status(401).json({message : "you are Not authorized to do this"})
    const deletedCompany = await CompanyModel.findOneAndUpdate({companyEmail : email} , {deletedAt:Date.now()} , {new :true})
    return res.status(200).json({message : "Account is deleted Successfully" , deletedCompany})
  }

  export const uploadCompanylogo = async(req ,res) => {
    const{companyName} =  req.params;
    const existingCompany = await CompanyModel.findOne({companyName});
    if (!existingCompany) 
        return res.status(404).json({ message: "Company Not found" });
    const {file} = req 
    if(!file) return res.status(400).json({message:"No file Uploaded"})
    const {secure_url , public_id} = await cloudinary().uploader.upload(file.path ,{
      folder: `${process.env.CloudinaryFolder}/Companies/logos`}) 
    const company = await CompanyModel.findOneAndUpdate({companyName} , { logo:{secure_url , public_id}} , {new:true})
    res.status(200).json({message:"logo uploaded Successfully" , company})
}
export const uploadcompanyCover = async(req ,res) => {
    const{companyName} =  req.params;
    const existingCompany = await CompanyModel.findOne({companyName});
    if (!existingCompany) 
        return res.status(404).json({ message: "Company Not found" });
    const {files} = req;
    if(!files?.length) return res.status(400).json({message:"No file Uploaded"})
    const images = []
    for (const file of files) {
     const {secure_url , public_id} = await cloudinary().uploader.upload(file.path ,{
            folder: `${process.env.CloudinaryFolder}/Companies/Covers`}) 
            images.push({secure_url , public_id})
            }
    const company = await CompanyModel.findOneAndUpdate({companyName} , {coverPic : images} , {new:true})
    res.status(200).json({message:"cover pictures uploaded Successfully" , company})
}
export const DeleteCompanylogo = async (req , res) => {
    const{companyName} =  req.params;
    const existingCompany = await CompanyModel.findOne({companyName});
    if (!existingCompany) 
        return res.status(404).json({ message: "Company Not found" });
  const profilePicId = existingCompany.logo.public_id
  if(!profilePicId)
    return res.status(404).json({message : "There's no company logo"})
  await cloudinary().uploader.destroy(profilePicId) 
  return res.status(200).json({ message : " your logo is deleted successfully"})
}
export const DeleteCompanyCovers = async (req , res) => {
    const{companyName} =  req.params;
    const existingCompany = await CompanyModel.findOne({companyName});
    if (!existingCompany) 
        return res.status(404).json({ message: "Company Not found" });
  const coverPicsIds = existingCompany.coverPic.map(o => o.public_id)
  if(coverPicsIds.length == 0)
    return res.status(404).json({message : "There's no cover photos"})
  await cloudinary().api.delete_resources(coverPicsIds)
  return res.status(200).json({ message : "cover photos are deleted successfully"})
}

export const SearchByName = async(req , res) =>{
    const { companyName } = req.query;
    console.log(companyName);
    
    if (!companyName) {
        return res.status(400).json({ message: "Company name is required" });
    }
    const existingCompany = await CompanyModel.findOne({companyName});
    if (!existingCompany) 
        return res.status(404).json({ message: "Company Not found" });
    return res.status(200).json({ message : "Company Info:" , existingCompany })
}

