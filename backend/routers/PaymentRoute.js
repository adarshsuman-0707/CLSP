const Router=require('express')
const route=Router();
const authmiddleware=require('../middleware/authmiddleware.js')
const {MakePayment,VerifyPayment,GetPaymentDetail,DownloadPaymentPDF} =require('../PaymentController/Payment.js')
route.post('/MakePayment',authmiddleware,MakePayment);
route.post("/verify",authmiddleware, VerifyPayment);
route.get('/GetPaymentinfo',authmiddleware,GetPaymentDetail);
route.get('/:paymentId/pdf',authmiddleware,DownloadPaymentPDF);
module.exports=route