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
    minlength:8,
    select:false//It will not show up any of the output
    
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
  
  },
  passwordChangedAt:Date//This property will always be changed when someone changes his password
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

//Function which checks if the given password is same as that one stored in 
//the document
//We use a instance method:It is a method which is available on all documents of a 
//certain collection 
userSchema.methods.correctPassword=function(candidatePassword,userPassword){
  //We pass the user password since use to the select option in the schema 
//this.password is not available
return bcrypt.compare(candidatePassword,userPassword)//compares candidatePassword and userPassword
}

     //In the user output we get the encrypted password output.It is not really a good practice to leak the 
     //password data to the client.
     //To fix it in the schemal in the password section we give
     //select:false 

     
      //To compare the password that the user has provided and the encrypted
    //password stored in the database we use the Bcrypt package
    //So we encrypt the login password and compare with the encrypted one
userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
  //We have to create a field in our schema for the data when the password has been changed
  //and if the document has that passwordchangeAt propery only then we want to acutually do the comparison
  if(this.passwordChangedAt){
    //We need convert passwordChangedAt (which is not in milisecond format like JWTTimestamp format)
    //to a the passworwordChangedAt format
    const changedTimestamp=parseInt(this.passwordChangedAt.getTime()/100,10)//We divide it by thousands as it is thousands times more than JWTTimestamp.10 is a base .So our no is a base 10 number
    // console.log(this.passwordChangedAt,JWTTimestamp)
    // console.log(changedTimestamp,JWTTimestamp)
    return JWTTimestamp<changedTimestamp//ex->Suppose the token was issued at time 100 and we changed the password at time 200 
    //100<200 this gives us true which is returned
    //Now lets's say that the password was changed at 200 but then only after that we isseed the token so 200<issuedTime so we return false

  }
//We will return false which means that the user has not changed his 
// password after the token was issued

//false means not changed 
//not changed means that the day or the time the token was issued is less than the TimeStamp
return false

}
//JWTTimestamp specify when the JWT was issued
const User=mongoose.model('User',userSchema)

module.exports=User
