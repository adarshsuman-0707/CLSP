/**
 * Property-Based Tests: Admin Filter Logic
 * Feature: admin-panel-enhancement
 *
 * Tests pure filter helper functions extracted from AdminController.
 * Properties covered:
 *   P1  — User search filter correctness
 *   P4  — Vendor list role filter
 *   P6  — Booking status filter correctness
 *   P7  — Booking date range filter correctness
 *   P14 — Review rating filter correctness
 *
 * Each property runs a minimum of 100 iterations via fast-check.
 */

const fc = require("fast-check");

// ---------------------------------------------------------------------------
// Pure helper functions extracted from AdminController logic
// ---------------------------------------------------------------------------

/**
 * P1 — Filters users by username or email (case-insensitive substring match).
 * Mirrors the $or regex query built in getUserList().
 * The search string is escaped so arbitrary strings don't produce invalid regexes.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function filterUsersBySearch(users, search) {
  if (!search) return users;
  const regex = new RegExp(escapeRegex(search), "i");
  return users.filter(
    (u) => regex.test(u.username || "") || regex.test(u.email || "")
  );
}

/**
 * P4 — Filters a mixed-role user array to only vendors (role === "service").
 * Mirrors the { role: "service" } query in getVendorList().
 */
function filterVendors(users) {
  return users.filter((u) => u.role === "service");
}

/**
 * P6 — Filters bookings by status.
 * Mirrors the query.status assignment in getAllBookings().
 */
function filterBookingsByStatus(bookings, status) {
  if (!status) return bookings;
  return bookings.filter((b) => b.status === status);
}

/**
 * P7 — Filters bookings by createdAt date range [dateFrom, dateTo].
 * Mirrors the query.createdAt.$gte / $lte logic in getAllBookings().
 */
function filterBookingsByDateRange(bookings, dateFrom, dateTo) {
  return bookings.filter((b) => {
    const d = new Date(b.createdAt);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo)) return false;
    return true;
  });
}

/**
 * P14 — Filters reviews by exact rating value.
 * Mirrors the query.rating assignment in getReviews().
 */
