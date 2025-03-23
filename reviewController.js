const Review=require('./models/reviewModel')
const catchAsync=require('./utils/catchAsync')

const factory=require('./handlerFactory')//This is the handle factory



exports.getAllReviews=catchAsync(async (req,res,next)=>{
   //We are goig to check if there is a tourId and if there is then we are going to search for reviews where the tour=tourId
   
   let filter={}
   //If the filter object is empty then we are going to get all the reviews
   if(req.params.tourId)filter={tour:req.params.tourId}
    
    const review=await Review.find(filter)

    res.status(200).json({
        status:'success',
        results:review.length,
        data:{
            review
        }
    })
})

// exports.createReview=catchAsync(async(req,res,next)=>{
    
//     //Allow nested routes
//     //This make it so that the user can still manually specify the user and the tour id manually and if he doesn't then 
//     //it is done by the code below
//     //console.log(req.user)
//     if(!req.body.tour)req.body.tour=req.params.tourId
//     if(!req.body.user)req.body.user=req.user._id
//     const newReview=await Review.create(req.body)

//     res.status(201).json({
//         status:"success",
//         data:{
//             review:newReview
//         }
//     })
// }) 
exports.setTourUserIds=(req,res,next)=>{
    if(!req.body.tour)req.body.tour=req.params.tourId
    if(!req.body.user)req.body.user=req.user._id
    next()
}

exports.createReview=factory.createOne(Review)


exports.updateReview=factory.updateOne(Review)
exports.deleteReview=factory.deleteOne(Review)
