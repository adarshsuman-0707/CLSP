import apiConnector from "../apiconfig.js";
import { endpoint } from "../api.js";

const { INVOICE_GENERATE, INVOICE_MY, INVOICE_BY_BOOKING, INVOICE_PDF } = endpoint;

/** POST /api/invoice/generate — generate invoice for a booking */
export const generateInvoice = async (invoiceData, token) => {
  try {
    const res = await apiConnector.post(INVOICE_GENERATE, invoiceData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to generate invoice!";
  }
};

/** GET /api/invoice/my — fetch all invoices for logged-in user */
export const fetchMyInvoices = async (token) => {
  try {
    const res = await apiConnector.get(INVOICE_MY, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch invoices!";
  }
};

/** GET /api/invoice/:bookingId — fetch invoice by booking ID */
export const fetchInvoiceByBooking = async (bookingId, token) => {
  try {
    const url = INVOICE_BY_BOOKING.replace(":bookingId", bookingId);
    const res = await apiConnector.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch invoice!";
  }
};

/** GET /api/invoice/:bookingId/pdf — download invoice as PDF */
export const downloadInvoicePDF = async (bookingId, token) => {
  try {
    const url = INVOICE_PDF.replace(":bookingId", bookingId);
    const res = await apiConnector.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob", // important for file download
    });

    // Create download link
    const blob = new Blob([res.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `invoice-${bookingId}.pdf`;
    link.click();

    return { success: true, message: "Invoice downloaded successfully!" };
  } catch (error) {
    throw error.response?.data || "Failed to download invoice PDF!";
  }
};
