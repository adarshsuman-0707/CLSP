// controllers/serviceController.js

const Service = require("../models/Service.js");
const sendBookingStatusEmail=require('../utils/sendBookingStatusEmail.js')
const HistoryServiceDoneStatus = require("../models/History"); // adj
const User = require("../models/User.js");
const review = require("../models/reviewSchema.js");
const cron = require("node-cron");
const reviewSchema = require("../models/reviewSchema.js");
const { emitBookingEvent } = require('../utils/sseEmitter.js');
const addService = async (req, res) => {
  try {
    const { creatorId } = req.params;

    // ✅ Check if vendor is verified and not blocked
    const vendor = await User.findById(creatorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (!vendor.isVerified) {
      return res.status(403).json({ 
        success: false,
        message: "Your account is not verified yet. Please wait for admin approval before creating services." 
      });
    }

    if (vendor.isBlocked) {
      return res.status(403).json({ 
        success: false,
        message: "Your account has been suspended. Please contact admin for more information." 
      });
    }

    const {
      name,
      description,
      price,
      duration,
      category,
      availableSlots,
    } = req.body;

    const newService = new Service({
      name,
      description,
      price,
      duration,
      category,
      availableSlots, // Array of { date, time }
      createdBy: creatorId,
      approvalStatus: "pending", // ✅ Default to pending, admin will approve
    });

    const savedService = await newService.save();

    res.status(201).json({
      success: true,
      message: "Service created successfully. Waiting for admin approval.",
      service: savedService,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
const deleteSlotFromService = async (req, res) => {
  const { serviceId, slotId } = req.params;
  console.log(req.params);
  try {
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        $pull: { availableSlots: { _id: slotId } }
      },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      message: "Slot deleted successfully",
      service: updatedService
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateSlotBookingStatus = async (req, res) => {
  const { serviceId, slotId } = req.params;
  const { isBooked } = req.body;

  try {
    const service = await Service.findOneAndUpdate(
      { _id: serviceId, "availableSlots._id": slotId },
      {
        $set: {
          "availableSlots.$.isBooked": isBooked,
        },
      },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service or Slot not found" });
    }

    res.status(200).json({
      message: "Slot booking status updated successfully",
      service,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// const Allservices = async (req, res) => {
//   try {
//     const userRole = req.user?.role;
//     let query = {};

//     if (userRole === "user") {
//       // Users see only APPROVED services
//       query.approvalStatus = "approved";
//     } else if (userRole === "service") {
//       // Vendors see only their own services (all statuses)
//       query.createdBy = req.user._id;
//     }
//     // Admin sees all services — no filter

//     let data = await Service.find(query)
//       .populate('createdBy', 'firstname lastname email phone address pincode contact isVerified isBlocked')
//       .sort({ createdAt: -1 });

//     // For users: filter out services whose vendor is blocked/unverified AFTER populate
//     if (userRole === "user") {
//       data = data.filter(
//         (s) => s.createdBy && s.createdBy.isVerified === true && s.createdBy.isBlocked === false
//       );
//     }

//     res.status(200).json({
//       success: true,
//       message: "Services fetched successfully",
//       data,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// }


const Allservices = async (req, res) => {
  try {
    const userRole = req.user?.role;
    let query = {};

    if (userRole === "user") {
      // Users see only APPROVED services
      query.approvalStatus = "approved";
    } 
    else if (userRole === "service") {
      // Vendors see only their own services
      query.createdBy = req.user._id;
    }
    // Admin sees all services

    let data = await Service.find(query)
      .populate(
        "createdBy",
        "firstname lastname email phone address pincode contact isVerified isBlocked"
      )
      .sort({ createdAt: -1 });

    // Current date (today start time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    data = data
      .map((service) => {

        // Remove past slots
        service.availableSlots = service.availableSlots.filter((slot) => {
          const slotDate = new Date(slot.date);
          slotDate.setHours(0, 0, 0, 0);

          return slotDate >= today;
        });

        return service;
      })
      .filter((service) => {

        // Remove service if no slots available
        if (service.availableSlots.length === 0) {
          return false;
        }

        // Users cannot see blocked/unverified vendors
        if (userRole === "user") {
          return (
            service.createdBy &&
            service.createdBy.isVerified === true &&
            service.createdBy.isBlocked === false
          );
        }

        return true;
      });

    res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
const bookServiceSlot = async (req, res) => {
  try {
    const { serviceId, slotId } = req.params;
    const userId = req.user._id; // ✅ fixed: was req.user.id
    console.log("Booking/Cancel request:", { serviceId, slotId, userId });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const slot = service.availableSlots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // ── Cancel: only if booked by this user AND still pending ────────────────
    if (slot.isBooked && slot.bookedBy?.toString() === userId.toString()) {
      if (slot.bookingStatus === "Approved") {
        return res.status(400).json({
          message: "Cannot cancel — booking already accepted by serviceman.",
        });
      }

      // Reset slot to available but keep bookedBy for audit trail
      slot.isBooked = false;
      // Keep bookedBy for history
      slot.bookingStatus = "Rejected"; // mark as rejected (user cancelled)
      // Keep bookedAt for history

      await service.save();

      // 🔔 Notify all connected clients (serviceman's page will auto-refresh)
      emitBookingEvent('booking:cancelled', {
        serviceId,
        slotId,
        slot: { date: slot.date, time: slot.time },
      });

      return res.json({
        message: "Booking cancelled successfully!",
        cancelled: true,
        slot: { date: slot.date, time: slot.time },
      });
    }

    // ── Block: slot booked by someone else ────────────────────────────────────
    if (slot.isBooked && slot.bookedBy?.toString() !== userId.toString()) {
      return res.status(400).json({ message: "Slot already booked by another user." });
    }

    // ── Book: slot is free ────────────────────────────────────────────────────
    slot.isBooked = true;
    slot.bookedBy = userId;
    slot.bookingStatus = "pending";
    slot.bookedAt = new Date();

    await service.save();

    const user = await User.findById(userId).select("-password");

    // 🔔 Notify all connected clients (serviceman's page will auto-refresh)
    emitBookingEvent('booking:new', {
      serviceId,
      slotId,
      serviceName: service.name,
      slot: { date: slot.date, time: slot.time },
    });

    return res.json({
      message: "Service booked successfully!",
      booked: true,
      booking: {
        serviceName: service.name,
        slot: { date: slot.date, time: slot.time, status: slot.bookingStatus },
        user,
      },
    });
  } catch (error) {
    console.error("Booking/Cancel error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// // CRON JOB (runs every 1 minute, auto-confirm after exactly 2 min)
// cron.schedule("* * * * *", async () => {
//   try {
//     const now = new Date();
//     console.log("⏰ Cron running at:", now.toLocaleString());

//     // Fetch all services that have pending slots
//     const services = await Service.find({ "availableSlots.bookingStatus": "pending" });

//     for (const service of services) {
//       let updated = false;

//       service.availableSlots.forEach((slot) => {
//         if (slot.bookingStatus === "pending" && slot.bookedAt) {
//           const bookedTime = new Date(slot.bookedAt);
//           const diffMs = now.getTime() - bookedTime.getTime();

//           console.log(
//             `Slot ${slot._id}: bookedAt=${bookedTime.toLocaleTimeString()}, now=${now.toLocaleTimeString()}, diffMs=${diffMs}`
//           );

//           // Only approve if 2 min (120000 ms) or more have passed
//           if (diffMs >= 2 * 60 * 1000) {
//             slot.bookingStatus = "Approved"; // auto-confirm
//             updated = true;
//             console.log(`✅ Slot ${slot._id} auto-confirmed at ${now.toLocaleTimeString()}`);
//           }
//         }
//       });

//       if (updated) {
//         await service.save();
//       }
//     }
//   } catch (err) {
//     console.error("❌ Cron job error:", err);
//   }
// });

const getBookingRequests = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const vendorId = req.user._id;

    // ✅ Check if vendor is blocked
    const vendor = await User.findById(vendorId);
    if (vendor.isBlocked) {
      return res.status(403).json({ 
        success: false,
        message: "Your account has been suspended. You cannot access booking requests." 
      });
    }

    // Service ko fetch karna + populate user details
    const service = await Service.findById(serviceId)
      .populate("availableSlots.bookedBy", "firstname lastname email contact phone address pincode city state");

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // ✅ Verify that this service belongs to the logged-in vendor
    if (service.createdBy.toString() !== vendorId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "You are not authorized to view these booking requests." 
      });
    }

    // Filter: Sirf booked slots
    const requests = service.availableSlots.filter(slot => slot.isBooked);

    res.status(200).json({
      success: true,
      message: "Booking requests fetched successfully",
      service: {
        _id: service._id,
        name: service.name,
        category: service.category,
        approvalStatus: service.approvalStatus,
      },
      requests: requests
    });

  } catch (err) {
    console.error("Error fetching booking requests:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const updateSlotStatus = async (req, res) => {
  try {
    const { serviceId, slotId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be Approved or Rejected" });
    }

    const service = await Service.findById(serviceId)
      .populate("availableSlots.bookedBy", "firstname lastname email");

    if (!service) return res.status(404).json({ message: "Service not found" });

    // Only the service creator can accept/reject
    if (service.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the service provider can update booking status." });
    }

    const slot = service.availableSlots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (!slot.isBooked) {
      return res.status(400).json({ message: "Slot is not booked." });
    }

    slot.bookingStatus = status;

    // If rejected, free the slot so others can book
    // Keep bookedBy for audit trail (admin can still see who booked)
    if (status === 'Rejected') {
      slot.isBooked = false;
      // Do NOT null out bookedBy — keep for history/audit
    }

    await service.save();

    // Send email notification to user
    if (slot.bookedBy?.email) {
      await sendBookingStatusEmail(
        slot.bookedBy.email,
        status === 'Approved' ? 'Accepted' : 'Rejected',
        service.name,
        new Date().toLocaleString()
      );
    }

    res.status(200).json({
      message: `Booking ${status} successfully`,
      slot,
    });

    // 🔔 Notify all connected clients (user's page will auto-refresh)
    emitBookingEvent('booking:status', {
      serviceId,
      slotId,
      status,
      serviceName: service.name,
    });
  } catch (err) {
    console.error("Error updating slot status:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    // const userId = req.user._id; // login se aayega
    // console.log("Update request for service:", { serviceId, userId, body: req.body });
    // Extract fields from body that can be updated
    const { name, description, price, category, duration } = req.body;

    // 1. Fetch service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 2. Update only service details, leave slots intact
    if (name) service.name = name;
    if (description) service.description = description;
    if (price) service.price = price;
    if (category) service.category = category;
    if (duration) service.duration = duration;

    // 3. Save updated service
    await service.save();

    res.status(200).json({
      message: "Service updated successfully",
      service
    });

  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const addServiceSlot = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and Time are required" });
    }

    // Find service by ID
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Add slot to availableSlots
    service.availableSlots.push({
      date,
      time,
    });

    await service.save();

    return res.status(201).json({
      message: "Slot added successfully",
      service,
    });
  } catch (error) {
    console.error("Error adding slot:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const DeliveryServiceStatus=async(req,res)=>{
  try {
    const { serviceId, slotId } = req.params;
    const { status } = req.body;
    const userId = req.user._id; // 👈 login se aayeg
    console.log("Delivery status update request:", { serviceId, slotId, userId, status });
    console.log(status,"status")

    // 1. validate status
    if (!['completed', 'failed','pending'].includes(status)) {
      return res.status(400).json({ message: "Status must be completed , failed or pending" });
    } 
    // 2. service fetch karo
    const service = await Service.findById(serviceId).populate("availableSlots.bookedBy", "name email");
    if (!service) 
    {
      return res.status(404).json({ message: "Service not found" });
    }
    // 3. slot find karo
    const slot = service.availableSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    console.log(slot,"slot")
    // 4. check: only the serviceman (service creator) can update delivery
    if (service.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the service provider can update delivery status." });
    }
    if(status==="completed"){
    await sendBookingStatusEmail(
      slot.bookedBy.email,
      `Service Completed`,
      service.name, 
      new Date().toLocaleString()   // ✅ correct
    );

  }
  else{
    await sendBookingStatusEmail(
      slot.bookedBy.email,
      `Service Failed`,
      service.name, 
      new Date().toLocaleString()   // ✅ correct
    );
  }
    // 5. status update
    slot.ServiceDeliveryStatus = status;
    await service.save();
        if(status === "completed") {
      const historyData = {
        ServiceID: service._id,
        user: slot.bookedBy._id,
        serviceName: service.name,
        serviceDescription: service.description || "",
        serviceCategory: service.category || "",
        servicePrice: service.price || 0,
        serviceDuration: service.duration || "",
        serviceman: userId,
        servicemanName: req.user.firstname + " " + req.user.lastname,
        deliveryStatus: "completed",
        completedAt: new Date(),
       
      };
      console.log(historyData,"history data")
      await HistoryServiceDoneStatus.create(historyData);
    }
    res.status(200).json({
      message: "Service Delivery Status updated successfully",
      status: slot.ServiceDeliveryStatus
    });

    // 🔔 Notify all connected clients
    emitBookingEvent('delivery:status', {
      serviceId,
      slotId,
      status,
    });
  }
  catch (err) {

    console.error("Error updating slot status:", err);
    res.status(500).json({ message: "Something went wrong" });
  } 
};
const getuserReview = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Find all completed services for this serviceman
    const completedService = await HistoryServiceDoneStatus.find({ serviceman: userId });

    // 2️⃣ Extract all completed service IDs
    const completedServiceIds = completedService.map(service => service._id);

    // 3️⃣ Find all reviews linked to any of those service IDs
    const fetchedReview = await reviewSchema.find({
      reviewCardId: { $in: completedServiceIds }
    });

    // 4️⃣ Send response (same format as you wanted)
    res.status(200).json({
      completedServices: [completedService],
      fetchedReview
    });

  } catch (error) {
    console.error("Get Completed Deliveries Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ NEW: Delete Service
const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user._id;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Only creator can delete
    if (service.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "You are not authorized to delete this service" 
      });
    }

    // Check if any slot is booked and approved
    const hasActiveBookings = service.availableSlots.some(
      slot => slot.isBooked && slot.bookingStatus === "Approved"
    );

    if (hasActiveBookings) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot delete service with active approved bookings. Please complete or cancel them first." 
      });
    }

    await Service.findByIdAndDelete(serviceId);
    
    res.status(200).json({ 
      success: true,
      message: "Service deleted successfully" 
    });
  } catch (err) {
    console.error("Delete service error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ NEW: Get Vendor's Own Services
const getVendorServices = async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    const services = await Service.find({ createdBy: vendorId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Add booking stats for each service
    const servicesWithStats = services.map(service => {
      const totalSlots = service.availableSlots.length;
      const bookedSlots = service.availableSlots.filter(s => s.isBooked).length;
      const pendingRequests = service.availableSlots.filter(
        s => s.isBooked && s.bookingStatus === "pending"
      ).length;
      const completedBookings = service.availableSlots.filter(
        s => s.ServiceDeliveryStatus === "completed"
      ).length;

      return {
        ...service,
        stats: {
          totalSlots,
          bookedSlots,
          pendingRequests,
          completedBookings,
          availableSlots: totalSlots - bookedSlots
        }
      };
    });
    
    res.status(200).json({
      success: true,
      message: "Your services fetched successfully",
      data: servicesWithStats,
      count: servicesWithStats.length
    });
  } catch (err) {
    console.error("Get vendor services error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { 
  addService, 
  deleteSlotFromService, 
  updateSlotBookingStatus, 
  Allservices, 
  bookServiceSlot, 
  getBookingRequests,
  updateSlotStatus,
  updateService,
  addServiceSlot,
  DeliveryServiceStatus,
  getuserReview,
  deleteService,        // ✅ NEW
  getVendorServices     // ✅ NEW
};
