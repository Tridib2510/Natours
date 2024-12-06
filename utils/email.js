const nodemailer=require('nodemailer')

const sendEmail=async options=>{//The options include the email address where we want to send the email to,subject line,email content etc
    //1)Create a transporter

    //The transporter is basically the service that will actually send the email because it is not node js that will 
    //send the email itself.It is just the service that we define here. Something like gmail for example.

    //How it works with gmail
    // const transporter=nodemailer.createTransport({
    //     service:'Gmail',//There are also services like yahoo and many others that the nodemailer provides
    //     auth:{
    //         user:process.env.EMAIL_USERNAME,
    //         password:process.env.EMAIL_PASSWORD
    //     }
    //     //We need to activate in our gmail something called "Less secure app" option
    // })
//The reason we are not using gmail in this application as gmail is in no way a good idea for a production app

//In this we are going to use a special development service that fakes emails to real addresses but in reality this emails end up trapped in a 
//development inbox.So that we can take a look later how they will look in production.This service is called "mailtrap"
const transporter=nodemailer.createTransport({
      host:process.env.EMAIL_HOST,
      port:2525,//do not copy from the env since it gives you a string and we need a number for this to work
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
       
    })
   
  //console.log(transporter)
    //2)Define email options
    const mailOptions={
        from:'Tridib Roy Chowdhury <tridibroychowdhury9@gmail.com>', //Here we specify where the email is coming from
        to:options.email,//The recipient address .The option will contain the recipient email address
        subject:options.subject,
        text:options.message
        //html://Later we are going to specify the html property
    }
   // console.log(mailOptions)
    //3)Actually send the email with node mailer
   await transporter.sendMail(mailOptions)//This returns a promise
   console.log('testing 3 done')
   

}

module.exports=sendEmail