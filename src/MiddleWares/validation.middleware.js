
export const validationMiddleware = (schema) =>{
    return (req,res,next) => {
     const validationErrors = []
     const schemakeys = Object.keys(schema)
      for(const key of schemakeys){
         const {error} = schema[key].validate(req[key] , {abortEarly : false })
         if (error)
             validationErrors.push(...error.details)
       }
     if(validationErrors.length > 0) 
          return res.status(400).json({message :"validation Error" ,error:validationErrors}) 
     next()
    }
}