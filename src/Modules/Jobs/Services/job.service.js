import { cloudinary } from "../../../config/cloudinary.config.js";
import { ApplicationModel } from "../../../DB/models/Application.model.js";
import { CompanyModel } from "../../../DB/models/Company.model.js";
import { JobOpportunityModel } from "../../../DB/models/Job opportunity.model.js";
import { emitter } from '../../../Services/send-Email.service.js';
export const createJob = async (req, res) => {
  
        const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, companyId, technicalSkills, softSkills } = req.body;
        if (!Array.isArray(technicalSkills) || !Array.isArray(softSkills)) 
            return res.status(400).json({ message: "technicalSkills and softSkills must be arrays." });
        const createdBy = req.authenticatedUser._id;
        const existingCompany = await CompanyModel.findById(companyId);
        if (!existingCompany) {
            return res.status(404).json({ message: "Company not found" });
        }
        if (!existingCompany.createdBy.equals(createdBy) && !existingCompany.HRs.includes(createdBy)) 
            return res.status(403).json({ message: "Only HRs or Company Owners can add jobs" });
        const job = new JobOpportunityModel({
            jobTitle,
            jobLocation,
            workingTime,
            seniorityLevel,
            jobDescription,
            technicalSkills, 
            softSkills, 
            addedBy: createdBy,
            companyId,
        });

        await job.save();
        res.status(201).json({ message: "Job opportunity created successfully", job })
}
export const updateJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const OwnerId = req.authenticatedUser._id;
        const job = await JobOpportunityModel.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const company = await CompanyModel.findById(job.companyId);
        if (!company) return res.status(404).json({ message: "Company not found" });

        if (OwnerId.toString() !== company.createdBy.toString()) 
            return res.status(403).json({ message: "Forbidden" });
        if ("closed" in req.body) {
            return res.status(403).json({ message: "Updating job closure status is not allowed" });
        }
        const { ...updateData } = req.body;
        updateData.updatedBy = OwnerId;
        const updatedJob = await JobOpportunityModel.findByIdAndUpdate(
            jobId, 
            { $set: updateData }, 
            { new: true }
        );

        res.status(200).json({ message: "Job updated successfully", job: updatedJob });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
