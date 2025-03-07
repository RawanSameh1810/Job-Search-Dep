import { ImageExtensions } from "../../constants/models.Constants.js"
import { authenticationService } from "../../MiddleWares/Authentication.middleware.js"
import { errorHandler } from "../../MiddleWares/Error-Handler.middleware.js"
import { MulterCloud } from "../../MiddleWares/Multer.middleware.js"
import { validationMiddleware } from "../../MiddleWares/validation.middleware.js"
import { UpdatePasswordSchema } from "../../validators/user.validator.js"
import * as ProfileServices from "./services/Profile.service.js"
import{Router} from "express"
const ProfileController = Router()
ProfileController.use(authenticationService())
ProfileController.patch('/update-password' , validationMiddleware(UpdatePasswordSchema) , errorHandler(ProfileServices.UpdatePassword))
ProfileController.patch('/Upload-profile' , MulterCloud( ImageExtensions).single("image") ,errorHandler(ProfileServices.uploadprofilepicture))
ProfileController.patch('/Upload-cover' , MulterCloud( ImageExtensions).array("cover-images", 2) ,errorHandler(ProfileServices.uploadcoverpicture))
ProfileController.delete('/Delete-Photo', errorHandler(ProfileServices.DeleteProfilePic))
ProfileController.delete('/Delete-Cover', errorHandler(ProfileServices.DeleteCoverPics))
ProfileController.patch('/Deactivate-Account' , errorHandler(ProfileServices.SoftDeleteAccount))
ProfileController.put('/update-Profile', errorHandler(ProfileServices.UpdateProfile))
ProfileController.get('/get-info' , errorHandler(ProfileServices.GetUserInfo))
ProfileController.get('/get-another/:email' , errorHandler(ProfileServices.GetAnotherInfo))
export default ProfileController