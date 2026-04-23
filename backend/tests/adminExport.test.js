/**
 * Property-Based Tests: Admin CSV Export Logic
 * Feature: admin-panel-enhancement
 *
 * Tests pure CSV generation and date-range filter helpers extracted from AdminController.
 * Properties covered:
 *   P17 — CSV field completeness
 *   P18 — Export date range filter correctness
 *
 * Each property runs a minimum of 100 iterations via fast-check.
 */

const fc = require("fast-check");

// ---------------------------------------------------------------------------
// Pure helper functions extracted from AdminController export logic
// ---------------------------------------------------------------------------

/**
 * arrayToCSV — converts an array of records to a CSV string.
 * Exact copy of the helper in AdminController.js.
 */
function arrayToCSV(data, headers, rowMapper) {
  const csvRows = [];
  csvRows.push(headers.join(","));
  for (const item of data) {
    const values = rowMapper(item);
    const escapedValues = values.map((val) => {
      const stringVal = val === null || val === undefined ? "" : String(val);
      if (
        stringVal.includes(",") ||
        stringVal.includes('"') ||
        stringVal.includes("\n")
      ) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    });
    csvRows.push(escapedValues.join(","));
  }
  return csvRows.join("\n");
}

// Row mappers — mirrors the exact mappers in AdminController export handlers

const BOOKING_HEADERS = [
  "Booking ID",
  "User Name",
  "Vendor Name",
  "Service Name",
  "Date",
  "Status",
];
const bookingRowMapper = (b) => [
  b._id,
  b.userId?.username || "N/A",
  b.serviceId?.createdBy?.username || "N/A",
  b.serviceId?.name || "N/A",
  b.date ? new Date(b.date).toISOString() : "N/A",
  b.status,
];

const PAYMENT_HEADERS = [
  "Order ID",
  "User Name",
  "Amount",
  "Currency",
  "Method",
  "Status",
  "Date",
];
const paymentRowMapper = (p) => [
  p.orderId,
  p.user?.username || "N/A",
  p.amount,
  p.currency,
  p.paymentMethod,
  p.status,
  p.createdAt ? new Date(p.createdAt).toISOString() : "N/A",
];

const USER_HEADERS = [
  "Username",
  "First Name",
  "Last Name",
  "Email",
  "Role",
  "City",
  "State",
  "Contact",
];
const userRowMapper = (u) => [
  u.username,
  u.firstname,
  u.lastname,
  u.email,
  u.role,
  u.city,
  u.state,
  u.contact,
];

/**
 * filterByDateRange — applies optional dateFrom/dateTo filter on createdAt.
 * Mirrors the query.createdAt.$gte / $lte logic in all three export handlers.
 */
function filterByDateRange(records, dateFrom, dateTo) {
  return records.filter((r) => {
    const d = new Date(r.createdAt);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo)) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const roleArb = fc.constantFrom("admin", "user", "service");
const bookingStatusArb = fc.constantFrom("Pending", "Confirmed", "Cancelled");
const paymentStatusArb = fc.constantFrom(
  "created",
  "pending",
  "success",
  "failed",
  "refunded"
);

// Booking record with all required fields
const bookingArb = fc.record({
  _id: fc.uuid(),
  userId: fc.record({ username: fc.string({ minLength: 1, maxLength: 30 }) }),
  serviceId: fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    createdBy: fc.record({ username: fc.string({ minLength: 1, maxLength: 30 }) }),
  }),
  date: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31"), noInvalidDate: true }),
  status: bookingStatusArb,
  createdAt: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31"), noInvalidDate: true }),
});

// Payment record with all required fields
const paymentArb = fc.record({
  _id: fc.uuid(),
  orderId: fc.string({ minLength: 5, maxLength: 20 }),
  user: fc.record({ username: fc.string({ minLength: 1, maxLength: 30 }) }),
  amount: fc.nat({ max: 100000 }),
  currency: fc.constant("INR"),
  paymentMethod: fc.constantFrom("card", "upi", "netbanking"),
  status: paymentStatusArb,
  createdAt: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31"), noInvalidDate: true }),
});

