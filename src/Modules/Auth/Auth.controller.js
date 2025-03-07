import { Router } from "express"
import { errorHandler } from "../../MiddleWares/Error-Handler.middleware.js"
import * as authServices from "./services/Auth.services.js"
import { validationMiddleware } from "../../MiddleWares/validation.middleware.js"
import { ResetPasswordSchema, signupSchema } from "../../validators/user.validator.js"

const authController = Router()
authController.post('/SignUp' , validationMiddleware(signupSchema) , errorHandler(authServices.SignUp))
authController.post('/verifyEmail' , errorHandler(authServices.VerifyEmail))
authController.post('/login' , errorHandler(authServices.login))
authController.post('/gmail-login' , errorHandler(authServices.GmailLoginService))
authController.post('/gmail-signup' , errorHandler(authServices.GmailRegisterService))
authController.post('/regenerate-Otp' , errorHandler(authServices.regenerateOtp))
authController.post('/refresh-token' , errorHandler(authServices.RefreshToken))
authController.post('/logout' , errorHandler(authServices.LogOut))
authController.patch('/forget-password' , errorHandler(authServices.ForgetPassword))
authController.put('/reset-password' , validationMiddleware(ResetPasswordSchema) , errorHandler(authServices.ResetPassword))
export default authController
