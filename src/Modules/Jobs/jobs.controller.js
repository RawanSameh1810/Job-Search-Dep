import { DocumentExtensions, System_Roles } from "../../constants/models.Constants.js"
import { authenticationService } from "../../MiddleWares/Authentication.middleware.js"
import { authorizationService } from "../../MiddleWares/Authorization.middleware.js"
import { errorHandler } from "../../MiddleWares/Error-Handler.middleware.js"
import { MulterCloud } from "../../MiddleWares/Multer.middleware.js"
import * as JobServices from "./Services/job.service.js"
import{Router} from "express"
const JobController = Router()
const{user} = System_Roles
JobController.use(authenticationService())
JobController.post('/Add-Job' , errorHandler(JobServices.createJob))
JobController.put('/update-Job/:jobId' , errorHandler(JobServices.updateJob))
JobController.delete('/delete-Job/:jobId' , errorHandler(JobServices.deleteJob))
JobController.get('/get-Jobs' , errorHandler(JobServices.getAllJobs))
JobController.get('/filter-Jobs' , errorHandler(JobServices.getFilteredJobs))
JobController.get('/Applications-Jobs/:jobId' , errorHandler(JobServices.getApplicationsForJob))
JobController.patch('/apply/:jobId', authorizationService([user]),MulterCloud(DocumentExtensions).single("cv"), errorHandler(JobServices.applyToJob));
JobController.post('/reply-On-Applications/:applicationId' , errorHandler(JobServices.ReplyOnApplication))
export default JobController