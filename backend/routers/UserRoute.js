const Router=require('express')
const route=Router();
const authMiddleware=require('../middleware/authmiddleware.js')
// const adminMiddleware=require('../middleware/adminmiddleware.js')
const {userProfile,userDataUpdate,userDeleteProfile}=require('../UserController/UserDash.js')
const {bookServiceSlot}=require('../serviceController/Service.js')

route.get('/userProfile',authMiddleware,userProfile)
route.post('/updateUser',authMiddleware,userDataUpdate)
route.delete('/deleteProfile/:id',authMiddleware,userDeleteProfile)
route.post('/book/:serviceId/slot/:slotId',authMiddleware, bookServiceSlot);


module.exports=route