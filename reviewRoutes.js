const express=require('express')

const reviewController=require('./reviewController')
const authController=require('./authentictionController')

//const router=express.Router()

//In lec 159 we are going to improve the nested route implementation
//We are going to use an advance express feature called mergeparams

const router=express.Router({mergeParams:true})

//mergeParams->By default each router has access to the parameters of only their specific routes
//To get access to the tourId/reviews in the other router(tourRoutes.js) we need mergeParams
//So basically for example->POST 23121245/reviews would be availabe in the handler function router.route('/')


router.route('/')
.get(authController.protect,authController.restrictTo('user'),reviewController.getAllReviews)
.post(authController.protect,authController.restrictTo('user'),reviewController.setTourUserIds,reviewController.createReview)

router.route('/:id').get(reviewController.getReview).patch(reviewController.updateReview).delete(reviewController.deleteReview)//For now we are not messing with authentication 
//We will take care of it later

//We want only the regular users to be able to leave a review and not administrators or tourguides 
//We achieve this by using the restrictTo middleware from authController

//Enabling the review router to get access to the paramter /tourId/reviews in tourRoutes.js

//In Lec 160 we are going to implement a nested GET end point
//All we need to do is just do some simple changes in the reviewController

module.exports=router