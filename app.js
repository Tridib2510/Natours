const fs=require('fs')
const express=require('express')

const app=express()
app.use(express.static(`${__dirname}`))
const tourRouter=require('./tourRoutes')
const userRouter=require('./userRoutes')

app.use(express.json()) 
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
// app.all('*',(req,res,next)=>{
//     res.status(404).json({
//         status:"fail",
//         message:`Can't find ${req.originalUrl} on this server`
//     })
//     next()
// })
//Here '*'->It refers to all the url which stand for everything
//app.all() gives us access to all the https methods
//Now we just define a handler function
//req.originalUrl is a property on the request which gives us the url which was requested

app.all('*',(req,res,next)=>{
    const err=new Error(`Can't find url ${req.originalUrl}`)
    err.statusCode=404
    err.status='fail'
    next(err)
    //If the next function receives an argument express would 
    //automatically assume that there is an error and whateven we passed inside next is an error.
    //So it skip all the other middleware in the middleware stack & send it to global error handling middleware directly.
})
app.use((err,req,res,next)=>{
    err.statusCode=err.statusCode||500
    err.status=err.status||'error'
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    })
})
//We define the status & the status code on the error object 
//Which is accessd in the above error handling function
module.exports=app
//

