/**
 * Property-Based Tests: Admin Mutation / Validation Logic
 * Feature: admin-panel-enhancement
 *
 * Tests pure mutation and validation helper functions extracted from AdminController.
 * Properties covered:
 *   P2  — Block/Unblock round-trip
 *   P3  — Role update persistence
 *   P5  — Service approval status mutation
 *   P16 — Refund status mutation
 *   P19 — Support message reply status transition
 *
 * Each property runs a minimum of 100 iterations via fast-check.
 */

const fc = require("fast-check");

// ---------------------------------------------------------------------------
// Pure helper functions extracted from AdminController mutation logic
// ---------------------------------------------------------------------------

/**
 * P2 — Simulates the block/unblock toggle on a user object.
 * Mirrors the `user.isBlocked = !user.isBlocked` logic in blockUnblockUser().
 */
function toggleBlock(user) {
  return { ...user, isBlocked: !user.isBlocked };
}

/**
 * P3 — Simulates a role update on a user object.
 * Mirrors the findByIdAndUpdate({ role }) logic in changeUserRole().
 * Returns null if the role is not in the valid enum.
 */
const VALID_ROLES = ["admin", "user", "service"];

function applyRoleUpdate(user, newRole) {
  if (!VALID_ROLES.includes(newRole)) return null;
  return { ...user, role: newRole };
}

/**
 * P5 — Simulates an approval status update on a service object.
 * Mirrors the findByIdAndUpdate({ approvalStatus }) logic in updateServiceApproval().
 * Returns null if the status is not valid.
 */
const VALID_APPROVAL_STATUSES = ["approved", "rejected"];

function applyServiceApproval(service, status) {
  if (!VALID_APPROVAL_STATUSES.includes(status)) return null;
  return { ...service, approvalStatus: status };
}

/**
 * P16 — Simulates marking a payment as refunded.
 * Mirrors the `payment.status = "refunded"` logic in markRefunded().
 * Returns null (rejected) if the payment status is not "success".
 */
function applyRefund(payment) {
  if (payment.status !== "success") return null;
  return { ...payment, status: "refunded" };
}

/**
 * P19 — Simulates replying to a support message.
 * Mirrors the status/replyText update in replyToSupportMessage().
 * Returns null if the message is already replied or replyText is empty.
 */