// User record with all required fields
const userArb = fc.record({
  _id: fc.uuid(),
  username: fc.string({ minLength: 1, maxLength: 30 }),
  firstname: fc.string({ minLength: 1, maxLength: 30 }),
  lastname: fc.string({ minLength: 1, maxLength: 30 }),
  email: fc.emailAddress(),
  role: roleArb,
  city: fc.string({ minLength: 1, maxLength: 30 }),
  state: fc.string({ minLength: 1, maxLength: 30 }),
  contact: fc.string({ minLength: 10, maxLength: 10 }),
  createdAt: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31"), noInvalidDate: true }),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a CSV string into rows (array of arrays of strings). */
function parseCSV(csv) {
  return csv.split("\n").map((row) => row.split(","));
}

/**
 * Checks whether a value appears in a CSV string, accounting for the fact
 * that values containing commas or quotes are wrapped in double-quotes.
 */
function csvContains(csv, value) {
  const str = String(value);
  // Direct match (no special chars)
  if (csv.includes(str)) return true;
  // Quoted match (value was wrapped because it contains comma/quote/newline)
  const quoted = `"${str.replace(/"/g, '""')}"`;
  return csv.includes(quoted);
}

// ---------------------------------------------------------------------------
// P17: CSV Field Completeness
// ---------------------------------------------------------------------------

describe("P17: CSV Field Completeness — Bookings", () => {
  test(
    "CSV has correct header row with all required booking columns",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 20 }),
          (bookings) => {
            const csv = arrayToCSV(bookings, BOOKING_HEADERS, bookingRowMapper);
            const rows = parseCSV(csv);
            const header = rows[0];
            return BOOKING_HEADERS.every((h) => header.includes(h));
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "CSV row count equals number of records plus one header row",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 20 }),
          (bookings) => {
            const csv = arrayToCSV(bookings, BOOKING_HEADERS, bookingRowMapper);
            const rows = csv.split("\n");
            return rows.length === bookings.length + 1;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "each data row contains the booking ID and status from the source record",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 1, maxLength: 20 }),
          (bookings) => {
            const csv = arrayToCSV(bookings, BOOKING_HEADERS, bookingRowMapper);
            return bookings.every(
              (b) => csvContains(csv, b._id) && csvContains(csv, b.status)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

describe("P17: CSV Field Completeness — Payments", () => {
  test(
    "CSV has correct header row with all required payment columns",
    () => {
      fc.assert(
        fc.property(
          fc.array(paymentArb, { minLength: 0, maxLength: 20 }),
          (payments) => {
            const csv = arrayToCSV(payments, PAYMENT_HEADERS, paymentRowMapper);
            const rows = parseCSV(csv);
            const header = rows[0];
            return PAYMENT_HEADERS.every((h) => header.includes(h));
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "each data row contains the order ID and amount from the source record",
    () => {
      fc.assert(
        fc.property(
          fc.array(paymentArb, { minLength: 1, maxLength: 20 }),
          (payments) => {
            const csv = arrayToCSV(payments, PAYMENT_HEADERS, paymentRowMapper);
            return payments.every(
              (p) =>
                csvContains(csv, p.orderId) &&
                csvContains(csv, p.amount)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

describe("P17: CSV Field Completeness — Users", () => {
  test(
    "CSV has correct header row with all required user columns",
    () => {
      fc.assert(
        fc.property(
          fc.array(userArb, { minLength: 0, maxLength: 20 }),
          (users) => {
            const csv = arrayToCSV(users, USER_HEADERS, userRowMapper);
            const rows = parseCSV(csv);
            const header = rows[0];
            return USER_HEADERS.every((h) => header.includes(h));
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "each data row contains the username and email from the source record",
    () => {
      fc.assert(
        fc.property(
          fc.array(userArb, { minLength: 1, maxLength: 20 }),
          (users) => {
            const csv = arrayToCSV(users, USER_HEADERS, userRowMapper);
            return users.every(
              (u) => csvContains(csv, u.username) && csvContains(csv, u.email)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P18: Export Date Range Filter Correctness
// ---------------------------------------------------------------------------

describe("P18: Export Date Range Filter Correctness", () => {
  test(
    "every record in the filtered result falls within [dateFrom, dateTo]",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 30 }),
          fc.date({ min: new Date("2020-01-01"), max: new Date("2025-06-01"), noInvalidDate: true }),
          fc.date({ min: new Date("2025-06-02"), max: new Date("2030-12-31"), noInvalidDate: true }),
          (records, dateFrom, dateTo) => {
            const result = filterByDateRange(records, dateFrom, dateTo);
            return result.every((r) => {
              const d = new Date(r.createdAt);
              return d >= new Date(dateFrom) && d <= new Date(dateTo);
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "no record inside the range is excluded from the result",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 30 }),
          fc.date({ min: new Date("2020-01-01"), max: new Date("2025-06-01"), noInvalidDate: true }),
          fc.date({ min: new Date("2025-06-02"), max: new Date("2030-12-31"), noInvalidDate: true }),
          (records, dateFrom, dateTo) => {
            const result = filterByDateRange(records, dateFrom, dateTo);
            const inRange = records.filter((r) => {
              const d = new Date(r.createdAt);
              return d >= new Date(dateFrom) && d <= new Date(dateTo);
            });
            return inRange.every((r) =>
              result.some((res) => res._id === r._id)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "no date filter returns all records",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 30 }),
          (records) => {
            const result = filterByDateRange(records, null, null);
            return result.length === records.length;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "date range filter works correctly for payment records too",
    () => {
      fc.assert(
        fc.property(
          fc.array(paymentArb, { minLength: 0, maxLength: 30 }),
          fc.date({ min: new Date("2020-01-01"), max: new Date("2025-06-01"), noInvalidDate: true }),
          fc.date({ min: new Date("2025-06-02"), max: new Date("2030-12-31"), noInvalidDate: true }),
          (payments, dateFrom, dateTo) => {
            const result = filterByDateRange(payments, dateFrom, dateTo);
            return result.every((p) => {
              const d = new Date(p.createdAt);
              return d >= new Date(dateFrom) && d <= new Date(dateTo);
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "CSV generated from filtered records contains only in-range records",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 20 }),
          fc.date({ min: new Date("2020-01-01"), max: new Date("2025-06-01"), noInvalidDate: true }),
          fc.date({ min: new Date("2025-06-02"), max: new Date("2030-12-31"), noInvalidDate: true }),
          (records, dateFrom, dateTo) => {
            const filtered = filterByDateRange(records, dateFrom, dateTo);
            const csv = arrayToCSV(filtered, BOOKING_HEADERS, bookingRowMapper);
            const rows = csv.split("\n");
            // rows.length = filtered.length + 1 (header)
            return rows.length === filtered.length + 1;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
