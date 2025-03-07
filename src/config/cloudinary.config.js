import {v2 as cloudinaryv2} from "cloudinary"

export const cloudinary = ()=>{
    cloudinaryv2.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_KEY, 
        api_secret: process.env.CLOUDINARY_SECRECT
      });
      return cloudinaryv2
}
