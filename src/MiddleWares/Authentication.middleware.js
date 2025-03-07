import jwt from "jsonwebtoken";
import { BlackListModel } from "../DB/models/Black-List-tokens.model.js";
import { UserModel } from "../DB/models/User.model.js"

export const authenticationService = () => {
 return async(req , res , next) => {
   try{
      const{accesstoken} = req.headers;
      if(!accesstoken)
        return res.status(404).json({message : 'you must login first'})
      const Decodedtoken = jwt.verify(accesstoken , process.env.JWT_SECRET_LOGIN)
      const isOnBlackList = await BlackListModel.findOne({tokenId : Decodedtoken.jti})
      if(isOnBlackList)
        return res.status(404).json({message : 'you must login first'})
      const user = await UserModel.findById(Decodedtoken._id , '-password -__v')  
      if(!user)
        return res.status(404).json({message : 'you must Sign up'})
      req.authenticatedUser = user //to pass data through middlewares
      req.authenticatedUser.token = {tokenId : Decodedtoken.jti , expirayDate : Decodedtoken.exp}
      next()
   }
   catch(error){
    console.log("Internal Server Error" ,error);
    if (error.name == 'TokenExpiredError')
        return res.status(404).json({message : "token expired you should login and try again"})
    return res.status(500).json({message : 'something went wrong' ,error})
    
   }
 }
}