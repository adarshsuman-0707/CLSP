/**
 * Property-Based Tests: Admin System Settings Logic
 * Feature: admin-panel-enhancement
 *
 * Tests pure settings validation and persistence helpers extracted from AdminController.
 * Properties covered:
 *   P21 — Commission rate validation (0-100 accept, outside reject)
 *   P22 — Settings round-trip persistence
 *
 * Each property runs a minimum of 100 iterations via fast-check.
 */

const fc = require("fast-check");

// ---------------------------------------------------------------------------
// Pure helper functions extracted from AdminController settings logic
// ---------------------------------------------------------------------------

/**
 * P21 — Validates a commission rate value.
 * Mirrors the validation in updateSettings():
 *   const rate = parseFloat(commissionRate);
 *   if (isNaN(rate) || rate < 0 || rate > 100) → reject
 */
function validateCommissionRate(value) {
  const rate = parseFloat(value);
  if (isNaN(rate) || rate < 0 || rate > 100) return false;
  return true;
}

/**
 * P21 — Validates OTP expiry minutes.
 * Mirrors the validation in updateSettings():
 *   const minutes = parseInt(otpExpiryMinutes);
 *   if (isNaN(minutes) || minutes < 1 || minutes > 60) → reject
 */
function validateOtpExpiryMinutes(value) {
  const minutes = parseInt(value);
  if (isNaN(minutes) || minutes < 1 || minutes > 60) return false;
  return true;
}

/**
 * P22 — Simulates saving and loading settings (round-trip).
 * Mirrors the findOneAndUpdate upsert pattern in updateSettings() and
 * the findOne in getSettings().
 *
 * In the pure function model, "saving" just stores the object and
 * "loading" retrieves it — verifying field-level equality.
 */
function saveSettings(store, settings) {
  // Singleton: overwrite the single document
  store.document = { ...settings };
  return store.document;
}