export const deleteJob = async (req, res) => {
    const { jobId } = req.params;
    const userId = req.authenticatedUser._id;
        const job = await JobOpportunityModel.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });
        const company = await CompanyModel.findById(job.companyId);
        if (!company) return res.status(404).json({ message: "Company not found" });
        if (!company.HRs.includes(userId)) {
            return res.status(403).json({ message: "Forbidden: Only HRs can delete this job" });
        }
        await JobOpportunityModel.findByIdAndDelete(jobId);
        res.status(200).json({ message: "Job and related applications deleted successfully" });
}
export const getAllJobs = async (req, res) => {
        const { companyName, jobId, limit = 10, skip = 0, sort = 'createdAt', searchQuery } = req.query;
        let filter = {};
        if (jobId) filter._id = jobId;
        if (companyName) {
            const company = await CompanyModel.findOne({ companyName : { $regex: companyName, $options: 'i' } });
            if (company) 
                filter.companyId = company._id;
             else 
                return res.status(404).json({ message: "Company not found" });}
        if (searchQuery) {
            filter.$or = [
                { jobTitle: { $regex: searchQuery, $options: 'i' } },
                { jobDescription: { $regex: searchQuery, $options: 'i' } }
            ];
        }
        const jobs = await JobOpportunityModel.find(filter)
            .skip(Number(skip)) 
            .limit(Number(limit)) 
            .sort({ [sort]: 1 }); 
        const totalCount = await JobOpportunityModel.countDocuments(filter);

        res.status(200).json({
            message: "Jobs fetched successfully",
            totalCount,
            jobs
        });
   
}
export const getFilteredJobs = async (req, res) => {
 
        const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills, limit = 10, skip = 0, sort = 'createdAt' } = req.query;
        let filter = {};

        if (workingTime) 
             filter.workingTime = workingTime;
        if (jobLocation) 
            filter.jobLocation = jobLocation;
        if (seniorityLevel) 
            filter.seniorityLevel = seniorityLevel;
        if (jobTitle) 
            filter.jobTitle = { $regex: jobTitle, $options: 'i' };
        if (technicalSkills) {
            const skillsArray = technicalSkills.split(',').map(skill => skill.trim());
            filter.technicalSkills = { $all: skillsArray };
        }
        // Pagination and sorting
        const jobs = await JobOpportunityModel.find(filter)
            .skip(Number(skip)) 
            .limit(Number(limit)) 
            .sort({ [sort]: 1 }); 
        const totalCount = await JobOpportunityModel.countDocuments(filter);
        res.status(200).json({
            message: "Jobs fetched successfully",
            totalCount,
            jobs
        });
}
export const getApplicationsForJob = async (req, res) => {
        const { jobId } = req.params;
        const { skip = 0, limit = 10, sort = 'createdAt' } = req.query;
        const job = await JobOpportunityModel.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });
        const company = await CompanyModel.findById(job.companyId);
        if (!company) return res.status(404).json({ message: "Company not found" });
        const authenticatedUserId = req.authenticatedUser._id;
        if (!(authenticatedUserId.toString() === company.createdBy.toString() || company.HRs.includes(authenticatedUserId))) {
            return res.status(403).json({ message: "Only the company owner or HR can view applications" });
        }
        const applications = await ApplicationModel.find({ JobId: jobId })
            .populate({
                path: 'userData', 
                select: 'firstName lastName email resume', 
            })
            .skip(Number(skip)) 
            .limit(Number(limit)) 
            .sort({ [sort]: 1 }) 
            .lean(); 
        const totalCount = await ApplicationModel.countDocuments({ JobId: jobId });
        res.status(200).json({
            message: "Applications fetched successfully",
            totalCount,
            applications,
        });
}
export const applyToJob = async (req, res) => {
    const { jobId } = req.params;   
    const userId = req.authenticatedUser._id;  
    const { file } = req;  
    if (!file) 
        return res.status(400).json({ message: "No file uploaded" });
        const job = await JobOpportunityModel.findById(jobId);
        if (!job) 
            return res.status(404).json({ message: "Job not found" });
        const existingApplication = await ApplicationModel.findOne({ JobId: jobId, userId });
        if (existingApplication) 
            return res.status(400).json({ message: "You have already applied for this job." });
        const { secure_url, public_id } = await cloudinary().uploader.upload(file.path, {
            folder: `${process.env.CloudinaryFolder}/Users/Cvs`
        });
        const newApplication = new ApplicationModel({
            JobId: jobId,
            userId,
            userCv: {
                secure_url, 
                public_id    
            }
        });
        await newApplication.save();
        res.status(201).json({
            message: "Application submitted successfully.",
            application: newApplication
        });
}
export const ReplyOnApplication = async (req, res) => {
        const { applicationId } = req.params; 
        const { status } = req.body;  
        const userId = req.authenticatedUser._id; 
        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. It must be 'Accepted' or 'Rejected'." });
        }
        const application = await ApplicationModel.findById(applicationId).populate('JobId').populate('userId');
        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }
        const job = application.JobId;
        const company = await JobOpportunityModel.findById(job._id).populate('companyId');
        
        if (company.companyId.createdBy.toString() !== userId.toString() && !company.companyId.HRs.includes(userId)) 
            return res.status(403).json({ message: "You are not authorized to accept/reject applications for this job." });
        application.status = status;
        await application.save();
        const applicant = application.userId;
        let subject, html;

        if (status === 'Accepted') {
            subject = "Congratulations! Your application has been accepted.";
            html = `
                <p>Dear ${applicant.name},</p>
                <p>We are pleased to inform you that your application for the position of ${job.jobTitle} at ${company.companyId.name} has been accepted. Please wait for further instructions.</p>
                <p>Best regards,<br/>The Hiring Team</p>
            `;
        } else if (status === 'Rejected') {
            subject = "Your application has been rejected.";
            html = `
                <p>Dear ${applicant.name},</p>
                <p>We regret to inform you that your application for the position of ${job.jobTitle} at ${company.companyId.name} has been rejected. We wish you all the best in your future endeavors.</p>
                <p>Best regards,<br/>The Hiring Team</p>
            `;
        }
        emitter.emit('sendEmail', { to: applicant.email, subject, html })
        res.status(200).json({
            message: `Application ${status.toLowerCase()} successfully.`,
            application,
        })
};








