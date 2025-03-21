const {promisify}=require('util')//Since we are only going to use the promisify method from this
const crypto=require('crypto')
const jwt=require('jsonwebtoken')
const User=require('./models/userModel')
const catchAsync=require('./utils/catchAsync')
const AppError=require('./utils/appError')
const sendEmail=require('./utils/email')
const { Console } = require('console')

//Function for token
const signToken=id=>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN//Expiration Date
       })
}
const createAndSendToken=(user,statusCode,res)=>{
  const token=signToken(user._id)
  //We are going to create a cookie which would contains the jwt which we will send to the cliet
  const cookieOptions={
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),//This expires property will make it so that the browser or client in general would delete the cookie after it has expired
    //It excepts only milli seconds
    //secure:true,//This means that the cookie would only be send on a encrypted connection(https)
    httpOnly:true//This makes it so that the cookie can not be acessed in any way by the browser
  }
  //We do not need secure:true since we are not in production and currently donot have https
  if(process.env.NODE_ENV==='production')cookieOptions.secure=true//So we will get secure:true only in production
  res.cookie('jwt',token,cookieOptions)
 
user.password=undefined//So that it will not be visible in the response

  res.status(statusCode).json({
  status:"success",
  token,
  data:{
    user
  }
 })
}
exports.signup=catchAsync(async (req,res,next)=>{ //We wrap this function in catchAsynch so that we do not need to write catch block everytime
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt
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
   
//const token=signToken(newUser._id)
//For the best encryption secretOrPrivateKey must be at least 32 characters long
   //we can pass in some options in the third parameter.It mentions when the JWT expires
   //After the specified time JSON Web token would no longer be valid 
   //So this is for logging out the user after a certain period of time 
   //This is manly done for security reasons
   //#Note:Make tour own secret key do not copy it from any tutorial

   //Here the expire time we have given in 90 days
   createAndSendToken(newUser,201,res)
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
    createAndSendToken(user,200,res)
})
exports.protect=catchAsync(async(req,res,next)=>{


//1)Getting token and check if it's available
//console.log(req.headers)
 let token
 if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token=req.headers.authorization.split(' ')[1]
    //console.log(token)
 }
 
 if(!token){
   
    return next(new AppError('You are not logged in!. Please log in to get acess',401))//401->unauthoriZed
 }
//Common practice is to send a token with the http header

//2)We need to validate the token(Verification token)

//In this step we verify if someone has verified the data or if the token has
//already expired

const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET)

console.log("Test case passed")
    //The call back runs as soon as the vefification has been completed
//console.log(decoded)
//algo reads the payload
//Now we have been working with promises all the time and we do not want
//to break that pattern.So we are going to PROMISIFY this function so that 
//it returns a promise then we can use async await

//Node actually has a build in promisyfy function.All we need to do to use it
//is to require the build in util module

//It has become a function that we can call which returns a promise

//We store the value of the promise in a variable and that resolved value of the promise
//will actaully be the decoded data of the pay load
//So the decoded payload from the webtoken

//The decoded variable contain the id,creating date and the expiration date of the token

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
const freshUser=await User.findById(decoded.id)
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

//freshUser.changedPasswordAfter(decoded.iat)//iat->issued At
console.log(freshUser.changedPasswordAfter(decoded.iat))
if(freshUser.changedPasswordAfter(decoded.iat)){
  
   return next(new AppError('The user no longer exists',401))
}
//So if the code can make it all the way to the end then nonly next is executed
   //next() gives acess to the protected route 
   req.user=freshUser
   //We are putting the entire user data on the request
   //This will be useful some time in the future
   console.log('Test case 3 passed')
next()
})
//Creating authorization Controller
exports.restrictTo=(...roles)=>{//Create an array of all the parameters that were specied
  return (req,res,next)=>{
  //We will give a user acess to a certain route when the user role is inside
  //of this roles array
  console.log(req.user)
  

if(!roles.includes(req.user.role)){//The protect middleware runs before this middleware.So the currentUser is on the req Object as specified in line 153.So we can use that here
  return next(new AppError('You do not have permission to perform this action',403))//403->StausCode for non authorization
}

  next()
  }//This is the middleware function that will get acess to the roles parameter


}
//Now usually we can not pass arguments into a middleware function.But in this case
//we really want to/
//So we create a wrapper function that return the middleware function that we actually want to create

