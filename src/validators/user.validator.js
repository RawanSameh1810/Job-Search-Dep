import Joi from "joi";

export const signupSchema = {
    body: Joi.object({
        firstname: Joi.string().required().min(2).max(30),
        lastname: Joi.string().required().min(2).max(30),
        email: Joi.string().required().email({
            tlds: {
                allow: ["com", "net", "org"],
            },
            maxDomainSegments: 2
        }),
        password: Joi.string().required()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/)
            .messages({ 'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character from [@$!%*].' }),
            confirmPassword: Joi.string().required().valid(Joi.ref('password'))
            .messages({ 'any.only': 'Confirm password must match password' }),
        phone: Joi.string().pattern(/^\d{10,15}$/).messages({ 'string.pattern.base': 'Phone number must be between 10-15 digits' }),
        DOB: Joi.date().required()
            .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
            .messages({ 'date.max': 'You must be at least 18 years old' })
         }).with('email', 'password') 
};

export const ResetPasswordSchema = {
    body: Joi.object({
        email: Joi.string().required().email({
            tlds: {
                allow: ["com", "net", "org"],
            },
            maxDomainSegments: 2
        }),
        password: Joi.string().required()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/)
            .messages({ 'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character from [@$!%*].' }),
        confirmpassword: Joi.string().required().valid(Joi.ref('password'))
            .messages({ 'any.only': 'Confirm password must match password' }) ,
        otp : Joi.string().required()
    })
}

export const UpdatePasswordSchema = {
    body: Joi.object({
        oldpassword:Joi.string(),
        Newpassword: Joi.string().required()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/)
            .messages({ 'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character from [@$!%*].' }),
        confirmPassword: Joi.string().required().valid(Joi.ref('Newpassword'))
            .messages({ 'any.only': 'Confirm password must match Newpassword' }) 
    })
}
