const mongoose=require('mongoose')
const validator=require('validator')
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
    required:[true,'password needs to be confirmed']
  }
})

const User=mongoose.Model('User',userSchema)

module.exports=User