function loadSettings(store) {
  if (!store.document) {
    // Return defaults (mirrors getSettings() fallback)
    return {
      commissionRate: 10,
      otpExpiryMinutes: 10,
      platformName: "CLSP Services",
      supportEmail: "",
      maintenanceMode: false,
    };
  }
  return { ...store.document };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

// Valid commission rates: numbers in [0, 100] — use integer to avoid float precision edge cases
const validCommissionRateArb = fc.integer({ min: 0, max: 100 });

// Invalid commission rates: outside [0, 100] or NaN
const invalidCommissionRateArb = fc.oneof(
  fc.integer({ min: -1000, max: -1 }),
  fc.integer({ min: 101, max: 1000 }),
  fc.constant(NaN)
);

// Valid OTP expiry: integers in [1, 60]
const validOtpExpiryArb = fc.integer({ min: 1, max: 60 });

// Invalid OTP expiry: outside [1, 60]
const invalidOtpExpiryArb = fc.oneof(
  fc.integer({ min: -100, max: 0 }),
  fc.integer({ min: 61, max: 1000 })
);

// Full valid settings object
const validSettingsArb = fc.record({
  commissionRate: validCommissionRateArb,
  otpExpiryMinutes: validOtpExpiryArb,
  platformName: fc.string({ minLength: 1, maxLength: 100 }),
  supportEmail: fc.emailAddress(),
  maintenanceMode: fc.boolean(),
});
// ---------------------------------------------------------------------------
// P21: Commission Rate Validation
// ---------------------------------------------------------------------------

describe("P21: Commission Rate Validation", () => {
  test(
    "values in [0, 100] are accepted",
    () => {
      fc.assert(
        fc.property(validCommissionRateArb, (rate) => {
          return validateCommissionRate(rate) === true;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "values outside [0, 100] are rejected",
    () => {
      fc.assert(
        fc.property(invalidCommissionRateArb, (rate) => {
          return validateCommissionRate(rate) === false;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "boundary value 0 is accepted",
    () => {
      expect(validateCommissionRate(0)).toBe(true);
    }
  );

  test(
    "boundary value 100 is accepted",
    () => {
      expect(validateCommissionRate(100)).toBe(true);
    }
  );

  test(
    "value just below 0 is rejected",
    () => {
      expect(validateCommissionRate(-1)).toBe(false);
    }
  );

  test(
    "value just above 100 is rejected",
    () => {
      expect(validateCommissionRate(101)).toBe(false);
    }
  );

  test(
    "non-numeric strings are rejected",
    () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 10 }).filter(
            (s) => isNaN(parseFloat(s))
          ),
          (nonNumeric) => {
            return validateCommissionRate(nonNumeric) === false;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P21 (continued): OTP Expiry Minutes Validation
// ---------------------------------------------------------------------------

describe("P21: OTP Expiry Minutes Validation", () => {
  test(
    "values in [1, 60] are accepted",
    () => {
      fc.assert(
        fc.property(validOtpExpiryArb, (minutes) => {
          return validateOtpExpiryMinutes(minutes) === true;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "values outside [1, 60] are rejected",
    () => {
      fc.assert(
        fc.property(invalidOtpExpiryArb, (minutes) => {
          return validateOtpExpiryMinutes(minutes) === false;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "boundary value 1 is accepted",
    () => {
      expect(validateOtpExpiryMinutes(1)).toBe(true);
    }
  );

  test(
    "boundary value 60 is accepted",
    () => {
      expect(validateOtpExpiryMinutes(60)).toBe(true);
    }
  );

  test(
    "value 0 is rejected",
    () => {
      expect(validateOtpExpiryMinutes(0)).toBe(false);
    }
  );

  test(
    "value 61 is rejected",
    () => {
      expect(validateOtpExpiryMinutes(61)).toBe(false);
    }
  );
});

// ---------------------------------------------------------------------------
// P22: Settings Round-Trip Persistence
// ---------------------------------------------------------------------------

describe("P22: Settings Round-Trip Persistence", () => {
  test(
    "loading after saving returns the same commissionRate",
    () => {
      fc.assert(
        fc.property(validSettingsArb, (settings) => {
          const store = {};
          saveSettings(store, settings);
          const loaded = loadSettings(store);
          return loaded.commissionRate === settings.commissionRate;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "loading after saving returns the same otpExpiryMinutes",
    () => {
      fc.assert(
        fc.property(validSettingsArb, (settings) => {
          const store = {};
          saveSettings(store, settings);
          const loaded = loadSettings(store);
          return loaded.otpExpiryMinutes === settings.otpExpiryMinutes;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "loading after saving returns the same platformName",
    () => {
      fc.assert(
        fc.property(validSettingsArb, (settings) => {
          const store = {};
          saveSettings(store, settings);
          const loaded = loadSettings(store);
          return loaded.platformName === settings.platformName;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "loading after saving returns the same supportEmail",
    () => {
      fc.assert(
        fc.property(validSettingsArb, (settings) => {
          const store = {};
          saveSettings(store, settings);
          const loaded = loadSettings(store);
          return loaded.supportEmail === settings.supportEmail;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "loading after saving returns the same maintenanceMode",
    () => {
      fc.assert(
        fc.property(validSettingsArb, (settings) => {
          const store = {};
          saveSettings(store, settings);
          const loaded = loadSettings(store);
          return loaded.maintenanceMode === settings.maintenanceMode;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "all fields are preserved in a single round-trip",
    () => {
      fc.assert(
        fc.property(validSettingsArb, (settings) => {
          const store = {};
          saveSettings(store, settings);
          const loaded = loadSettings(store);
          return (
            loaded.commissionRate === settings.commissionRate &&
            loaded.otpExpiryMinutes === settings.otpExpiryMinutes &&
            loaded.platformName === settings.platformName &&
            loaded.supportEmail === settings.supportEmail &&
            loaded.maintenanceMode === settings.maintenanceMode
          );
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "second save overwrites first (singleton pattern)",
    () => {
      fc.assert(
        fc.property(validSettingsArb, validSettingsArb, (first, second) => {
          const store = {};
          saveSettings(store, first);
          saveSettings(store, second);
          const loaded = loadSettings(store);
          return (
            loaded.commissionRate === second.commissionRate &&
            loaded.platformName === second.platformName &&
            loaded.maintenanceMode === second.maintenanceMode
          );
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "loading from empty store returns default values",
    () => {
      const store = {};
      const defaults = loadSettings(store);
      expect(defaults.commissionRate).toBe(10);
      expect(defaults.otpExpiryMinutes).toBe(10);
      expect(defaults.platformName).toBe("CLSP Services");
      expect(defaults.supportEmail).toBe("");
      expect(defaults.maintenanceMode).toBe(false);
    }
  );
});
