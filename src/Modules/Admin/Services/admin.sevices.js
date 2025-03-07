import { CompanyModel } from "../../../DB/models/Company.model.js";
import { UserModel } from "../../../DB/models/User.model.js";
export const UserBannedOrUnbanned = async (req, res) => {
        const { userId } = req.params;
        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        //Unbanned User
        if (user.bannedAt) {
            user.bannedAt = null;
            await user.save();
            return res.status(200).json({ message: "User unbanned successfully", user });
        } else {  //banned user
            user.bannedAt = new Date();
            await user.save();
            return res.status(200).json({ message: "User banned successfully", user });
        } 
};

export const CompanyBannedOrUnbanned = async (req, res) => {
        const { companyId } = req.params;
        const company = await CompanyModel.findById(companyId);
        if (!company) return res.status(404).json({ message: "Company not found" });
        if (company.bannedAt) {
            company.bannedAt = null; // Unbanned company
            await company.save();
            return res.status(200).json({ message: "Company unbanned successfully", company });
        } else {
            company.bannedAt = new Date(); // Banned company 
            await company.save();
            return res.status(200).json({ message: "Company banned successfully", company });
        }
}
export const ApproveCompanyByAdmin = async (req, res) => {
    const { companyId } = req.params;
    console.log();
    
    const company = await CompanyModel.findByIdAndUpdate(companyId , {approvedByAdmin : true} , {new : true});
    if (!company) return res.status(404).json({ message: "Company not found" });
    return res.status(200).json({ message: "Company approved successfully", company });
}



