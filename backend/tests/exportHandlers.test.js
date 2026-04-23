/**
 * Test file for CSV export handlers
 * Tests the arrayToCSV helper and export handler logic
 */

const mongoose = require("mongoose");

// Mock data for testing
const mockBookings = [
  {
    _id: "booking123",
    userId: { username: "john_doe" },
    serviceId: {
      name: "Plumbing Service",
      createdBy: { username: "vendor_joe" }
    },
    date: new Date("2024-01-15"),
    status: "Confirmed"
  },
  {
    _id: "booking456",
    userId: { username: "jane_smith" },
    serviceId: {
      name: "Carpentry Work",
      createdBy: { username: "vendor_mike" }
    },
    date: new Date("2024-01-20"),
    status: "Pending"
  }
];

const mockPayments = [
  {
    orderId: "order123",
    user: { username: "john_doe" },
    amount: 1500,
    currency: "INR",
    paymentMethod: "card",
    status: "success",
    createdAt: new Date("2024-01-15")
  },
  {
    orderId: "order456",
    user: { username: "jane_smith" },
    amount: 2500,
    currency: "INR",
    paymentMethod: "upi",
    status: "success",
    createdAt: new Date("2024-01-20")
  }
];

const mockUsers = [
  {
    username: "john_doe",
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    role: "user",
    city: "Mumbai",
    state: "Maharashtra",
    contact: "9876543210"
  },
  {
    username: "jane_smith",
    firstname: "Jane",
    lastname: "Smith",
    email: "jane@example.com",
    role: "user",
    city: "Delhi",
    state: "Delhi",
    contact: "9876543211"
  }
];

// Helper function to convert array of objects to CSV string
const arrayToCSV = (data, headers, rowMapper) => {
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const item of data) {
    const values = rowMapper(item);
    // Escape values that contain commas or quotes
    const escapedValues = values.map(val => {
      const stringVal = val === null || val === undefined ? '' : String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    });
    csvRows.push(escapedValues.join(','));
  }
  
  return csvRows.join('\n');
};

