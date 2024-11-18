const User=require('./models/userModel')
const catchAsync=require('./utils/catchAsync')
exports.signup=catchAsync(async (req,res,next)=>{ //We wrap this function in catchAsynch so that we do not need to write catch block everytime
    const newUser=await User.create(req.body)
   res.status(201).json({
    status:"success",
    data:{
        user:newUser
    }
   })
})