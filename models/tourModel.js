const mongoose=require('mongoose')

const user=require('./userModel')

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
        //required:[true,'A tour must have a description']
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
    },
    //Our location data will be embedded in the tours so we are basically gonna declare anything realated to the location in our tour model
//MongoDB supports geospatial data which is basically data that basically describes places on earth based on logitudes and latitudes
//MongoDB uses a special data format called GeoJSON which is basically a special format for specifying geospatial data
startLocation:{
    type:{
       type:String,
       default:'Point',//We can specify multiple geometry in mongodb like polygons ,lines etc but the default is point
       enum:['Point']//We want to make sure that this is the only option
    },
    coordinates:[Number],//This array is expects the coordinates with the logitude first and the  the latitude
    address:String,
    description:String,
 //So in order to specify geospacial data with MongoDB we need to create a object and that object should have atleast 2 field names coordinates and type

 //In order to really create new documents and then embed them into a othe document we need to actually create an array

 //In this array where we are going to specify the objects
 locations:[
    {
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number//The day on which people are going to go to that location

    }
 ],
 

    

},
//guides:Array//For embedding
guides:[
 {
    type:mongoose.Schema.ObjectId,//We expect the type of each of the element to be a mongoDB id
    ref:'User'//This is how we establish references to a other dataset in mongoose and for this we do not even need the 'User' to be imported here
    //ref should the model name of users model
//So the id's get saved in the guides and not the whole users document 
//Now we will take care such that the user data actually shows up . We will do that in two different ways.We are going to use a process called populating
} 
],
},{
    
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    //Each time that the data is outputed as JSON we want the virtuals to be true
})
//Virtual Property
tourSchema.virtual('durationWeeks').get(function(){
    console.log(this.duration/7)
    return this.duration/7
})
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

// tourSchema.pre('save',async function(next){
//     //We will loop through all the user id's and then for each iteration get the user document for the current id
//     //and we are going to store that inside of guides
//     console.log(this.guides)  
//     const guidesPromise=this.guides.map(async id=>await user.findById(id))
//     //a asynchronous functin returns an promise and the guides array is basically an array of promises

//     this.guides=await Promise.all(guidesPromise)//We use Promise.all() as the result of the map function is an array of promises
//     next()
// })//This only works for creating new documents and not for updating the documents however we are not going to do the same thing for updates 
//As there are some draw backs ex->A tour guides has email address or they change the role from guide to Lead-guide .Every time such changes occur
//Then we have to check if the tour has that user as a guide then we have to update the tour document as well



//Now we connect tours and users via referencing .This time in this video the idea is that tours and users will remain completely seperate entities 
//in our database

//Using virtual poplulate
//We would use this populate only on getOneTour and not getAllTour
tourSchema.virtual('reviews',{
    ref:'Review',
    //Here we have to specify 2 fields the foreign field and the local field
    foreignField:'tour',//This is the name of the field in the other model ie review model in this case
    //In our review modele we have a field called tour which references our tour model
    localField:'_id' //Here we have to specify where that id is currently stored in this model 
    //The tour model is called by _id in it's own model and it is refered to as tour in the review model
})


//We use the populate in query middleware for better structrue of our code
//This now works for both getAllTours and getTour (individually)
//This works for both creating and updating tours 



tourSchema.pre('/^find/',function(next){
    this.populate({
        path:'guides',
        select:'--v --passwordChangedAt'
    })
    next()
})//This query middleware works for everything that starts with find





const Tour=mongoose.model('Tour',tourSchema)
module.exports=Tour 

//In Lec 151 we are going to embed the user documents into the tour documents
//So when creating a new tour document the user will simply add an array of user ids and then we will get the correspoding user documents based on these id's 
//and add them to our tour documens

//In Lec 154 we will continue to translate the data model that we establish at the beginning of the section into some actual code
//This time we are going to implement the reviews model



//There is still one problem ie  how are going to access reviews on the tours
//This problem arises since we did parent referencing on the tour so the reviews pointing to the tour and not the tour pointing to the reviews
//In Lec 157 we are going to solve this
//So we are going to use a advance mongoosee feature called virtual populate. 
//With virtual populate we can actually populate the tour with reviews without persisting it in our database


