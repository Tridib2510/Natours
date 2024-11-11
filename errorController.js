module.exports=((err,req,res,next)=>{
   // console.log('hello'+err.stack)//It gives us the location of the error
    err.statusCode=err.statusCode||500
    err.status=err.status||'error'
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    })
})
//We define the status & the status code on the error object 
//Which is accessd in the above error handling function