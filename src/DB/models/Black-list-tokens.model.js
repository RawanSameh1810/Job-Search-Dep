import mongoose from "mongoose";
 
const Black_List_Schema = new mongoose.Schema(
    {
        tokenId:{
            type : String,
            required : true ,
            unique : true
        } ,
        expirayDate :{
            type : String ,
            required : true ,
        }
    } , {timestamps : true}
)
export const BlackListModel = mongoose.models.BlackList || mongoose.model( 'BlackList' , Black_List_Schema ) 