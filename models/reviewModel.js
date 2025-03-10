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

//In Lec 156 we are going to populate both the user and the tour data






reviewScheme.pre(/^find/,function(next){ //vvi /^find/ should not be inside ''

    //Now the populate is creating a chain of populate which is not ideal for performance
   //So the solution we are going to use is actually turn off populating the review in the review model
   //With this the tour in the reviews of the tour document will not get populated
    
    // this.populate({
    //     path:'tour',
    //     select:'name'
    // }).populate({
    //     path:'user',
    //     select:'name photo' //Will only display name and photo
    // })



    
    this.populate({
        path:'user',
        select:'name photo' //Will only display name and photo
    })
    
    next()
})
//This one is going to add some extra query and in this case it is just 2 query.
//Here the mongoose has to query both the users and the tours in order to find our documents


const Review=mongoose.model('Review',reviewScheme)

module.exports=Review

//A review must belong to a tour and must also have an author .So we are going to implemet parent referencing in this case


//In Lec 155 we arre going to continue implementing the review resource.We are going to implement a end point for getting our reveiws and 
//also for creating new reviews