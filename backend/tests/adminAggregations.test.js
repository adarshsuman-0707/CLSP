/**
 * Property-Based Tests: Admin Aggregation Logic
 * Feature: admin-panel-enhancement
 *
 * Tests pure aggregation helper functions extracted from AdminController.
 * Properties covered:
 *   P8  — Revenue aggregation correctness
 *   P9  — Monthly revenue grouping correctness
 *   P10 — Top-N ranking correctness
 *   P15 — Payment status filter and summary correctness
 *   P20 — Unread badge count accuracy
 *
 * Each property runs a minimum of 100 iterations via fast-check.
 */

const fc = require("fast-check");

// ---------------------------------------------------------------------------
// Pure helper functions extracted from AdminController analytics logic
// ---------------------------------------------------------------------------

/**
 * P8 — Calculates total revenue from an array of payment records.
 * Only sums payments where status === "success".
 * Mirrors the $match + $group aggregation in getAnalytics().
 */
function calculateTotalRevenue(payments) {
  return payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);
}

/**
 * P9 — Groups successful payments by calendar month.
 * Returns an array of { month: 1-12, total: number } sorted by month.
 * Mirrors the monthly revenue aggregation pipeline in getAnalytics().
 */
function groupRevenueByMonth(payments) {
  const monthMap = {};
  payments
    .filter((p) => p.status === "success")
    .forEach((p) => {
      const month = new Date(p.createdAt).getMonth() + 1; // 1-indexed
      monthMap[month] = (monthMap[month] || 0) + p.amount;
    });
  return Object.entries(monthMap)
    .map(([month, total]) => ({ month: parseInt(month), total }))
    .sort((a, b) => a.month - b.month);
}

/**
 * P10 — Returns the top-N items from a ranked list, sorted descending by value.
 * Mirrors the $sort + $limit stage in top-services / top-vendors aggregations.
 */
function topN(items, n, getValue) {
  return [...items]
    .sort((a, b) => getValue(b) - getValue(a))
    .slice(0, n);
}

/**
 * P15 — Builds a per-status summary (count + totalAmount) from payment records.
 * Mirrors the $group aggregation in getPayments().
 */
function buildPaymentSummary(payments) {
  const summary = {};
  payments.forEach((p) => {
    if (!summary[p.status]) {
      summary[p.status] = { count: 0, totalAmount: 0 };
    }
    summary[p.status].count += 1;
    summary[p.status].totalAmount += p.amount;
  });
  return summary;
}

/**
 * P20 — Counts support messages with status === "pending".
 * Mirrors the SupportMessage.countDocuments({ status: "pending" }) call.
 */
