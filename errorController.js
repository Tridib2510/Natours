const AppError=require('./utils/appError')
//Error handling for cast errors
const handleCastErrorDB=err=>{
    const message=`Invalid ${err.path}:${err.value}`
    return new AppError(message,400)
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
    if(err.name==='CastError')error=handleCastErrorDB(error)   
    //We will pass the error that mongoose created into our function
    //This would create a new error created with our app error class
    //And that error will be mark as operational

    sendErrorProd(error,res)
   }
})
//We define the status & the status code on the error object 
//Which is accessd in the above error handling function