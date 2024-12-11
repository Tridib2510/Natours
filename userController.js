const catchAsync = require("./utils/catchAsync")
const User=require('./models/userModel')
const AppError=require('./utils/appError')
exports.checkBody=(req,res,next)=>{
    console.log("I am Tridib")
    next()
}
const filterObj=(obj,...allowedFields)=>{
//We are going to loop through the object and for each element check if it is one of the allowed fiels and if it is
//simply add to a new object and simply return it
const newObj={}

Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)){
        newObj[el]=obj[el]//new object with the field name of the current field should be equal to whatever is in the object at the current element
    }
})
return newObj
}
exports.updateMe=catchAsync(async(req,res,next)=>{
    //And we are udating the user data in a different route compared to the user password because that is how it is done in 
    //real web application
    
    //1)Create error if user POST's password data
    if(req.body.password||req.body.passwordConfirm){
        return next(new AppError('This route is not for password update .Please use /updateMyPassword',400))
    }
    

   //3)Filtered out unwanted field names that are not to be updated
    
   const filteredBody=filterObj(req.body,'name','email')//name and email are the only prop that we are giving permission to update currently
   

   //2)Update user document
    //We could try to do it with user.save() like before but the problem with that is that 
    //There are some fields that are recquired but are not updating because of that we will get validation errors
   const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{
    new:true,//This new options returns a new document
    runValidators:true
   })
    res.status(200).json({
        status:"success",
        data:{
            user:updatedUser
        }
    })

})

exports.deleteMe=catchAsync(async (req,res,next)=>{
   await User.findByIdAndUpdate(req.user._id,{active:false})
   res.status(204).json({//This 204 makes it so that the response is not even visible in postman but we still send the response since it is good practice
    status:"success",
    date:null

   })
   //At the end we need to make sure that in the response send to the cliend the inactice fields are not present
   //To solve this problem we are going to use the query middleware
})

exports.getAllUsers=catchAsync(async(req,res)=>{
    console.log("Testing 1")
    const user=await User.find()
    res.status(200).json({
        status:'success',
       results:user.length,
       data:{
        user
       }
    })

})
exports.getUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    })

}
exports.createUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    })

}
exports.deleteUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    })

}
exports.updateUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    })

}
