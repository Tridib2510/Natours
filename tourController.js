const AppError=require('./utils/appError')
const Tour=require('./models/tourModel')
const APIFeatures=require('./utils/apiFeatures')
const catchAsync=require('./utils/catchAsync')
exports.aliasTopTours=(req,res,next)=>{
    req.query.limit=5
    req.query.sort='-ratingsAverage,price'
    req.query.fields='name,price,ratingsAverage,summary,difficulty'
    next()

}

exports.getAllTour=(async (req,res,next)=>{
    const features=new APIFeatures(Tour.find(),req.query).filter().sort().limitField().paginate();
    
        //API Features is a class that we have importd containing filter,sort etc
        //EXECUTE
       
 //Here we create a new object of the API features class in there we are passing a query object and a query string comming from express
 //Then each of the above 4 methods we use to manipulate the query 
 //And by the end we simply await for the query so that it can come with all the documents we have selected
        const tour=await features.query
        
    res.status(200).json({
        status:"success",        
        data:{
            tour:tour
        }
    })

})

exports.deleteTour=catchAsync(async (req,res,next)=>{
  
    const tour=await Tour.findByIdAndDelete(req.params.id)
   
  
})
exports.getTour=catchAsync(async (req,res,next)=>{

//In Lect 153 we are going to use a process called populate in order to get accessed to the referenced tour guides whenever we query our certain tour
//The result of that would look as if the data has already been embedded when infact it is in a completely different collection
//The populate process always happens in a query

    const id=req.params.id*1
    
    const tour=await Tour.findById(req.params.id)

    // const tour=await Tour.findById(req.params.id).populate({
    //     path:'guides',
    //     select:'-__v -passwordChangedAt' //__v and passwordChangedAt will not be displaced '-' before the property name ins important

    // }) 

    //populate->To basically fill up the field called guides in our model which contains the reference with the actual data

    //This populate option is a fundamental tool when working with data in mongoose and when there are relationships between data
    //Behind the scenes using popluate will create a new query so it might affect your performance
   
        if(!tour){
          
         return next(new AppError('Not found with that ID',404))
         //we use return as we want to return the function immediately and
         //not move on to the next line which would try to give 2 responses
         //leading to error
        }
    console.log(req.params)
    res.status(200).json({
        status:"success",
        data:{
            tour
        }
    })
    
   
})
//Here the error comes up only when the ID specified donot matches the mongodb
//ID type .If it matches then it show tour=null
exports.updateTour=catchAsync(async (req,res,next)=>{
    // if(req.params.id*1>tours.length){
    //     return res.status(404).json({
    //         status:"fail",
    //         message:"Invalid ID"
    //     })
    // }
   
        const tour=  await Tour.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
               
        })
    res.status(200).json({
        status:"success",
        data:{
            tour //ES6 AUTOMATICALLY CONVERTS IT TO tour:tour since both of them have the same name
        }
    })

}
)
exports.createTour=catchAsync(async(req,res,next)=>{//fn is the name of the following fu
    const newTour=await Tour.create(req.body)
    res.status(201).json({
        status:"success",
        data:{
            tour:newTour
        }//Here int CreateTour we call the catchAsynch function 

    }) 

    //     try{
//         const newTour=await Tour.create(req.body)
//         res.status(201).json({
//             status:"success",
//             data:{
//                 tour:newTour
//             }
//         }) 
// }catch(err){
//     res.status(400).json({
//         status:"fail",
//         message:"Invalid data sent"
//     })
// }
})
//What happens in crateTour?
//So in order to get rid of our try catch block we basically wrap our asynchronous
//function inside the catchAsync function that we just created .That function
//will return a new anonomous function which is then assigned to create Tour
exports.getTourStats=catchAsync(async (req,res,next)=>{
    
        const stats= await Tour.aggregate([
            {
                $match:{duration:{$gte:0}}
            },
            {
               $group:{
                _id:"$difficulty",
                num:{$sum:1},//Adding 1 for each document
                numRatings:{$sum:'$ratingsQuantity'},
               avgRating:{$avg:'$ratingsAverage'},
                avgPrice:{$avg:'$price'},
                mainPrice:{$min:'$price'},
                maxPrice:{$max:'$price'}
               }
            },
            {
                $sort:{avgPrice:1}
            },
            {
                $match:{_id:{$ne:'easy'}}//Exclude all the documents that say easy
            }
        ])
        console.log(stats)
        res.status(201).json({
            status:"success",
            data:{
                tour:stats
            }
        }) 
    
    
})
exports.getMonthlyPlan=catchAsync(async (req,res,next)=>{
   
        const year=req.params.year*1
        console.log(year);
        const plan=await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
            $match:{
             startDates:{
                $gte:new Date(`${year}-01-01`),//We want your date to be greater that the following data
                $lte:new Date(`${year}-12-31`)//We want our date to be greater than the following date
             }

            }
        },
        {
            $group:{
                _id:{$month:'$startDates'},//What we want to group them on the basis of
                numTourStarts:{$sum:1},
                tours:{$push: '$name'}//If we want info about the tours then it should be an array .Here we push the name of the tours that has the same tourStarts 
            }
           
        },
        {
            $addFields:{month:'$_id'},//It adds another field with fieldname month containing the id which is the month(1-->12)
        
        },      
        {
            $project:{
                 _id:0
            }//We give each of the project name as a 0(no longer visible) and 1(visible)
        },
        {
            $sort:{numTourStarts:-1}//-1 is for decending
        },
        {
            $limit:12//Only allow us to have only 12 documents
        }
        ])
        res.status(201).json({
            status:"success",
            data:{
                plan:plan
            }
        }) 

    
})