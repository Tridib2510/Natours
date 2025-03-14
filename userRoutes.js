const express=require('express')
const router=express.Router()
const userController=require('./userController')
const authController=require('./authentictionController')

router.post('/signup',authController.signup)
//This signup is kind of a special end point this doesn't fit the REST Architecture
//In this case it doesn't make much sense 
//But in some special cases It is okay to create other end points that does
//not follow the REST phylosophy
//For signUp we only need the POST http method
router.post('/login',authController.login)
//It would only receive the email address
router.post('/forgotPassword',authController.forgotPassword)
//It would receive the token as well as the new password
router.patch('/resetPassword/:token',authController.resetPassword)
router.patch('/updateMyPassword',authController.protect,authController.updatePassword)
//THE below route is used to delete our account
router.delete('/deleteMe',authController.protect,userController.deleteMe)
//The down route would update the details of the logged in user
router.patch('/updateMe',authController.protect,userController.updateMe)
router
.route('/')
.get(userController.getAllUsers)
.post(userController.checkBody,userController.createUser)

router
.route('/:id')  
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports=router
