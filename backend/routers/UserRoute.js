const Router=require('express')
const route=Router();
const authMiddleware=require('../middleware/authmiddleware.js')
// const adminMiddleware=require('../middleware/adminmiddleware.js')
const {userProfile,userDataUpdate,userDeleteProfile,UserSavedService,getUserSavedServices,removeSavedService}=require('../UserController/UserDash.js')
const {bookServiceSlot}=require('../serviceController/Service.js')

route.get('/userProfile',authMiddleware,userProfile);
route.post('/updateUser',authMiddleware,userDataUpdate);
route.delete('/deleteProfile/:id',authMiddleware,userDeleteProfile);
route.post('/book/:serviceId/slot/:slotId',authMiddleware, bookServiceSlot);
route.post('/saveService/:serviceId',authMiddleware,UserSavedService);
route.get('/getUserSavedService',authMiddleware,getUserSavedServices);
route.delete('/removeSavedService/:serviceId',authMiddleware,removeSavedService);
//http://localhost:5000/api/user/removeSavedService/68ab405722cc12409b294942
module.exports=route