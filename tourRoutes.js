
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

module.exports=router