const fs=require('fs')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const Tour=require('./models/tourModel')
dotenv.config({path:"./config.env"})



const DB=process.env.DATABASE.replace(
    '<PASSWORD>',process.env.DATABASE_PASSWORD
)

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
   
})
.then(con=>{
    console.log('connection successfull')
}).catch(err=>{
    console.log('Error')
})
//READING THE FILE
const tours=JSON.parse(fs.readFileSync('tours-simple.json','utf-8'))

//IMPORT DATA INTO THE DATABASE

const importData=async ()=>{
  try{
      await Tour.create(tours)
      console.log(tours)
      process.exit()
  }catch(err){
    console.log(err)
  }
}
//DELETE ALL DATA FROM DB
const deleteData=async()=>{
    try{
        await Tour.deleteMany();
        console.log('Data successfully deleted')
        process.exit() //It is kind of an agressive way to stop an application 
    }catch(err){
        console.log(err)
    }
}
if(process.argv[2]=='--import'){
    importData()
    
}
else if(process.argv[2]=='--delete'){
    deleteData()
}

//This shows the arguments of running this node process