import { GlobalErrorHandler } from "../src/MiddleWares/Error-Handler.middleware.js"
import AdminController from "../src/Modules/Admin/Admin.controller.js"
import authController from "../src/Modules/Auth/Auth.controller.js"
import CompanyController from "../src/Modules/Company/company.controller.js"
import JobController from "../src/Modules/Jobs/jobs.controller.js"
import ProfileController from "../src/Modules/user/Profile.controller.js"
export const RouterHandler = (app , express)=> {
  app.use('/auth' , authController)
  app.use('/user' , ProfileController)
  app.use('/company', CompanyController)
  app.use('/jobs' , JobController)
  app.use('/Admin' ,AdminController)
  app.all('*' , (req ,res) =>{
    res.status(404).json({message:"Route is NOT found"})
  })
  app.use(GlobalErrorHandler)
}
export default RouterHandler 