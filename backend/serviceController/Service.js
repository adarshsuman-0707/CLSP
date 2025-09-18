// controllers/serviceController.js

const Service = require("../models/Service.js");

const User = require("../models/User.js");
const addService = async (req, res) => {
  try {
    const { creatorId } = req.params;

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
      createdBy: creatorId, // Using param now
    });

    const savedService = await newService.save();

    res.status(201).json({
      message: "Service created successfully",
      service: savedService,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  const Allservices=async(req,res)=>{
    try{
      const data=await Service.find();
      console.log(data,"find the services")

  if (!data) {
        return res.status(404).json({ message: "Service  not found" });
      }
  
      res.status(200).json({
        message: "Slot booking status updated successfully",
        data,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  const bookServiceSlot = async (req, res) => {
  try {
    const { serviceId, slotId } = req.params;
    const userId = req.user.id; // token se nikla
    console.log("Booking request:", { serviceId, slotId, userId });

    // Service fetch
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Slot find
    const slot = service.availableSlots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
 console.log(slot)
    if (slot.isBooked) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // Update slot
    slot.isBooked = true;
    slot.bookedBy = userId;

    await service.save();

    // User details fetch
    const user = await User.findById(userId).select("-password");

    res.json({
      message: "Service booked successfully!",
      booking: {
        serviceName: service.name,
        slot: {
          date: slot.date,
          time: slot.time,
        },
        user,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Service man ke liye slot requests dekhne ki API
const getBookingRequests = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Service ko fetch karna + populate user details
    const service = await Service.findById(serviceId)
      .populate("availableSlots.bookedBy", "name email phone"); 
      // ✅ yaha pe sirf ye fields ayengi

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Filter: Sirf booked slots
    const requests = service.availableSlots.filter(slot => slot.isBooked);

    res.status(200).json({
      message: "Booking requests fetched successfully",
      service: {
        _id: service._id,
        name: service.name,
        category: service.category,
      },
      requests: requests
    });

  } catch (err) {
    console.error("Error fetching booking requests:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { addService,deleteSlotFromService ,updateSlotBookingStatus,Allservices,bookServiceSlot,getBookingRequests};
