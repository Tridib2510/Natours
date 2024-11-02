const mongoose=require('mongoose')
const dotenv=require('dotenv')
dotenv.config({path:"./config.env"})
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
console.log(DB)
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
   
}).then(con=>{
    console.log('connection successfull')
}).catch(err=>{
    console.log('error')
})


const app=require('./app')
const port=process.env.PORT||3000

app.listen(port,()=>{
    console.log('Listening')
})