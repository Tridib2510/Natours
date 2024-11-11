const fs=require('fs')
const express=require('express')

const app=express()
app.use(express.static(`${__dirname}`))
const tourRouter=require('./tourRoutes')
const userRouter=require('./userRoutes')

app.use(express.json()) 
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.all('*',(req,res,next)=>{
    res.status(404).json({
        status:"fail",
        message:`Can't find ${req.originalUrl} on this server`
    })
    next()
})
//Here '*'->It refers to all the url which stand for everything
//app.all() gives us access to all the https methods
//Now we just define a handler function
//req.originalUrl is a property on the request which gives us the url which was requested
module.exports=app
