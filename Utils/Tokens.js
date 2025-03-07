import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from 'uuid' 
export function tokens (id , email){
    const accesstoken = jwt.sign({_id : id , email} , process.env.JWT_SECRET_LOGIN , {expiresIn : process.env.JWT_EXPIRES_TOKEN , jwtid : uuidv4() })
    return accesstoken 
}
export function Refresh_tokens (id , email){
    const Refreshtoken = jwt.sign({_id : id , email} , process.env.JWT_SECRET_REFRESH , {expiresIn : process.env.JWT_EXPIRES_REFRESH, jwtid : uuidv4() })
    return Refreshtoken
}

