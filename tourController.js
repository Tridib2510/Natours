
const Tour=require('./models/tourModel')
const APIFeatures=require('./utils/apiFeatures')

exports.aliasTopTours=(req,res,next)=>{
    req.query.limit=5
    req.query.sort='-ratingsAverage,price'
    req.query.fields='name,price,ratingsAverage,summary,difficulty'
    next()

}

exports.getAllTour= async (req,res)=>{
    try{
        //API Features is a class that we have importd containing filter,sort etc
        //EXECUTE
        const features=new APIFeatures(Tour.find(),req.query).filter().sort().limitField().paginate();
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
}catch(err){
    res.status(404).json({
        status:'fail',
        message:err
    })
}
}
exports.deleteTour=async (req,res)=>{
   try{
    const tour=await Tour.findByIdAndDelete(req.params.id)
   
   }catch(err){
    res.status(204).json({
        status:"fail",
        data:null
    })
}
}
exports.getTour=async (req,res)=>{
    const id=req.params.id*1
    try{
    const tour=await Tour.findById(req.params.id)
        
    console.log(req.params)
    res.status(200).json({
        status:"success",
        data:{
            tour
        }
    })
    }catch(err){
        res.status(404).json({
            status:"fail",
            message:"Invalid ID"
        })
    }
    
   
}
exports.updateTour=async (req,res)=>{
    // if(req.params.id*1>tours.length){
    //     return res.status(404).json({
    //         status:"fail",
    //         message:"Invalid ID"
    //     })
    // }
    try{
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
}catch(err){
    res.status(404).json({
                status:"fail",
                message:"Invalid ID"
            })
}
}
exports.createTour=async (req,res)=>{
    try{
    const newTour=await Tour.create(req.body)
    res.status(201).json({
        status:"success",
        data:{
            tour:newTour
        }
    }) 
}catch(err){
    res.status(400).json({
        status:"fail",
        message:"Invalid data sent"
    })
}
}
exports.getTourStats=async (req,res)=>{
    try{
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
    }
    catch(err){
        res.status(404).json({
            status:"fail",
            message:err  
        })
    }
}
exports.getMonthlyPlan=async (req,res)=>{
    try{
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

    }catch(err){
        res.status(404).json({
            status:"fail",
            message:err  
        }) 
    }
}