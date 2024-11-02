const fs=require('fs')
const express=require('express')

const app=express()
app.use(express.static(`${__dirname}`))
const tourRouter=require('./tourRoutes')
const userRouter=require('./userRoutes')

app.use(express.json()) 
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
module.exports=app
