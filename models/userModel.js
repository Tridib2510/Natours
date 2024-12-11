const crypto=require('crypto')
const mongoose=require('mongoose')
const validator=require('validator')
const bycrypt=require('bcryptjs')
//const Date=require('date')
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
  role:{
   type:String,
   enum:['user','guide','lead-guide','admin'],//We use the enum validator so that only certain types of roles are specified
   //The user roles we are using will vary for different application 
   default:'user'//By default only this user will be created
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
  passwordChangedAt:Date,//This property will always be changed when someone changes his password
  passwordResetToken:String,
  passwordResetExpires:Date,//This token would expire after a certail period for security measure
  active:{//This is true if the user has not deleated his account else it is false
    type:Boolean,
    default:true,
    select:false
  }

})
//The below middleware is used to find the inacticve accountes(accounts which were deleted)
userSchema.pre(/^find/,function(next){//The regular expression '/^find/ finds regular expressions starting with 'find'

  //Before query is excecuted we want to add something which is that we only want to find the documents that has the active propery =true
this.find({active:{$ne:false}})
next()
})
//The below is used to implement password changedAt property below
userSchema.pre('save', async function(next){
//We only want it when we have modified the password property 
if(!this.isModified('password')||this.isNew){
    return next()
}
//So if the password is not modified then donot manipulate the password changedAt
//But what about creating the password?
//When we create a new document we did indeed modify the password then we would set the 'passwordChangedAt' property
//this.isNew checks if the document is new so we substract 1 second from the passwordChangedAt property

this.passwordChangedAt=Date.now()-1000
//Putting the passwordChangedAt -1 will always make sure that the token is created after the password has been changed
next()

//Sometimes saving to the database becomes much slower that issuing the JWT making is so that the 'changedPassword' timestamp is set 
//a bit after the jwt is created which will make is so that the user will not be able to log in using the new token
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
return bycrypt.compare(candidatePassword,userPassword)//compares candidatePassword and userPassword
}

     //In the user output we get the encrypted password output.It is not really a good practice to leak the 
     //password data to the client.
     //To fix it in the schemal in the password section we give
     //select:false 

     
      //To compare the password that the user has provided and the encrypted
    //password stored in the database we use the Bcrypt package
    //So we encrypt the login password and compare with the encrypted one
userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
 // console.log(this.passwordChangedAt,JWTTimestamp)
  //We have to create a field in our schema for the data when the password has been changed
  //and if the document has that passwordchangeAt propery only then we want to acutually do the comparison
  if(this.passwordChangedAt){
    //We need convert passwordChangedAt (which is not in milisecond format like JWTTimestamp format)
    //to a the passworwordChangedAt format
    const changedTimestamp=parseInt(this.passwordChangedAt.getTime())/1000//We divide it by thousands as it is thousands times more than JWTTimestamp.10 is a base .So our no is a base 10 number
    // console.log(this.passwordChangedAt,JWTTimestamp)
    
    return changedTimestamp>JWTTimestamp//ex->Suppose the token was issued at time 100 and we changed the password at time 200 
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

//Instance method for createPasswordResetToken for generating reset token
userSchema.methods.createPasswordResetToken=function(){
  //The password resetToken should basically be a random string 
  //but at the same time it does not need to be as criptographically strong 
  //So we use the random byte function from the random crypto module(Build in node module.So no need to install)

  //Generating our token
  const resetToken=crypto.randomBytes(32).toString('hex')//We are converting this into a hexadecimal string for better securtiy
  //The token is basically what we are going to send to the user
  //So it is a reset password really which the user can use to create a real new password 
  //And only the user will have acess to this token

  //Since it is actaully a passoword. So if a hacker can get acess to our database .
  //This would allow the hacker to gain acess to the account by setting new password
  //So if we just store this reset token in our database .Then if some attacker gain acess to our database
  //They can use that token to create a new password instead of you doing it .So they can activly control you account
  //So just like a password we should never store a plain reset token in our database
  //So we need to encrypt it

  this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')
  //We create has with this 'sha256' algo .Then  we need to say update and then the varaible
  //where the token is stored(Whatever string we want to encrypt basically)
  //And then we need to say digest then store it as a hexadecimal

  //We save this reset token in a new field in our database scehema.We need 
  //to store it in the database so that we can compare it with the token that
  //the user provide
  
 console.log({resetToken},this.passwordResetToken)

  this.passwordResetExpires=Date.now()+10*60*1000//(10*60*1000) is the added 10 minutes for which the token would work in milliseconds

  return resetToken//We return the plain text token which we are going to send through the email

  //Note:We only save sensitive data in encrypted form and then we compare 
  //     with the encrypted version in our database

  
}
const User=mongoose.model('User',userSchema)

module.exports=User
