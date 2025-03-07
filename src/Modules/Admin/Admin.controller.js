import { System_Roles } from "../../constants/models.Constants.js"
import { authenticationService } from "../../MiddleWares/Authentication.middleware.js"
import { authorizationService } from "../../MiddleWares/Authorization.middleware.js"
import { errorHandler } from "../../MiddleWares/Error-Handler.middleware.js"
import * as AdminServices from "./Services/admin.sevices.js"
import{Router} from "express"
const AdminController = Router()
const{admin} = System_Roles
AdminController.use(authenticationService())
AdminController.patch('/ban/:userId', authorizationService([admin]),errorHandler(AdminServices.UserBannedOrUnbanned))
AdminController.patch('/company-ban/:companyId', authorizationService([admin]),errorHandler(AdminServices.CompanyBannedOrUnbanned))
AdminController.patch('/Approved/:companyId', authorizationService([admin]),errorHandler(AdminServices.ApproveCompanyByAdmin))
export default AdminController