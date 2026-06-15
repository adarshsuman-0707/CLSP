
const express = require('express');
const cors=require('cors') // frontend and backend communication
require('./db/connect.js')
const helmet=require('helmet') // security for http header
require('dotenv'); // Load environment variables from .env file
const multer=require('multer') //image store in server
const ImageModel=require('./models/image.js')
const path=require('path')// path module for handling file paths

const AuthRoutes =require('./routers/AuthRoutes.js')
const UserRoutes=require('./routers/UserRoute.js')
const serviceRoutes=require('./routers/ServiceRoute.js')
const NotificationRoutes=require('./routers/NotificationRoutes.js')
const Payment=require('./routers/PaymentRoute.js')
const VendorRoutes=require('./routers/VendorRoute.js')
const PackageRoutes=require('./routers/PackageRoute.js')
const InvoiceRoutes=require('./routers/InvoiceRoute.js')
const AdminRoutes=require('./routers/AdminRoute.js')
const app=express(); // create express app
// middleware heres
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({extended:false}));// for parsing application/x-www-form-urlencoded basically post data from frontend to backend 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('uploads'))

// app.use(cors()) // for cross origin resource sharing between frontend and backend
// app.use(cors({
//   origin:'https://plumberclsp.netlify.app',
//   methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
//   credentials: true
// }));
app.use(cors())
app.use(helmet())// for security of http header

//here setup for server side
app.set('view engine',"ejs")
// route middleware setting up 
 app.use('/api/auth',AuthRoutes); // for authentication related routes like login, register, logout
 app.use('/api/user',UserRoutes); // for user related routes like profile, update profile, delete profile, saved services, reviews, booking etc
 app.use('/api/service',serviceRoutes);// for service related routes like add service, update service, delete service, get services etc
 app.use('/api/Notification',NotificationRoutes);// for notification related routes like get notifications, mark as read, delete notifications etc
 app.use('/api/payment',Payment);// for payment related routes like create payment, verify payment, get payment history etc
 app.use('/api/vendors',VendorRoutes);// for vendor related routes like vendor registration, update vendor profile, delete vendor profile, get vendor details etc
 app.use('/api/packages',PackageRoutes);// for package related routes like add package, update package, delete package, get packages etc
 app.use('/api/invoice',InvoiceRoutes);// for invoice related routes like create invoice, get invoice details, download invoice etc
 app.use('/api/admin',AdminRoutes);// for admin related routes like admin login, get all users, get all services, get all vendors, get all packages, get all invoices etc
 const storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, './uploads')
   },
   filename: function (req, file, cb) {
     cb(null,Date.now() + '-' + file.originalname)
   }
 })
 
 const upload = multer({ storage })

 app.post("/profile/upload", upload.single("image"), async (req, res) => {
   try {
     if (!req.file) return res.status(400).json({ message: "No file uploaded" });
 
     const { filename, path } = req.file;
     const image = new ImageModel({ filename, path });
 
     await image.save();
 
     res.status(201).json({
       message: "Image uploaded successfully",
       image: {
         filename,
         url: `/uploads/${filename}` // Optional: URL to serve image
       }
     });
   } catch (error) {
     console.error("Upload error:", error);
     res.status(500).json({ message: "Image upload failed", error: error.message });
   }
 });
 app.get('/files/:id', async (req, res) => {
   try {
     const image = await ImageModel.findById(req.params.id);
     if (!image) return res.status(404).send('Image not found');
 
     const imagePath = path.join(__dirname, "uploads", image.filename);
     res.sendFile(imagePath);
   } catch (e) {
     console.error(e);
     res.status(500).send('Error retrieving image');
   }
 });

const port=5001;
 app.listen(port,()=>{
    console.log("Server Run on port" +port);
 })