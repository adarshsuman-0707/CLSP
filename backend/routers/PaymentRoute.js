const Router=require('express')
const route=Router();
const authmiddleware=require('../middleware/authmiddleware.js')
const {MakePayment,VerifyPayment,SavePaymentDetails,GetPaymentDetail} =require('../PaymentController/Payment.js')
route.post('/MakePayment',MakePayment);
route.post("/verify", VerifyPayment);
route.post('/SavePaymentinfo',SavePaymentDetails);
route.get('/GetPaymentinfo',GetPaymentDetail);
module.exports=route