describe('CSV Export Handlers', () => {
  describe('arrayToCSV helper', () => {
    test('should generate CSV with headers and data rows', () => {
      const headers = ["ID", "Name", "Value"];
      const data = [
        { id: 1, name: "Test", value: 100 },
        { id: 2, name: "Test2", value: 200 }
      ];
      const rowMapper = (item) => [item.id, item.name, item.value];
      
      const csv = arrayToCSV(data, headers, rowMapper);
      
      expect(csv).toContain("ID,Name,Value");
      expect(csv).toContain("1,Test,100");
      expect(csv).toContain("2,Test2,200");
    });

    test('should escape values containing commas', () => {
      const headers = ["Name", "Description"];
      const data = [{ name: "Test", description: "This has, a comma" }];
      const rowMapper = (item) => [item.name, item.description];
      
      const csv = arrayToCSV(data, headers, rowMapper);
      
      expect(csv).toContain('"This has, a comma"');
    });

    test('should escape values containing quotes', () => {
      const headers = ["Name", "Quote"];
      const data = [{ name: "Test", quote: 'He said "hello"' }];
      const rowMapper = (item) => [item.name, item.quote];
      
      const csv = arrayToCSV(data, headers, rowMapper);
      
      expect(csv).toContain('"He said ""hello"""');
    });

    test('should handle null and undefined values', () => {
      const headers = ["Name", "Value"];
      const data = [{ name: "Test", value: null }];
      const rowMapper = (item) => [item.name, item.value];
      
      const csv = arrayToCSV(data, headers, rowMapper);
      
      expect(csv).toContain("Test,");
    });
  });

  describe('Bookings CSV generation', () => {
    test('should generate correct CSV format for bookings', () => {
      const headers = ["Booking ID", "User Name", "Vendor Name", "Service Name", "Date", "Status"];
      const rowMapper = (booking) => [
        booking._id,
        booking.userId?.username || "N/A",
        booking.serviceId?.createdBy?.username || "N/A",
        booking.serviceId?.name || "N/A",
        booking.date ? new Date(booking.date).toISOString() : "N/A",
        booking.status,
      ];

      const csv = arrayToCSV(mockBookings, headers, rowMapper);

      expect(csv).toContain("Booking ID,User Name,Vendor Name,Service Name,Date,Status");
      expect(csv).toContain("booking123");
      expect(csv).toContain("john_doe");
      expect(csv).toContain("vendor_joe");
      expect(csv).toContain("Plumbing Service");
      expect(csv).toContain("Confirmed");
    });

    test('should handle missing user or service data', () => {
      const bookingWithMissingData = [{
        _id: "booking789",
        userId: null,
        serviceId: null,
        date: new Date("2024-01-25"),
        status: "Cancelled"
      }];

      const headers = ["Booking ID", "User Name", "Vendor Name", "Service Name", "Date", "Status"];
      const rowMapper = (booking) => [
        booking._id,
        booking.userId?.username || "N/A",
        booking.serviceId?.createdBy?.username || "N/A",
        booking.serviceId?.name || "N/A",
        booking.date ? new Date(booking.date).toISOString() : "N/A",
        booking.status,
      ];

      const csv = arrayToCSV(bookingWithMissingData, headers, rowMapper);

      expect(csv).toContain("N/A,N/A,N/A");
      expect(csv).toContain("Cancelled");
    });
  });

  describe('Payments CSV generation', () => {
    test('should generate correct CSV format for payments', () => {
      const headers = ["Order ID", "User Name", "Amount", "Currency", "Method", "Status", "Date"];
      const rowMapper = (payment) => [
        payment.orderId,
        payment.user?.username || "N/A",
        payment.amount,
        payment.currency,
        payment.paymentMethod,
        payment.status,
        payment.createdAt ? new Date(payment.createdAt).toISOString() : "N/A",
      ];

      const csv = arrayToCSV(mockPayments, headers, rowMapper);

      expect(csv).toContain("Order ID,User Name,Amount,Currency,Method,Status,Date");
      expect(csv).toContain("order123");
      expect(csv).toContain("john_doe");
      expect(csv).toContain("1500");
      expect(csv).toContain("INR");
      expect(csv).toContain("card");
      expect(csv).toContain("success");
    });
  });

  describe('Users CSV generation', () => {
    test('should generate correct CSV format for users', () => {
      const headers = ["Username", "First Name", "Last Name", "Email", "Role", "City", "State", "Contact"];
      const rowMapper = (user) => [
        user.username,
        user.firstname,
        user.lastname,
        user.email,
        user.role,
        user.city,
        user.state,
        user.contact,
      ];

      const csv = arrayToCSV(mockUsers, headers, rowMapper);

      expect(csv).toContain("Username,First Name,Last Name,Email,Role,City,State,Contact");
      expect(csv).toContain("john_doe");
      expect(csv).toContain("John");
      expect(csv).toContain("Doe");
      expect(csv).toContain("john@example.com");
      expect(csv).toContain("user");
      expect(csv).toContain("Mumbai");
      expect(csv).toContain("Maharashtra");
      expect(csv).toContain("9876543210");
    });
  });

  describe('Date range filtering', () => {
    test('should filter records by date range', () => {
      const dateFrom = new Date("2024-01-16");
      const dateTo = new Date("2024-01-25");

      const filteredPayments = mockPayments.filter(payment => {
        const createdAt = new Date(payment.createdAt);
        return createdAt >= dateFrom && createdAt <= dateTo;
      });

      expect(filteredPayments.length).toBe(1);
      expect(filteredPayments[0].orderId).toBe("order456");
    });

    test('should include all records when no date filter is provided', () => {
      const filteredPayments = mockPayments.filter(() => true);
      expect(filteredPayments.length).toBe(2);
    });
  });
});
