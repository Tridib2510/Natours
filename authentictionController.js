const jwt=require('jsonwebtoken')
const User=require('./models/userModel')
const catchAsync=require('./utils/catchAsync')
const AppError=require('./utils/appError')

//Function for token
const signToken=id=>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN//Expiration Date
       })
}
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

   //    const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET,{
//     expiresIn:process.env.JWT_EXPIRES_IN//Expiration Date
//    })
   
const token=signToken(newUser._id)
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
exports.login=catchAsync(async (req,res,next)=>{
    const {email,password}=req.body
    //1)Check if email and password exists
    if(!email||!password){
      return next(new AppError('Please provide email and password',404))
      // we are using return as after using next middleware we make sure that the function finishes right away
    }
    //2)Check if user and password is correct
     const user=await User.findOne({email:email}).select('+password')
    //Out put of user will not contain the password since we have use select:false in the schema so we need to 
    //explicity select it as well

   
     //const correct=await user.correctPassword(password,user.password)
     //if user doesn't exist then this correct canot not run ie user.password will not be available
     if(!user||!await user.correctPassword(password,user.password)){
        return next(new AppError('Incorrect email or password',401))
     }
    //3)If everything is okay,send token to client
    const token=signToken(user._id)
    res.status(200).json({
        status:"success",
        token
    })
})