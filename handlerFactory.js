const catchAsync=require('./utils/catchAsync')
const AppError=require('./utils/appError')
const APIFeatures=require('./utils/apiFeatures')

//In Lec 161 we are going to build a handler factory function to delete review documents but also documents
//from all the other collection all with one simple function
//Instead of manually writing all these handlers .Why not create a factory function which are going to return these 
//handlers for us
//Factory function->It is a function that returns another function .In these case our handler function

exports.deleteOne=Model=>catchAsync(async (req,res,next)=>{
  
    const doc=await Model.findByIdAndDelete(req.params.id)//This function will not know what kind of document it is .It can be review ,tour or user

    if(!doc){
        return next(new AppError('No tourfound with the ID',404));
    }
   res.status(204).json({
    status:"success",
    data:null
   })
  
})
//In Lecture 162 we are going to be creating some more factory functions
//We are going to create a function that is going to update a document
exports.updateOne=Model=>catchAsync(async (req,res,next)=>{
    // if(req.params.id*1>tours.length){
    //     return res.status(404).json({
    //         status:"fail",
    //         message:"Invalid ID"
    //     })
    // }
   
        const doc=await Model.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
               
        })

        if(!doc){
            return next(new AppError(`No document found with that ID`,404))
        }

    res.status(200).json({
        status:"success",
        data:{
           data: doc //ES6 AUTOMATICALLY CONVERTS IT TO tour:tour since both of them have the same name
        }
    })

}
)
exports.createOne=Model=>catchAsync(async(req,res,next)=>{//fn is the name of the following fu
    const ndoc=await Model.create(req.body)
    res.status(201).json({
        status:"success",
        data:{
            data:doc
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
// For create review
////     if(!req.body.tour)req.body.tour=req.params.tourId
//     if(!req.body.user)req.body.user=req.user._id 
//is not availble in createOne function so we will need to create a middleware to do it
//which is going to run before the createReview


//In Lec 163 we are going to create functions for getting documents
//This one is a bit trickier as we have a populate in the get Tour handler
//So we going to use the populate method in the query

exports.getOne=(Model,popOptions)=>catchAsync(async (req,res,next)=>{

    //So we are going to first create the query and if there is a populate option object then we are going to add that to the query 
    //and then we are going to await the query

    let query=Model.findById(req.params.id)
    if(popOptions)query=query.populate(popOptions)
        const doc=await query
    
        const id=req.params.id*1
        
    
        // const tour=await Tour.findById(req.params.id).populate({
        //     path:'guides',
        //     select:'-__v -passwordChangedAt' //__v and passwordChangedAt will not be displaced '-' before the property name ins important
    
        // }) 
    
        //populate->To basically fill up the field called guides in our model which contains the reference with the actual data
    
        //This populate option is a fundamental tool when working with data in mongoose and when there are relationships between data
        //Behind the scenes using popluate will create a new query so it might affect your performance
       
            if(!doc){
              
             return next(new AppError('Not found with that ID',404))
             //we use return as we want to return the function immediately and
             //not move on to the next line which would try to give 2 responses
             //leading to error
            }
        console.log(req.params)
        res.status(200).json({
            status:"success",
            data:{
                data:doc
            }
        })
        
       
    })
    exports.getAll=(Model)=>(async (req,res,next)=>{
        
        //To allow for nested GET reviews on tour
        let filter={}
            if(req.params.tourId)filter={tour:req.params.tourId}

        const features=new APIFeatures(Model.find(filter),req.query).filter().sort().limitField().paginate();
        
            //API Features is a class that we have importd containing filter,sort etc
            //EXECUTE
           
     //Here we create a new object of the API features class in there we are passing a query object and a query string comming from express
     //Then each of the above 4 methods we use to manipulate the query 
     //And by the end we simply await for the query so that it can come with all the documents we have selected
            const doc=await features.query
            
        res.status(200).json({
            status:"success",        
            data:{
                data:doc
            }
        })
    
    })