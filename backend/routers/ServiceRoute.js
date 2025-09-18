const Router=require('express')
const route=Router();
const servicemiddleware=require('../middleware/servicemiddleware.js')
const authmiddleware=require('../middleware/authmiddleware.js')

// const adminMiddleware=require('../middleware/adminmiddleware.js')
const {addService,deleteSlotFromService, updateSlotBookingStatus,Allservices,bookServiceSlot,getBookingRequests}=require('../serviceController/Service.js')

route.get("/services",authmiddleware, Allservices);
route.post("/add/:creatorId",servicemiddleware, addService);
route.delete('/:serviceId/slots/:slotId',servicemiddleware, deleteSlotFromService);
route.patch('/:serviceId/slot/:slotId',servicemiddleware, updateSlotBookingStatus);
// route.post('/book/:serviceId/slot/:slotId',authmiddleware, bookServiceSlot);//
route.get('/:serviceId/requests',servicemiddleware, getBookingRequests);
// http://localhost:5000/api/service/67f138c257c06507c37acfa4/slot/67f138c257c06507c37acfa6]
// http://localhost:5000/api/service/book/68ab427422cc12409b294957/slot/68ab427422cc12409b294958


module.exports=route