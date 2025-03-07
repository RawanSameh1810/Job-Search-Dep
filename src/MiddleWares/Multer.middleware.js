import multer from "multer"
export const MulterCloud = ( allowedExtentions = []) => 
{ 
    const storage = multer.diskStorage({
          filename: function (req, file, cb) {
          cb(null,file.originalname )
         }})
 function fileFilter (req, file, cb) {
     if (allowedExtentions.includes(file.mimetype)){
        return cb(null, true)}
       return cb(new Error("invalid file type"), false)
          }
const upload = multer({fileFilter , storage: storage })
return upload ;
}
