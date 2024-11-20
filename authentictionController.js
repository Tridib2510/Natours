const jwt=require('jsonwebtoken')
const User=require('./models/userModel')
const catchAsync=require('./utils/catchAsync')

exports.signup=catchAsync(async (req,res,next)=>{ //We wrap this function in catchAsynch so that we do not need to write catch block everytime
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    })
    //Withe the modified new code we only allow the data that we actually need to be put in the new user
    //So just the name,email,passoword,passwordConfirm
    //Now even if a user tries to manually input a role we will not store that into the mew user

    //However we can no longer register as an admion. So if we need to add a new administrator to our system
    //We can just create the new user normally and then go into MONGODB compass and add our role in  there
   
   //Usually when we signUp for any web application we automatically gets logged in
   //All we need to do is sign a JSON Web token and then send it back to the user
   const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRES_IN//Expiration Date
   })
   //For the best encryption secretOrPrivateKey must be at least 32 characters long
   //we can pass in some options in the third parameter.It mentions when the JWT expires
   //After the specified time JSON Web token would no longer be valid 
   //So this is for logging out the user after a certain period of time 
   //This is manly done for security reasons
   //#Note:Make tour own secret key do not copy it from any tutorial

   //Here the expire time we have given in 90 days
   res.status(201).json({
    status:"success",
    token,//We are sending the token to the new user and log the user in when he creates his account
    data:{
        user:newUser
    }
   })
})