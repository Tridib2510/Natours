
const express=require('express')
const router=express.Router()
const tourController=require('./tourController')
const authController=require('./authentictionController')
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
module.exports=router