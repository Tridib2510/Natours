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