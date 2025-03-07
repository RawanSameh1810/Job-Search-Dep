import nodemailer from 'nodemailer' ;
import { EventEmitter } from 'node:events';
export const SendEmailService = async({to ,subject ,html ,attachments = []}) =>{
   try{
     const transporter = nodemailer.createTransport({ 
        host : 'smtp.gmail.com' , 
        port : 465 ,
        secure : true ,
        auth : {
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASS
        } 
     })
     const info = await transporter.sendMail({
        from : `"JobSearch-APP🏢" <${process.env.EMAIL_USER}>`,
        to ,
        subject  ,
        text : "" ,
        html ,
        attachments 
     })
   }
   catch(error){
      console.log('Error Catched in sending Emails' , error);
      return error 
   }
}
export const emitter = new EventEmitter();
emitter.on('sendEmail' ,(...args) => {
    const {to , subject ,html , attachments } = args[0]
     SendEmailService({
        to ,
        subject ,
        html ,
        attachments 
     })
}) 