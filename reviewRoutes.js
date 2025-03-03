const express=require('express')

const reviewController=require('./reviewController')
const authController=require('./authentictionController')

const router=express()

router.route('/')
.get(authController.protect,authController.restrictTo('user'),reviewController.getAllReviews)
.post(authController.protect,authController.restrictTo('user'),reviewController.createReview)

//We want only the regular users to be able to leave a review and not administrators or tourguides 
//We achieve this by using the restrictTo middleware from authController

module.exports=router