exports.forgotPassword=catchAsync(async (req,res,next)=>{
//1)Get user based on Posted email
const user=await User.findOne({email:req.body.email})
if(!user){
    return next(new AppError('There is no user with that email address',404))
}
//2)Generate the random reset token
//Since we need to write quite a bit of code for this step. We create an instance method to make our code more readeable
const resetToken=user.createPasswordResetToken()
//In the instance fountion we just modified the data and did not actually save the document

//await user.save()
//If we just run it like this then it would return and error withe message
//saying "Please provide email and password"
//This happend because we are trying to save the document but we donot specify
//all of the madatory data(so the fields we have marked as recquired

//So all we need to do is actually pass a special option into this save method
await user.save({validateBeforeSave:false})//This option deactivates all the validators that we specify on our schema


//3)send it to the user email

//The user should be able to click on the email to do the request from
const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`//Getting the protocol from the request basically http or 
//We are preparing for this to work both in development and in production
const message=`Forgot your? Submit a PATCH request with your new password and password confirm to the ${resetUrl}\n If you didn't forgot your password, please ignore this email`
try{
await sendEmail({
  email:user.email,
  subject:'Your password reset Token (valid for 10 minutes)',
  message

})

res.status(200).json({
  status:"success",
  message:"Token send to email"
})
}catch(err){
  
  //Here we basically want to reset both the token  and the expire property
 user.passwordResetToken=undefined
user. passwordResetExpires=undefined
  await user.save({validateBeforeSave:false})
  return next(new AppError("There was an eror sending the email.Please try again later",500))
}
//If some error happens in the sendEmail we need to send back the password reset token and the password reset expired that we define
})
exports.resetPassword=catchAsync(async (req,res,next)=>{
//1)Get user based on the token

//The reset token that is send in the url is the non encrypted one and the one stored in the database is the encrypted one
//So we need to encrypt the original token and compare it with the one stored in the database

const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex')//req.params.token is the parameter we specified in the url of the 'resetPassword'

const user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}}) //For the comparison, behind the scene MongoDB convert the Date.now() && passwordResetExpires to the same datatype and compare



//2)If token has not expired and there is a user,then set the new password

//Basically what we want to check is that weather the password expire property is greater than right now
//If so then that means that it is in the future which means that the token has still not expired
//We do it directly in the query in line 243

//Next up we want to set an error if weather there is no user and the token is expired
if(!user){
  return next(new AppError('The token is invalid or has expired',400))
}
user.password=req.body.password//This is because we are going to send the password and also the password confirm via body
user.passwordConfirm=req.body.passwordConfirm
user.passwordResetToken=undefined
user.passwordResetExpires=undefined

//saving the changes in the document
await user.save()//In this case we don't want to turn off the validators because we want to validate .We want to check
//if password===passwordConfirm


//3)Update the changedPasswordAt property for the current user
//This is done in a middleware in userModel

//4)Log the user in, send JWT to the client
createAndSendToken(user,200,res)



})
exports.updatePassword=catchAsync( async (req,res,next)=>{
  //This functionality is only for logged in users but we still want to pass in our password for security measures
  //Beacause someone might find our pc open and might change our password which will be a terrible experience for the user
  //So we always need to ask for the current password before updating

  //1)Get user from ceollection
  const user=User.findById(req.user._id).select('+password')//This req.user.id is coming from the protect middleware
  //2)Check if the posted password is correct
  if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
    return next(new AppError('Your current password is wrong',401))
  }
  //3)If so update the password
  this.password=req.body.password
  this.passwordConfirm=req.body.passwordConfirm
  await user.save()
  //Why did't we do findByIdAndUpdate?
  //This is because the validator which checks if password===passwordConfirm is not going to work 
  //That is because this.password is not defined when we update
  //Because internally behind the scene mongoose doesnot really keep the current object in memory
  //That validator only works for 'CREATE' and 'Save'

  //4)Log user in ,send JWT
 createAndSendToken(user,200,res)
  next()
})
