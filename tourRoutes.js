
const express=require('express')
const router=express.Router()
const tourController=require('./tourController')
 // router.param('id',tourController.CheckId)
router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTour)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)
router
.route('/')
.get(tourController.getAllTour)
.post(tourController.createTour)

router.route('/tour-stats').get(tourController.getTourStats)

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)

module.exports=router