function countUnreadMessages(messages) {
  return messages.filter((m) => m.status === "pending").length;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const paymentStatusArb = fc.constantFrom(
  "created",
  "pending",
  "success",
  "failed",
  "refunded"
);

const paymentArb = fc.record({
  _id: fc.uuid(),
  status: paymentStatusArb,
  amount: fc.nat({ max: 100000 }),
  createdAt: fc.date({ min: new Date("2024-01-01"), max: new Date("2024-12-31"), noInvalidDate: true }),
});

const successPaymentArb = fc.record({
  _id: fc.uuid(),
  status: fc.constant("success"),
  amount: fc.nat({ max: 100000 }),
  createdAt: fc.date({ min: new Date("2024-01-01"), max: new Date("2024-12-31"), noInvalidDate: true }),
});

const rankedItemArb = fc.record({
  id: fc.uuid(),
  value: fc.nat({ max: 10000 }),
});

const messageStatusArb = fc.constantFrom("pending", "replied");

const messageArb = fc.record({
  _id: fc.uuid(),
  status: messageStatusArb,
});

// ---------------------------------------------------------------------------
// P8: Revenue Aggregation Correctness
// ---------------------------------------------------------------------------

describe("P8: Revenue Aggregation Correctness", () => {
  test(
    "total revenue equals exact sum of success payment amounts",
    () => {
      fc.assert(
        fc.property(
          fc.array(paymentArb, { minLength: 0, maxLength: 50 }),
          (payments) => {
            const result = calculateTotalRevenue(payments);
            const expected = payments
              .filter((p) => p.status === "success")
              .reduce((sum, p) => sum + p.amount, 0);
            return result === expected;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "non-success payments are never included in revenue",
    () => {
      fc.assert(
        fc.property(
          fc.array(paymentArb, { minLength: 0, maxLength: 50 }),
          (payments) => {
            const nonSuccessTotal = payments
              .filter((p) => p.status !== "success")
              .reduce((sum, p) => sum + p.amount, 0);
            const successTotal = calculateTotalRevenue(payments);
            const allTotal = payments.reduce((sum, p) => sum + p.amount, 0);
            // successTotal + nonSuccessTotal must equal allTotal
            return successTotal + nonSuccessTotal === allTotal;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "revenue is 0 when there are no success payments",
    () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              _id: fc.uuid(),
              status: fc.constantFrom("created", "pending", "failed", "refunded"),
              amount: fc.nat({ max: 100000 }),
              createdAt: fc.date(),
            }),
            { minLength: 0, maxLength: 20 }
          ),
          (payments) => {
            return calculateTotalRevenue(payments) === 0;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P9: Monthly Revenue Grouping Correctness
// ---------------------------------------------------------------------------

describe("P9: Monthly Revenue Grouping Correctness", () => {
  test(
    "each month appears at most once in the result",
    () => {
      fc.assert(
        fc.property(
          fc.array(successPaymentArb, { minLength: 0, maxLength: 50 }),
          (payments) => {
            const result = groupRevenueByMonth(payments);
            const months = result.map((r) => r.month);
            return months.length === new Set(months).size;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "total for each month equals sum of success payment amounts in that month",
    () => {
      fc.assert(
        fc.property(
          fc.array(successPaymentArb, { minLength: 0, maxLength: 50 }),
          (payments) => {
            const result = groupRevenueByMonth(payments);
            return result.every((entry) => {
              const expected = payments
                .filter((p) => {
                  const m = new Date(p.createdAt).getMonth() + 1;
                  return p.status === "success" && m === entry.month;
                })
                .reduce((sum, p) => sum + p.amount, 0);
              return entry.total === expected;
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "result is sorted in ascending order by month",
    () => {
      fc.assert(
        fc.property(
          fc.array(successPaymentArb, { minLength: 0, maxLength: 50 }),
          (payments) => {
            const result = groupRevenueByMonth(payments);
            for (let i = 1; i < result.length; i++) {
              if (result[i].month <= result[i - 1].month) return false;
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "sum of all monthly totals equals total revenue",
    () => {
      fc.assert(
        fc.property(
          fc.array(successPaymentArb, { minLength: 0, maxLength: 50 }),
          (payments) => {
            const monthly = groupRevenueByMonth(payments);
            const monthlySum = monthly.reduce((s, e) => s + e.total, 0);
            const totalRevenue = calculateTotalRevenue(payments);
            return monthlySum === totalRevenue;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P10: Top-N Ranking Correctness
// ---------------------------------------------------------------------------

describe("P10: Top-N Ranking Correctness", () => {
  test(
    "result contains at most 5 items",
    () => {
      fc.assert(
        fc.property(
          fc.array(rankedItemArb, { minLength: 0, maxLength: 50 }),
          (items) => {
            const result = topN(items, 5, (i) => i.value);
            return result.length <= 5;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "result is sorted in descending order by value",
    () => {
      fc.assert(
        fc.property(
          fc.array(rankedItemArb, { minLength: 0, maxLength: 50 }),
          (items) => {
            const result = topN(items, 5, (i) => i.value);
            for (let i = 1; i < result.length; i++) {
              if (result[i].value > result[i - 1].value) return false;
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "no unranked item has a higher value than any ranked item",
    () => {
      fc.assert(
        fc.property(
          fc.array(rankedItemArb, { minLength: 6, maxLength: 50 }),
          (items) => {
            const result = topN(items, 5, (i) => i.value);
            const rankedIds = new Set(result.map((r) => r.id));
            const unranked = items.filter((i) => !rankedIds.has(i.id));
            const minRankedValue = Math.min(...result.map((r) => r.value));
            return unranked.every((u) => u.value <= minRankedValue);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "result length equals min(n, items.length)",
    () => {
      fc.assert(
        fc.property(
          fc.array(rankedItemArb, { minLength: 0, maxLength: 20 }),
          fc.integer({ min: 1, max: 10 }),
          (items, n) => {
            const result = topN(items, n, (i) => i.value);
            return result.length === Math.min(n, items.length);
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P15: Payment Status Filter and Summary Correctness
// ---------------------------------------------------------------------------

describe("P15: Payment Status Filter and Summary Correctness", () => {
  test(
    "count per status equals actual count of payments with that status",
    () => {
      fc.assert(
        fc.property(
          fc.array(paymentArb, { minLength: 0, maxLength: 50 }),
          (payments) => {
            const summary = buildPaymentSummary(payments);
            return Object.entries(summary).every(([status, { count }]) => {
              const actual = payments.filter((p) => p.status === status).length;
              return count === actual;
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "totalAmount per status equals sum of amounts for that status",
    () => {
      fc.assert(
        fc.property(
          fc.array(paymentArb, { minLength: 0, maxLength: 50 }),
          (payments) => {
            const summary = buildPaymentSummary(payments);
            return Object.entries(summary).every(([status, { totalAmount }]) => {
              const expected = payments
                .filter((p) => p.status === status)
                .reduce((sum, p) => sum + p.amount, 0);
              return totalAmount === expected;
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "sum of all status counts equals total payment count",
    () => {
      fc.assert(
        fc.property(
          fc.array(paymentArb, { minLength: 0, maxLength: 50 }),
          (payments) => {
            const summary = buildPaymentSummary(payments);
            const totalCount = Object.values(summary).reduce(
              (sum, { count }) => sum + count,
              0
            );
            return totalCount === payments.length;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P20: Unread Badge Count Accuracy
// ---------------------------------------------------------------------------

describe("P20: Unread Badge Count Accuracy", () => {
  test(
    "unread count equals exact count of pending messages",
    () => {
      fc.assert(
        fc.property(
          fc.array(messageArb, { minLength: 0, maxLength: 50 }),
          (messages) => {
            const result = countUnreadMessages(messages);
            const expected = messages.filter((m) => m.status === "pending").length;
            return result === expected;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "replied messages are never counted as unread",
    () => {
      fc.assert(
        fc.property(
          fc.array(messageArb, { minLength: 0, maxLength: 50 }),
          (messages) => {
            const unread = countUnreadMessages(messages);
            const repliedCount = messages.filter(
              (m) => m.status === "replied"
            ).length;
            return unread + repliedCount === messages.length;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "unread count is 0 when all messages are replied",
    () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({ _id: fc.uuid(), status: fc.constant("replied") }),
            { minLength: 0, maxLength: 30 }
          ),
          (messages) => {
            return countUnreadMessages(messages) === 0;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
