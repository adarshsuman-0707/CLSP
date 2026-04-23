/**
 * Property-Based Tests: Admin Sidebar Navigation State Mapping
 * Feature: admin-panel-enhancement
 *
 * Tests the sidebar section key → state/localStorage mapping logic.
 * Properties covered:
 *   P23 — Sidebar navigation state mapping
 *
 * Each property runs a minimum of 100 iterations via fast-check.
 */

const fc = require("fast-check");

// ---------------------------------------------------------------------------
// Pure helper functions extracted from Dashboard.js sidebar logic
// ---------------------------------------------------------------------------

/**
 * The 10 valid admin section keys — mirrors the switch cases in
 * adminRenderSection() and the CDBSidebar menu items in Dashboard.js.
 */
const ADMIN_SECTION_KEYS = [
  "userManagement",
  "vendorManagement",
  "bookingsOverview",
  "revenueAnalytics",
  "categoryManagement",
  "reviewsModeration",
  "paymentManagement",
  "reportsExport",
  "supportMessages",
  "systemSettings",
];

/**
 * Simulates clicking a sidebar menu item.
 * Mirrors the onClick handler in Dashboard.js:
 *   setActiveSection(key);
 *   localStorage.setItem("activeSection", key);
 *
 * Returns the new state and what was written to localStorage.
 */
function handleSidebarClick(key, localStorageStore) {
  // Update React state (simulated as a plain value)
  const newActiveSection = key;
  // Persist to localStorage
  localStorageStore["activeSection"] = key;
  return { activeSection: newActiveSection, localStorage: localStorageStore };
}

/**
 * Simulates reading the active section from localStorage on page load.
 * Mirrors the useState initializer:
 *   const [activeSection, setActiveSection] = useState(
 *     localStorage.getItem("activeSection") || "profile"
 *   );
 */
function restoreActiveSectionFromStorage(localStorageStore) {
  return localStorageStore["activeSection"] || "profile";
}

/**
 * Validates that a given key is a recognized admin section key.
 * Mirrors the switch statement in adminRenderSection().
 */
function isValidSectionKey(key) {
  return ADMIN_SECTION_KEYS.includes(key);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const sectionKeyArb = fc.constantFrom(...ADMIN_SECTION_KEYS);

// ---------------------------------------------------------------------------
// P23: Sidebar Navigation State Mapping
// ---------------------------------------------------------------------------

describe("P23: Sidebar Navigation State Mapping", () => {
  test(
    "clicking a sidebar item sets activeSection to the exact key",
    () => {
      fc.assert(
        fc.property(sectionKeyArb, (key) => {
          const store = {};
          const result = handleSidebarClick(key, store);
          return result.activeSection === key;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "clicking a sidebar item writes the exact key to localStorage",
    () => {
      fc.assert(
        fc.property(sectionKeyArb, (key) => {
          const store = {};
          handleSidebarClick(key, store);
          return store["activeSection"] === key;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "activeSection in state equals localStorage value after click",
    () => {
      fc.assert(
        fc.property(sectionKeyArb, (key) => {
          const store = {};
          const result = handleSidebarClick(key, store);
          return result.activeSection === store["activeSection"];
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "restoring from localStorage returns the last clicked section key",
    () => {
      fc.assert(
        fc.property(sectionKeyArb, (key) => {
          const store = {};
          handleSidebarClick(key, store);
          const restored = restoreActiveSectionFromStorage(store);
          return restored === key;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "restoring from empty localStorage returns default 'profile'",
    () => {
      const store = {};
      const restored = restoreActiveSectionFromStorage(store);
      expect(restored).toBe("profile");
    }
  );

  test(
    "clicking multiple items in sequence — last click wins in localStorage",
    () => {
      fc.assert(
        fc.property(
          fc.array(sectionKeyArb, { minLength: 2, maxLength: 10 }),
          (keys) => {
            const store = {};
            keys.forEach((key) => handleSidebarClick(key, store));
            const lastKey = keys[keys.length - 1];
            return store["activeSection"] === lastKey;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "all 10 section keys are valid admin section keys",
    () => {
      fc.assert(
        fc.property(sectionKeyArb, (key) => {
          return isValidSectionKey(key) === true;
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "non-section keys are not valid admin section keys",
    () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter(
            (s) => !ADMIN_SECTION_KEYS.includes(s)
          ),
          (invalidKey) => {
            return isValidSectionKey(invalidKey) === false;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "each of the 10 section keys maps to itself (identity mapping)",
    () => {
      ADMIN_SECTION_KEYS.forEach((key) => {
        const store = {};
        const result = handleSidebarClick(key, store);
        expect(result.activeSection).toBe(key);
        expect(store["activeSection"]).toBe(key);
      });
    }
  );
});
