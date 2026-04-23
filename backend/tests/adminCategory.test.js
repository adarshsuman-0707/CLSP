/**
 * Property-Based Tests: Admin Category Management Logic
 * Feature: admin-panel-enhancement
 *
 * Tests pure category management helpers extracted from AdminController.
 * Properties covered:
 *   P11 — Category distinctness
 *   P12 — Category rename cascade
 *   P13 — Category deletion guard
 *
 * Each property runs a minimum of 100 iterations via fast-check.
 */

const fc = require("fast-check");

// ---------------------------------------------------------------------------
// Pure helper functions extracted from AdminController category logic
// ---------------------------------------------------------------------------

/**
 * P11 — Extracts distinct category names from a list of services.
 * Mirrors the logic in getCategories() which returns unique category names.
 */
function getDistinctCategories(services) {
  const categorySet = new Set(services.map((s) => s.category));
  return Array.from(categorySet);
}

/**
 * P12 — Renames a category across all services that use it.
 * Mirrors the Service.updateMany({ category: oldName }, { $set: { category: newName } })
 * logic in updateCategory().
 */
function renameCategoryInServices(services, oldName, newName) {
  return services.map((s) => {
    if (s.category === oldName) {
      return { ...s, category: newName };
    }
    return s;
  });
}

/**
 * P13 — Checks if a category can be deleted (guard: no services use it).
 * Mirrors the serviceCount check in deleteCategory():
 *   const serviceCount = await Service.countDocuments({ category: name });
 *   if (serviceCount > 0) → reject
 */
function canDeleteCategory(services, categoryName) {
  const count = services.filter((s) => s.category === categoryName).length;
  return count === 0;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const categoryNameArb = fc.constantFrom(
  "Plumbing",
  "Carpentry",
  "Cleaning",
  "Electrical",
  "Painting",
  "Gardening"
);

const serviceArb = fc.record({
  _id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  category: categoryNameArb,
  price: fc.nat({ max: 10000 }),
});

// ---------------------------------------------------------------------------
// P11: Category Distinctness
// ---------------------------------------------------------------------------

describe("P11: Category Distinctness", () => {
  test(
    "result contains no duplicate category names",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 0, maxLength: 50 }),
          (services) => {
            const categories = getDistinctCategories(services);
            return categories.length === new Set(categories).size;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "each category name appears exactly once in the result",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 0, maxLength: 50 }),
          (services) => {
            const categories = getDistinctCategories(services);
            return categories.every(
              (cat) => categories.filter((c) => c === cat).length === 1
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "every category used by at least one service appears in the result",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 1, maxLength: 50 }),
          (services) => {
            const categories = getDistinctCategories(services);
            const usedCategories = new Set(services.map((s) => s.category));
            return Array.from(usedCategories).every((cat) =>
              categories.includes(cat)
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "result length is at most the number of services",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 0, maxLength: 50 }),
          (services) => {
            const categories = getDistinctCategories(services);
            return categories.length <= services.length;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "empty service list returns empty category list",
    () => {
      const categories = getDistinctCategories([]);
      expect(categories.length).toBe(0);
    }
  );
});

// ---------------------------------------------------------------------------
// P12: Category Rename Cascade
// ---------------------------------------------------------------------------

describe("P12: Category Rename Cascade", () => {
  test(
    "after rename, no service has the old category name",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 0, maxLength: 50 }),
          categoryNameArb,
          fc.string({ minLength: 1, maxLength: 30 }),
          (services, oldName, newName) => {
            const updated = renameCategoryInServices(services, oldName, newName);
            return updated.every((s) => s.category !== oldName);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "every service that had oldName now has newName",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 0, maxLength: 50 }),
          categoryNameArb,
          fc.string({ minLength: 1, maxLength: 30 }),
          (services, oldName, newName) => {
            const updated = renameCategoryInServices(services, oldName, newName);
            const originalWithOldName = services.filter(
              (s) => s.category === oldName
            );
            return originalWithOldName.every((orig) => {
              const updatedService = updated.find((u) => u._id === orig._id);
              return updatedService && updatedService.category === newName;
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "services with other category names are unchanged",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 0, maxLength: 50 }),
          categoryNameArb,
          fc.string({ minLength: 1, maxLength: 30 }),
          (services, oldName, newName) => {
            const updated = renameCategoryInServices(services, oldName, newName);
            const otherServices = services.filter((s) => s.category !== oldName);
            return otherServices.every((orig) => {
              const updatedService = updated.find((u) => u._id === orig._id);
              return (
                updatedService && updatedService.category === orig.category
              );
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "rename does not mutate other service fields",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 1, maxLength: 50 }),
          categoryNameArb,
          fc.string({ minLength: 1, maxLength: 30 }),
          (services, oldName, newName) => {
            const updated = renameCategoryInServices(services, oldName, newName);
            return services.every((orig) => {
              const updatedService = updated.find((u) => u._id === orig._id);
              return (
                updatedService &&
                updatedService._id === orig._id &&
                updatedService.name === orig.name &&
                updatedService.price === orig.price
              );
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "count of services with newName after rename equals count with oldName before",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 0, maxLength: 50 }),
          categoryNameArb,
          fc.string({ minLength: 1, maxLength: 30 }),
          (services, oldName, newName) => {
            const countBefore = services.filter(
              (s) => s.category === oldName
            ).length;
            const updated = renameCategoryInServices(services, oldName, newName);
            const countAfter = updated.filter(
              (s) => s.category === newName
            ).length;
            // If newName was already used, countAfter will be higher
            // But at minimum, it should include all the renamed ones
            return countAfter >= countBefore;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// P13: Category Deletion Guard
// ---------------------------------------------------------------------------

describe("P13: Category Deletion Guard", () => {
  test(
    "deletion is allowed when no services use the category",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 0, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 30 }).filter(
            (name) =>
              ![
                "Plumbing",
                "Carpentry",
                "Cleaning",
                "Electrical",
                "Painting",
                "Gardening",
              ].includes(name)
          ),
          (services, unusedCategory) => {
            return canDeleteCategory(services, unusedCategory) === true;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "deletion is blocked when at least one service uses the category",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 1, maxLength: 50 }),
          (services) => {
            // Pick a category that is actually used
            const usedCategory = services[0].category;
            return canDeleteCategory(services, usedCategory) === false;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "deletion guard returns false if service count > 0",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 1, maxLength: 50 }),
          categoryNameArb,
          (services, category) => {
            const count = services.filter((s) => s.category === category).length;
            const canDelete = canDeleteCategory(services, category);
            if (count > 0) {
              return canDelete === false;
            }
            return true; // If count is 0, canDelete should be true
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "deletion guard returns true if service count === 0",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 0, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 30 }),
          (services, category) => {
            const count = services.filter((s) => s.category === category).length;
            const canDelete = canDeleteCategory(services, category);
            if (count === 0) {
              return canDelete === true;
            }
            return true; // If count > 0, canDelete should be false
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    "after removing all services of a category, deletion becomes allowed",
    () => {
      fc.assert(
        fc.property(
          fc.array(serviceArb, { minLength: 1, maxLength: 50 }),
          categoryNameArb,
          (services, category) => {
            // Remove all services with this category
            const filtered = services.filter((s) => s.category !== category);
            return canDeleteCategory(filtered, category) === true;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
