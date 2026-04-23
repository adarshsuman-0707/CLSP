/**
 * sseEmitter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight in-process event bus for Server-Sent Events.
 *
 * Usage (from any controller):
 *   const { emitBookingEvent } = require('../utils/sseEmitter');
 *   emitBookingEvent('booking:new',    { serviceId, slotId, userId });
 *   emitBookingEvent('booking:status', { serviceId, slotId, status });
 *   emitBookingEvent('delivery:status',{ serviceId, slotId, status });
 *
 * The SSE route (GET /api/service/events) keeps a response stream open per
 * connected client and forwards matching events.
 */

const EventEmitter = require('events');

class SSEEmitter extends EventEmitter {}
const emitter = new SSEEmitter();
emitter.setMaxListeners(200); // allow many concurrent clients

/**
 * Emit a booking-related event to all SSE subscribers.
 * @param {string} type  - event type string
 * @param {object} payload - serialisable data
 */
const emitBookingEvent = (type, payload) => {
  emitter.emit('booking_event', { type, payload, ts: Date.now() });
};

module.exports = { emitter, emitBookingEvent };
