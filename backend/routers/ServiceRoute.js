const Router=require('express')
const route=Router();
const servicemiddleware=require('../middleware/servicemiddleware.js')
const authmiddleware=require('../middleware/authmiddleware.js')
const { emitter } = require('../utils/sseEmitter.js');

const {
  addService,
  deleteSlotFromService,
  updateService, 
  updateSlotBookingStatus,
  Allservices,
  updateSlotStatus,
  getBookingRequests,
  addServiceSlot,
  DeliveryServiceStatus,
  getuserReview,
  deleteService,        // ✅ NEW
  getVendorServices     // ✅ NEW
} = require('../serviceController/Service.js')

// ── SSE: real-time booking events ─────────────────────────────────────────────
// GET /api/service/events  (must be before /:serviceId routes)
route.get('/events', authmiddleware, (req, res) => {
  // Set SSE headers explicitly — must be done before flushHeaders()
  // Also set CORS here directly so helmet/cors middleware don't interfere
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders();

  console.log(`✅ SSE client connected: user=${req.user?._id} role=${req.user?.role}`);

  // Immediately send a connected confirmation so the client knows it's live
  res.write(`data: ${JSON.stringify({ type: 'connected', ts: Date.now() })}\n\n`);

  // Heartbeat every 25 s to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  // Forward every booking event to this client
  const onEvent = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  emitter.on('booking_event', onEvent);

  // Clean up when client disconnects
  req.on('close', () => {
    console.log(`🔌 SSE client disconnected: user=${req.user?._id}`);
    clearInterval(heartbeat);
    emitter.off('booking_event', onEvent);
  });
});

// ✅ NEW: Get vendor's own services
route.get("/vendor/my-services", servicemiddleware, getVendorServices);

route.get("/services", authmiddleware, Allservices);
route.post("/add/:creatorId", servicemiddleware, addService);
route.delete('/:serviceId/slots/:slotId', servicemiddleware, deleteSlotFromService);
route.patch('/:serviceId/slot/:slotId', servicemiddleware, updateSlotBookingStatus);
route.get('/:serviceId/requests', servicemiddleware, getBookingRequests);
route.put("/:serviceId/slot/:slotId/status", servicemiddleware, updateSlotStatus);
route.post("/:serviceId/slots", servicemiddleware, addServiceSlot);
route.put("/:serviceId/slot/:slotId/delivery", servicemiddleware, DeliveryServiceStatus);
route.get('/service/getReviewDetails', servicemiddleware, getuserReview)
route.put("/:serviceId", updateService);

// ✅ NEW: Delete service (must be after specific routes)
route.delete("/:serviceId", servicemiddleware, deleteService);

module.exports=route