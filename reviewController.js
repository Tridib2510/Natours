const Review=require('./models/reviewModel')
const catchAsync=require('./utils/catchAsync')

exports.getAllReviews=catchAsync(async (req,res,next)=>{
    const review=await Review.find()

    res.status(200).json({
        status:'success',
        results:review.length,
        data:{
            review
        }
    })
})

exports.createReview=catchAsync(async(req,res,next)=>{
    console.log('Test case passed')
    //Allow nested routes
    //This make it so that the user can still manually specify the user and the tour id manually and if he doesn't then 
    //it is done by the code below
    //console.log(req.user)
    if(!req.body.tour)req.body.tour=req.params.tourId
    if(!req.body.user)req.body.user=req.user._id
    const newReview=await Review.create(req.body)

    res.status(201).json({
        status:"success",
        data:{
            review:newReview
        }
    })
})
