
import Joi from "joi";
export const companySchema = Joi.object({
    body: Joi.object({
    companyName: Joi.string().required().min(2).max(50)
        .messages({ "string.empty": "Company name is required" }),
    
    description: Joi.string().max(500).required()
        .messages({ "string.max": "Description cannot exceed 500 characters" }),
    
    industry: Joi.string().required().min(2).max(50)
        .messages({ "string.empty": "Industry is required" }),

    address: Joi.string().required().max(200)
        .messages({ "string.empty": "Address is required", "string.max": "Address cannot exceed 200 characters" }),

    numberOfEmployees: Joi.number().integer().min(11)
        .messages({ "number.base": "Number of employees must be a number", "number.min": "Must have at least 1 employee"}),

    companyEmail: Joi.string().required().email({
        tlds: { 
            allow: ["com", "net", "org"]
         },
        maxDomainSegments: 2
    }).messages({ "string.email": "Invalid email format" }),

    HRs: Joi.array().items(Joi.string().email())
        .messages({ "array.includes": "Each HR email must be a valid email" }),

    legalAttachment: Joi.array().items(
        Joi.object({
            secure_url: Joi.string().uri().required().messages({ "string.uri": "Invalid attachment URL" }),
            public_id: Joi.string().required()
        })
    ).messages({ "array.base": "Legal attachments must be an array of objects" }),

    createdBy: Joi.string().required()
        .messages({ "string.empty": "CreatedBy field is required" })
})});
