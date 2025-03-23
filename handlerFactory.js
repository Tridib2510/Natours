const catchAsync=require('./utils/catchAsync')
const AppError=require('./utils/appError')

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


