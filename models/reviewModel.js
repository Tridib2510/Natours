const mongoose=require('mongoose')

const reviewScheme=new mongoose.Schema({
    review:{
        type:String,
        required:[true,'Review can not be empty'],

    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review must belong to a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'review must belong to a user']
    }
},{
    toJSON:{virtuals:true}, // All it does is to make sure that when we have a virtual property(a field which is not stored in the database) but calculated using some
    toObject:{virtuals:true}//other values .We want this to also show up whenever there is an output
})

//Now we will add options to the schema so that the virtual properties also show up in JSON and objects outputs

const Review=mongoose.model('Review',reviewScheme)

module.exports=Review

//A review must belong to a tour and must also have an author .So we are going to implemet parent referencing in this case


//In Lec 155 we arre going to continue implementing the review resource.We are going to implement a end point for getting our reveiws and 
//also for creating new reviews