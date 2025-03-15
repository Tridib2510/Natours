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


