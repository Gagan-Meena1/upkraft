import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import { evalManifestWithRetries } from "next/dist/server/load-components";
import nodemailer from "nodemailer";


export const sendEmail= async({email,emailType,userId}:any)=>{
    try{
        const hashedToken=await bcryptjs.hash(userId.toString(),10)

        if(emailType==="VERIFY")
        {
            await User.findByIdAndUpdate(userId,{
            $set:{verifyToken:hashedToken,
              verifyTokenExpiry:Date.now()+3600000
            }
            })
        }
        else if(emailType==="RESET")
        {
            await User.findByIdAndUpdate(userId,{
               $set: {forgotPasswordToken:hashedToken,
                    forgotPasswordTokenExpiry:Date.now()+3600000
               }
                })
        }



        // Looking to send emails in production? Check out our Email API/SMTP product!
        var transport = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: "620995cec311b8",//not to be here
            pass: "e1c3975b4dba4a"//not to be here
          }
        });


          const mailOption={ 
            from: 'volleyballcricket712@gmail.com', // sender address
           to: email, // list of receivers
           subject: emailType==='VERIFY'?"Verify your Email":"Reset your Password", // Subject line
           text: "Hello world?", // plain text body
           html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType==='VERIFY'?"Verify your Email":"Reset your Password"}
           or copy and paste the link be;ow to your browser.
           <br>${process.env.DOMAIN}/verifyemail?token=${hashedToken}
           </p>`, // html body
         }
        const mailResponse=  await transport.sendMail(mailOption)
        console.log(mailResponse);  
        
        return mailResponse
    }

    
    catch(error:any)
    {
        throw new Error(error.message);
    }
    

}