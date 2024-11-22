const AppError=require('./utils/appError')
//Error handling for cast errors
const handleCastErrorDB=err=>{
    const message=`Invalid ${err.path}:${err.value}`
    //Here err.path==InvalidId and err.value==id
    return new AppError(message,400)
}
//Error handling for duplicate elements
const handleDuplicateFieldsDB=err=>{
    const value=err.errmsg.match(/([""'])(\\?.)*?\1/)[0] //It is the name of the property(This is created by mongoose)
    //This gives us and array and we only the first element of that array
    const message=`Duplicate field value ${value}, Please use another value`
    return new AppError(message,404)
    // x will contains the duplicate value
    //For extracting this we will use a regular expression(Just search google)

}
//Error handling for handling validation errors
const handleValidationErrorDB=err=>{
    const errors=Object.value(err.errors).map(el=>el.message)
    //Now to create 1 big string due to all the string from all the errors
    //we have to loop over all the message and extract a new array 
    //Here error is a part of err(Error of mongoose in this case) which is a object containing the error messages
    //In javascript we use Object.values to loop over an object and in each
    //iteration we will simply return the error message
    const message=`Invalid input data+${errors.join('. ')}`// we use join to
    //seperate the 3 strings to make them more readible
    return new AppError(message,400)
    
}
//It its used to hadle JWT Errors
const handleJWTError=()=>{
    new AppError('Invalid Token Please log in again',401)
}
//It is used to handle JWT errors when the token is expired
const handleJWTExpiredError=()=>{
    new AppError('Your token has expired! Please log in again',401)
}
//Error handling for development
const sendErrorDev=(err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        stack:err.stack
    }) 
}
//Error handling for production
const sendErrorProd=(err,res)=>{// If the error we encounter is a programming error or due to any third
    //party package then this error will not be shown to client instead 
    //The client will be shown a generic message
       
    if(err.isOperational){
 
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    })
    }
else{//Programming error or other unknown error:don't leak error detail
    //1)log the error
    console.error('ERROR')//It is like console.log() but for errors
    //2)Send general message
    res.status(500).json({
        status:'error',
        message:'Something went very wrong'
    })
}
//There are libraries of npm that we can use instead of having simple console.error()
//but just logging the errors to console would make it visible in the logs
//or the hosting platform that we are using

//This is sophisticated real world error handling mechanism that we use in real life
}
module.exports=((err,req,res,next)=>{
   // console.log('hello'+err.stack)//It gives us the location of the error
    err.statusCode=err.statusCode||500
    err.status=err.status||'error'
    //Here we use 2different error handling for 2 different enviorments
    if(process.env.NODE_ENV==='development'){
    sendErrorDev(err,res)
    }
   else if(process.env.NODE_ENV==='production'){
    let error={...err}//It is not a good practice to override the 
    //argument of a function so we create a hard copy of error object  
    //using destructuring
    if(err.name==='CastError')error=handleCastErrorDB(error)//error gets overridden 
    //We will pass the error that mongoose created into our function
    //This would create a new error created with our app error class
    //And that error will be mark as operational
     if(error.code===11000)error=handleDuplicateFieldsDB(error)
     //handleDuplicateFieldsDB handles error when the new field name matches
     //that of an already preexisting field
     if(error.name==='ValidationError')error=handleValidationErrorDB(error)
     //ValidationError just like CastError is an error created by mongoose
    if(error.name='JsonWebTokenError')error=handleJWTError()
  //We do not need to pass in errro as we donot manipulate the error in the specified function
    if(error.name='TokenExpiredError')error=handleJWTExpiredError()
    
     sendErrorProd(error,res)
   }
})
//We define the status & the status code on the error object 
//Which is accessd in the above error handling function