const {promisify}=require('util')//Since we are going to only use this method we can just do it easier

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
exports.protect=catchAsync(async(req,res,next)=>{
//1)Getting token and check if it's available
 let token
 if(req.header.authorization && req.header.authorization.startsWith('Bearer')){
    token=req.header.authorization.split(' ')[1]
 }
 
 if(!token){
   
    return next(new AppError('You are not logged in!. Please log in to get acess',401))//401->unauthoriZed
 }
//Common practice is to send a token with the http header

//2)We need to validate the token(Verification token)

//In this step we verify if someone has verified the data or if the token has
//already expired
const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    //The call back runs as soon as the vefification has been completed

//algo reads the payload
//Now we have been working with promises all the time and we do not want
//to break that pattern.So we are going to PROMISIFY this function so that 
//it returns a promise then we can use async await

//Node actually has a build in promisyfy function.All we need to do to use it
//is to require the build in util module

//It has become a function that we can call which returns a promise

//We store the value of the promise in a variable and that resolved value of the promise
//will actaully be the decoded data
//So the decoded payload from the webtoken

//If we try to manipulate the web token then we get 
// an error named jsonWebTokenError

//If the token is expired we will get 
//and error named TokenExpiredError


//Most tutorial does not implement the last 2 steps
//What if the user actually change his password after the token has been issued?
//Imagine someone stole the JSON web token from the user but inorder to 
//protect against that the user changes his password .So the token that was 
//issued before the password change should no longet be accepted anymore

//3)Check if user still exits
const freshUser=await User.findById(decode)
//We can be 100 percent sure that the id is correct since
//we have made it until this point in the code
//and hence the verification process was successfull
//Otherwise line 94 would have produced an error which would have stop the program 
//from continuing

//So the verification process is what makes all of this work

//Check if there is a freshUser

if(!freshUser){
    return next(new AppError('The user no longer exists',401))
    

}


//4)Check if user changed password after the JWT was issued
//We will create another Instance method which will be available on all
//the documents 

freshUser.changedPasswordAfter(decoded.iat)//iat->issued At
if(!freshUser.changedPasswordAfter(decoded.iat)){
    return next(new AppError('User recently changed password Please log in',401))
}
//So if the code can make it all the way to the end then nonly next is executed
   //next() gives acess to the protected route 
next()
})