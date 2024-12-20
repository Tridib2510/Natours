const fs=require('fs')
const express=require('express')
const AppError=require('./utils/appError')
const rateLimit=require('express-rate-limit')
const mongoSanitize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const app=express()
const helmet=require('helmet')
const globalErrorHandler=require('./errorController')

const tourRouter=require('./tourRoutes')
const userRouter=require('./userRoutes')
app.use((req,res,next)=>{
   //console.log(req.headers)//This is how we get access to http headers in express
  //We can send the headers using postman
   next()
})
//Implementing rate limiter
const limiter=rateLimit({
    //Here we can define how many request per IP we are going to allow in a certain amount of time
    //Here we are going to allow 100 request per hour
    max:100,
    windowMs:60*60*1000,//WindowMs takes value in milliseconds
    message:'Too many request from an IP please try again in an hour'
})
app.use('/api',limiter)//We want to only apply  this limiter only for /api

//Set security http headers
app.use(helmet())

//Serving static files
app.use(express.static(`${__dirname}`))

//Body parser, reading data from the body into req.body
app.use(express.json({
    //Here we can specify some options to limit the amout of data coming into the body
    limit:'10kb'//kb->kilobyte
    //So now when we will have a body larger than 10 kb it will not be accepted
}))

//Data Sanitization against NOSQL  query injection
app.use(mongoSanitize())//mongoSanitize() returns a milldleware function
//This middleware looks at the query body ,req query string and also at req.params and then it would filter out all of the '$' and '.' 
//because that is gow mongoDB operators are written

//Data Santization against XSS attacks
app.use(xss())//clears malicious html code with some javascript code
//We prevent this by converting all this html symbols
//Be very carefull while using global middleware .A single misspell will result in not getting any response in postman
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
    next(new AppError(`Can't find url ${req.originalUrl}`,404))
    // const err=new Error(`Can't find url ${req.originalUrl}`)
    // err.statusCode=404
    // err.status='fail'
    // next(err)
    //If the next function receives an argument express would 
    //automatically assume that there is an error and whateven we passed inside next is an error.
    //So it skip all the other middleware in the middleware stack & send it to global error handling middleware directly.
})
app.use(globalErrorHandler)

module.exports=app


//Latest commit