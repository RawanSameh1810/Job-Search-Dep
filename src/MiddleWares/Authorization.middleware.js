export const authorizationService = (allowedRoles) => {
    return async(req , res , next) => {
      try{
        const{role} = req.authenticatedUser;
        const IsAllowed = allowedRoles.includes(role)
        if (!IsAllowed)
          return res.status(401).json({message : "Unauthorized"})
         next()
      }
      catch(error){
       console.log("Internal Server Error" ,error);
       return res.status(500).json({message : 'something went wrong' ,error})
      }
    }
   }