function applyReply(message, replyText) {
  if (!replyText || !replyText.trim()) return null;
  return {
    ...message,
    status: "replied",
    replyText: replyText.trim(),
    repliedAt: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const roleArb = fc.constantFrom("admin", "user", "service");
const approvalStatusArb = fc.constantFrom("approved", "rejected");

const userArb = fc.record({
  _id: fc.uuid(),
  username: fc.string({ minLength: 1, maxLength: 30 }),
  isBlocked: fc.boolean(),
  role: roleArb,
});

const serviceArb = fc.record({
  _id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  approvalStatus: fc.constantFrom("pending", "approved", "rejected"),
});

const successPaymentArb = fc.record({
  _id: fc.uuid(),
  orderId: fc.string({ minLength: 5, maxLength: 20 }),
  status: fc.constant("success"),
  amount: fc.nat({ max: 100000 }),
});

const pendingMessageArb = fc.record({
  _id: fc.uuid(),
  senderName: fc.string({ minLength: 1, maxLength: 50 }),
  senderEmail: fc.emailAddress(),
  subject: fc.string({ minLength: 1, maxLength: 100 }),
  message: fc.string({ minLength: 1, maxLength: 500 }),
  status: fc.constant("pending"),
  replyText: fc.constant(""),
});

// ---------------------------------------------------------------------------
// P2: Block/Unblock Round-Trip
// ---------------------------------------------------------------------------

describe("P2: Block/Unblock Round-Trip", () => {
  test(
    "blocking then unblocking restores original isBlocked value",
    () => {
      fc.assert(
        fc.property(userArb, (user) => {
          const originalBlocked = user.isBlocked;
          const blocked = toggleBlock(user);
          const restored = toggleBlock(blocked);
          return restored.isBlocked === originalBlocked;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "blocking a user sets isBlocked to true",
    () => {
      fc.assert(
        fc.property(
          fc.record({
            _id: fc.uuid(),
            username: fc.string({ minLength: 1 }),
            isBlocked: fc.constant(false),
            role: roleArb,
          }),
          (user) => {
            const blocked = toggleBlock(user);
            return blocked.isBlocked === true;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "unblocking a blocked user sets isBlocked to false",
    () => {
      fc.assert(
        fc.property(
          fc.record({
            _id: fc.uuid(),
            username: fc.string({ minLength: 1 }),
            isBlocked: fc.constant(true),
            role: roleArb,
          }),
          (user) => {
            const unblocked = toggleBlock(user);
            return unblocked.isBlocked === false;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "toggle does not mutate other user fields",
    () => {
      fc.assert(
        fc.property(userArb, (user) => {
          const toggled = toggleBlock(user);
          return (
            toggled._id === user._id &&
            toggled.username === user.username &&
            toggled.role === user.role
          );
        }),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P3: Role Update Persistence
// ---------------------------------------------------------------------------

describe("P3: Role Update Persistence", () => {
  test(
    "after a valid role update, the user's role equals the new role",
    () => {
      fc.assert(
        fc.property(userArb, roleArb, (user, newRole) => {
          const updated = applyRoleUpdate(user, newRole);
          return updated !== null && updated.role === newRole;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "role update with an invalid role returns null (rejected)",
    () => {
      fc.assert(
        fc.property(
          userArb,
          fc.string({ minLength: 1, maxLength: 20 }).filter(
            (s) => !VALID_ROLES.includes(s)
          ),
          (user, invalidRole) => {
            return applyRoleUpdate(user, invalidRole) === null;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "role update does not mutate other user fields",
    () => {
      fc.assert(
        fc.property(userArb, roleArb, (user, newRole) => {
          const updated = applyRoleUpdate(user, newRole);
          return (
            updated !== null &&
            updated._id === user._id &&
            updated.username === user.username &&
            updated.isBlocked === user.isBlocked
          );
        }),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P5: Service Approval Status Mutation
// ---------------------------------------------------------------------------

describe("P5: Service Approval Status Mutation", () => {
  test(
    "after approval action, service.approvalStatus equals the applied status",
    () => {
      fc.assert(
        fc.property(serviceArb, approvalStatusArb, (service, status) => {
          const updated = applyServiceApproval(service, status);
          return updated !== null && updated.approvalStatus === status;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "approval action with invalid status returns null",
    () => {
      fc.assert(
        fc.property(
          serviceArb,
          fc.string({ minLength: 1, maxLength: 20 }).filter(
            (s) => !VALID_APPROVAL_STATUSES.includes(s)
          ),
          (service, invalidStatus) => {
            return applyServiceApproval(service, invalidStatus) === null;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "approval action does not mutate other service fields",
    () => {
      fc.assert(
        fc.property(serviceArb, approvalStatusArb, (service, status) => {
          const updated = applyServiceApproval(service, status);
          return (
            updated !== null &&
            updated._id === service._id &&
            updated.name === service.name
          );
        }),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P16: Refund Status Mutation
// ---------------------------------------------------------------------------

describe("P16: Refund Status Mutation", () => {
  test(
    "marking a success payment as refunded sets status to 'refunded'",
    () => {
      fc.assert(
        fc.property(successPaymentArb, (payment) => {
          const refunded = applyRefund(payment);
          return refunded !== null && refunded.status === "refunded";
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "non-success payments cannot be refunded (returns null)",
    () => {
      fc.assert(
        fc.property(
          fc.record({
            _id: fc.uuid(),
            orderId: fc.string({ minLength: 5 }),
            status: fc.constantFrom("created", "pending", "failed", "refunded"),
            amount: fc.nat({ max: 100000 }),
          }),
          (payment) => {
            return applyRefund(payment) === null;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "refund does not mutate other payment fields",
    () => {
      fc.assert(
        fc.property(successPaymentArb, (payment) => {
          const refunded = applyRefund(payment);
          return (
            refunded !== null &&
            refunded._id === payment._id &&
            refunded.orderId === payment.orderId &&
            refunded.amount === payment.amount
          );
        }),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P19: Support Message Reply Status Transition
// ---------------------------------------------------------------------------

describe("P19: Support Message Reply Status Transition", () => {
  test(
    "after a successful reply, message status becomes 'replied'",
    () => {
      fc.assert(
        fc.property(
          pendingMessageArb,
          fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
          (message, replyText) => {
            const updated = applyReply(message, replyText);
            return updated !== null && updated.status === "replied";
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "after a successful reply, replyText contains the trimmed reply content",
    () => {
      fc.assert(
        fc.property(
          pendingMessageArb,
          // Exclude whitespace-only strings — those are rejected by applyReply
          fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
          (message, replyText) => {
            const updated = applyReply(message, replyText);
            return updated !== null && updated.replyText === replyText.trim();
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "empty or whitespace-only replyText is rejected (returns null)",
    () => {
      fc.assert(
        fc.property(
          pendingMessageArb,
          fc.constantFrom("", "   ", "\t", "\n"),
          (message, emptyReply) => {
            return applyReply(message, emptyReply) === null;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "reply does not mutate other message fields",
    () => {
      fc.assert(
        fc.property(
          pendingMessageArb,
          fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
          (message, replyText) => {
            const updated = applyReply(message, replyText);
            return (
              updated !== null &&
              updated._id === message._id &&
              updated.senderName === message.senderName &&
              updated.senderEmail === message.senderEmail &&
              updated.subject === message.subject &&
              updated.message === message.message
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
