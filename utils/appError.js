class AppError extends Error{
    constructor(message,statusCode){
      super(message)//Basically like calling error
      //By putting message in the argument we automatically set message property
      this.statusCode=statusCode
      this.status=`${statusCode}`.startsWith('4')?'fail':'error'//If status is error then status code will be 500 .Meaning starts with 5 else it starts with 4 which give staus=fail
     
    //Errors we will create using this class will be operational errors
    this.isOperational=true//Later we can test for this property and only send error message back to the client for this operational error that we create using this class.
    //This is useful as for some crazy programming error that might happen in our applicaion and those error will not have the this operational propery on them 
    
    Error.captureStackTrace(this,this.constructor)
}  //Error.captureStackTrace()-->Creates a .stack property on targetObject which when accessed
  //returns a string representing the location in the code at which Error.captureStackTrace() was called

    

}
module.exports=AppError