module.exports=fn=>{
    return(req,res,next)=>{//This is the function that express is going to call
  fn(req,res,next).catch(err=>next(err))
    }//Here createTour should be a fuction and not a result of calling a function
      //So catchAsync is called by createTour which then call fn function 
      //which is just the async function in createTour
      //So the solution is to basically make the catch async function return another 
      //function which is then assignend to createTour
      //So we return function
}
//Asynchronous functions return promises And when there is a promise inside 
//aynchronous function.It basically means that the promise gets rejected
//So when we call the function we catch the error