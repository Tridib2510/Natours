
const express=require('express')
const router=express.Router()
const tourController=require('./tourController')
const authController=require('./authentictionController')
const reviewController=require('./reviewController')
const reviewRouter=require('./reviewRoutes')
 // router.param('id',tourController.CheckId)
router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTour)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)
router
.route('/')
.get(authController.protect,tourController.getAllTour)//If the user is not authenticated then there will be an error and the next middleware(which sends all of the tour )will not be send .So it protects the acess to the resources from users that are not logged in
.post(tourController.createTour)

router.route('/tour-stats').get(tourController.getTourStats)

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour)
//First we need to check if the user is actaully logged in 
//So if an administrator is actually trying to delete a tour 
//We need to check if he is actually logged in

//.restrictTo() is the function in which we are going to pass some user
//roles we authorize to interect with the resource(For this deleting a tour)

//Here the admin and lead-guide are the only ones who are authorized to delete the tour




//In Lec 158 we observer that when creating a review we always manually pass the tour and the user_id in the req body but 
//in real world the user_id should come from the currently logged in user and the tour id should come from current tour
//So when submitting a post review we are going to submit it to the url
//POST->URL=tour/tourId/reviews 
//So from the url we can find the current tour _id and we get the current logged in user's _id
//This nested route means that we want to access the reviews resource on the tour resource

//Some more nested routes are
//GET->tour/tourId/reviews .Here we get all the reviews in tour with ID=tourId
//GET->tour/tourId/reviews/reviewsId . Here we get the review  with id=reviews id from the tour with ID=tourId

// router.route('/:tourId/reviews')
// .post(authController.protect,authController.restrictTo('user'),reviewController.createReview)


router.use('/:tourId/reviews',reviewRouter)//This is basically mounting a router like we did in app.js

module.exports=router