function filterReviewsByRating(reviews, rating) {
  if (!rating) return reviews;
  return reviews.filter((r) => r.rating === rating);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const roleArb = fc.constantFrom("admin", "user", "service");
const bookingStatusArb = fc.constantFrom("Pending", "Confirmed", "Cancelled");
const ratingArb = fc.integer({ min: 1, max: 5 });

const userArb = fc.record({
  _id: fc.uuid(),
  username: fc.string({ minLength: 1, maxLength: 30 }),
  email: fc.emailAddress(),
  role: roleArb,
});

const bookingArb = fc.record({
  _id: fc.uuid(),
  status: bookingStatusArb,
  createdAt: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31"), noInvalidDate: true }),
});

const reviewArb = fc.record({
  _id: fc.uuid(),
  rating: ratingArb,
  title: fc.string({ minLength: 1, maxLength: 50 }),
});

// ---------------------------------------------------------------------------
// P1: User Search Filter Correctness
// ---------------------------------------------------------------------------

describe("P1: User Search Filter Correctness", () => {
  test(
    "every returned user matches the search query (username or email)",
    () => {
      fc.assert(
        fc.property(
          fc.array(userArb, { minLength: 0, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 15 }),
          (users, search) => {
            const result = filterUsersBySearch(users, search);
            const regex = new RegExp(escapeRegex(search), "i");
            return result.every(
              (u) => regex.test(u.username) || regex.test(u.email)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "no user that matches the query is excluded from results",
    () => {
      fc.assert(
        fc.property(
          fc.array(userArb, { minLength: 0, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 15 }),
          (users, search) => {
            const result = filterUsersBySearch(users, search);
            const regex = new RegExp(escapeRegex(search), "i");
            const matchingUsers = users.filter(
              (u) => regex.test(u.username) || regex.test(u.email)
            );
            return matchingUsers.every((u) =>
              result.some((r) => r._id === u._id)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "empty search returns all users unchanged",
    () => {
      fc.assert(
        fc.property(
          fc.array(userArb, { minLength: 0, maxLength: 30 }),
          (users) => {
            const result = filterUsersBySearch(users, "");
            return result.length === users.length;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P4: Vendor List Role Filter
// ---------------------------------------------------------------------------

describe("P4: Vendor List Role Filter", () => {
  test(
    "result contains only users with role 'service'",
    () => {
      fc.assert(
        fc.property(
          fc.array(userArb, { minLength: 0, maxLength: 30 }),
          (users) => {
            const vendors = filterVendors(users);
            return vendors.every((v) => v.role === "service");
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "result contains no users with role 'admin' or 'user'",
    () => {
      fc.assert(
        fc.property(
          fc.array(userArb, { minLength: 0, maxLength: 30 }),
          (users) => {
            const vendors = filterVendors(users);
            return vendors.every(
              (v) => v.role !== "admin" && v.role !== "user"
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "every service-role user in the input appears in the result",
    () => {
      fc.assert(
        fc.property(
          fc.array(userArb, { minLength: 0, maxLength: 30 }),
          (users) => {
            const vendors = filterVendors(users);
            const serviceUsers = users.filter((u) => u.role === "service");
            return serviceUsers.every((u) =>
              vendors.some((v) => v._id === u._id)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P6: Booking Status Filter Correctness
// ---------------------------------------------------------------------------

describe("P6: Booking Status Filter Correctness", () => {
  test(
    "every returned booking has the requested status",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 30 }),
          bookingStatusArb,
          (bookings, status) => {
            const result = filterBookingsByStatus(bookings, status);
            return result.every((b) => b.status === status);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "no booking with the requested status is excluded",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 30 }),
          bookingStatusArb,
          (bookings, status) => {
            const result = filterBookingsByStatus(bookings, status);
            const matching = bookings.filter((b) => b.status === status);
            return matching.every((b) =>
              result.some((r) => r._id === b._id)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "no status filter returns all bookings",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 30 }),
          (bookings) => {
            const result = filterBookingsByStatus(bookings, null);
            return result.length === bookings.length;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P7: Booking Date Range Filter Correctness
// ---------------------------------------------------------------------------

describe("P7: Booking Date Range Filter Correctness", () => {
  test(
    "every returned booking falls within [dateFrom, dateTo]",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 30 }),
          fc.date({ min: new Date("2020-01-01"), max: new Date("2025-06-01"), noInvalidDate: true }),
          fc.date({ min: new Date("2025-06-02"), max: new Date("2030-12-31"), noInvalidDate: true }),
          (bookings, dateFrom, dateTo) => {
            const result = filterBookingsByDateRange(
              bookings,
              dateFrom,
              dateTo
            );
            return result.every((b) => {
              const d = new Date(b.createdAt);
              return d >= new Date(dateFrom) && d <= new Date(dateTo);
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "no booking inside the range is excluded",
    () => {
      fc.assert(
        fc.property(
          fc.array(bookingArb, { minLength: 0, maxLength: 30 }),
          fc.date({ min: new Date("2020-01-01"), max: new Date("2025-06-01"), noInvalidDate: true }),
          fc.date({ min: new Date("2025-06-02"), max: new Date("2030-12-31"), noInvalidDate: true }),
          (bookings, dateFrom, dateTo) => {
            const result = filterBookingsByDateRange(
              bookings,
              dateFrom,
              dateTo
            );
            const inRange = bookings.filter((b) => {
              const d = new Date(b.createdAt);
              return d >= new Date(dateFrom) && d <= new Date(dateTo);
            });
            return inRange.every((b) =>
              result.some((r) => r._id === b._id)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P14: Review Rating Filter Correctness
// ---------------------------------------------------------------------------

describe("P14: Review Rating Filter Correctness", () => {
  test(
    "every returned review has the requested rating",
    () => {
      fc.assert(
        fc.property(
          fc.array(reviewArb, { minLength: 0, maxLength: 30 }),
          ratingArb,
          (reviews, rating) => {
            const result = filterReviewsByRating(reviews, rating);
            return result.every((r) => r.rating === rating);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "no review with the requested rating is excluded",
    () => {
      fc.assert(
        fc.property(
          fc.array(reviewArb, { minLength: 0, maxLength: 30 }),
          ratingArb,
          (reviews, rating) => {
            const result = filterReviewsByRating(reviews, rating);
            const matching = reviews.filter((r) => r.rating === rating);
            return matching.every((m) =>
              result.some((r) => r._id === m._id)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "no review with a different rating appears in the result",
    () => {
      fc.assert(
        fc.property(
          fc.array(reviewArb, { minLength: 0, maxLength: 30 }),
          ratingArb,
          (reviews, rating) => {
            const result = filterReviewsByRating(reviews, rating);
            return result.every((r) => r.rating === rating);
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
