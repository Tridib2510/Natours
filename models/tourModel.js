const mongoose=require('mongoose')
const tourSchema=new mongoose.Schema({
    name:{
        type:String,//hello
        recquired:[true,"A tour must have a name"],
        unique:true,
        trim:true,
        maxlength:[40,'The length should greater than equal 40'],//new code
        minlength:[3,'The Name should be at least greater or equal to 3']
    },
    duration:{
     type:Number,
     required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
    type:Number,
    required:[true,'A tour must have ']
    },
    difficulty:{
        type:String,
         required:[true,'A tour must have a difficuly'],
        
    },
    ratingAverage:{
        type:Number,
        default:4.5
    },
    ratingsQuantity:{
        type:Number,
        defult:0
    },
    price:{
        type:Number,
        recquired:[true,"A tour must have a price"]
    },
    priceDiscount:Number,
    summery:{
        type:String,
        trim:true
        
    },
    description:{
        type:String,
        trim:true,
        required:[true,'A tour must have a description']
    },
    imageCenter:{
        type:String,
        // required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,//If this is a secret tour we don't want it to show up for the majority of clients
        default:false
    }
    

},{
    toJSON:{
        toJSON:{virtuals:true},
        toObj:{virtuals:true}
    }//Each time that the data is outputed as JSON we want the virtuals to be true
})
//Virtual Property
// tourSchema.virtual('durationWeeks').get(function(){
//     console.log(this.duration/7)
//     return this.duration/7
// })
//Document middle ware .It runs before the .save() and .create()
// tourSchema.pre(/^find/,function(next){
// //Here this points to the currently processed document

// this.start=Date.now();//we use this to set a start property on the query object
// next()
// })
// tourSchema.post(/^find/,function(next){
//     //Here this points to the currently processed document
    
    
//     console.log("Duration is "+(Date.now()-this.start))
//     next()
//     })
const Tour=mongoose.model('Tour',tourSchema)
module.exports=Tour //hey man