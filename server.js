const mongoose=require('mongoose')
const dotenv=require('dotenv')

process.on('uncaughtException',err=>{
    console.log(`UNCAUGHT EXCEPTION`)
    console.log(err.name,err.message)///Log the error to our console so that it shows up in the logs in our servers
    
    process.exit(1) //We don't need the server.close() as these erros will not happend asynchonously
                    //So it has nothing to do with our sever

    //When there is a uncaught Exception we really need to crash our application
    //because after uncaughtException the entire node process is in a so called
    //unclean state.
    //So the process needs to be terminated and restarted

    //In production we need to have a tool in place which starts the application
    //after restarting.Some hosting services already does that
   
})
//'uncaughtException' event should be before any other code as any mal code
//above it will not be managed by this
dotenv.config({path:"./config.env"})
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
console.log(DB)
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
   
}).then(con=>{
    console.log('connection successfull')
})


const app=require('./app')
const port=process.env.PORT||3000

const server=app.listen(port,()=>{
    console.log('Listening')
})
//For each time there is an unhandled rejection some where in our 
//application the process object will emmit an object called
//unhandled rejection. So we subscribe to that event
process.on('unhandledRejection',err=>{//unhandledRejection is the event
    console.log(err.name,err.message)

    // If we have some problem with our database connection 
    //then all we can do is shut down our database application

    server.close(()=>{
        process.exit(1)
    })
    
    //Closes the server and run the call back function
    //online inside of which we shut down the server
   //So by doing server.close() we are basically giving server time to handle
   //all pending requests at that time and only then the server is killed
   //In real world scenerio we should do it like this

    //process.exit(1)
    //exit(0) stands for success and exit(1) stands for uncalled exception
   //process.exit(1) is a very abrupt way of ending our application
   //It will just immediately abort all the requests that are running or pending
   //We need to shut down gracefully
   //We first close the server and only then we shut down the application
    
   //Usually in a production app on a web server we will usually 
   //have some tool in place that usually restart the application 
   //when it crashes 
   //Some platform that hosts nodes js do this on their own
   
})
//So we are listining to this 'unhandled rejection event' which allows us
//to handle all the errors occuring in the asynchoronous code which were
//not prevously hanlded


