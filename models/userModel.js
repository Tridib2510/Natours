const mongoose=require('mongoose')
const validator=require('validator')
const bycrypt=require('bcryptjs')
const userSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true,'Please tell us your name']
  },
  email:{
    type:String,
    required:[true,'Please provide your email'],
    unique:true,
    lowercase:true,//Transforms the email to lowercase
    validate:[validator.isEmail,'Please provide a valid email']
    //Basically testing if an email is valid or not for this we use the 
    //validator package instead of making our own validator

    //#Node:Whenever we need a validator just check the documents 
    //to find a function instead of making our own function
  },
  photo:String,
  password:{
    type:String,
    required:[true,'Please provide a password'],
    minlength:8
    
  },
  passwordConfirm:{
    type:String,
    required:[true,'password needs to be confirmed'],
    validate:function(el){//To check if the typed password== confirm password
      //This only works for SAVE and not for only findOneAndUpdate
      //This only work on CREATE(user.create()) and SAVE(user.save()) to update
      return el===this.password
   },
   message:"Passwords are not the same"//Will be displayed when doesn't match password
  
  }
})
userSchema.pre('save',async function(next){
  //It should only work for signup or updating the password
  //It should not happen when the user only update the name or email and anything beside the password

  //This only run this function if password was actually modified
  if(!this.isModified('password'))return next()//Return's true if the specified field has been modified
  //So if the password has not been modified just call the next middleware

  //Encrypth the password(OR Hashing)
  //We will use a popular HashingAlgo called B Crypt
  //This alog will first salt and hash our password to protect us from brute force method
  //This will add random string to our password so that 2 equal password do not generate the same hash

  //Hash Password with cost 4
  this.password=await bycrypt.hash(this.password,4) //The second parameter is a cost parameter which is the measure of how CPU intensive this operation will be. And the defult value of this is 10
  //hash is an asynchronous function which return a promise which we need to await

  //Now we delete the confirm password because at this point in time we only have the real password hash
  
  //Delete passwordConfim field
  this.passwordConfirm=undefined
  //We can delete thsi field inspite of a validator being required is because
  //This validation is only for input 
  next()//

})
//We use a document middleware and user a pre hook on save
//The reason we are doing it like this is
//that the middleware function that we are going to specify here
//is going to happen between the moment we receive the date
//and the moment it is actually presisted to the database
//Between getting the data and saving it the pre save middle ware runs
const User=mongoose.model('User',userSchema)

module.exports=User
