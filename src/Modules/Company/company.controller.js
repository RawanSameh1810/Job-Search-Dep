import { DocumentExtensions, ImageExtensions, System_Roles } from "../../constants/models.Constants.js"
import { authenticationService } from "../../MiddleWares/Authentication.middleware.js"
import { errorHandler } from "../../MiddleWares/Error-Handler.middleware.js"
import { MulterCloud } from "../../MiddleWares/Multer.middleware.js"
import * as CompanyServices from "./Services/company.services.js"
import{Router} from "express"
const CompanyController = Router()
CompanyController.use(authenticationService())
CompanyController.post('/Add-Company' ,MulterCloud(DocumentExtensions).array("Attachments", 2) , errorHandler(CompanyServices.AddCompany))
CompanyController.patch('/delete-company/:email' ,errorHandler(CompanyServices.SoftDeleteCompany))
CompanyController.put('/update-company/:companyId' , errorHandler(CompanyServices.UpdateCompany))
CompanyController.patch('/Upload-logo/:companyName' , MulterCloud( ImageExtensions).single("image") ,errorHandler(CompanyServices.uploadCompanylogo))
CompanyController.patch('/Upload-cover/:companyName' , MulterCloud( ImageExtensions).array("cover-images", 2) ,errorHandler(CompanyServices.uploadcompanyCover))
CompanyController.delete('/Delete-logo/:companyName', errorHandler(CompanyServices.DeleteCompanylogo))
CompanyController.delete('/Delete-Cover/:companyName', errorHandler(CompanyServices.DeleteCompanyCovers))
CompanyController.get('/Search' , errorHandler(CompanyServices.SearchByName))
 
export default CompanyController