const express = require("express");
const {
	getTickets,
	getTicketById,
	createTicket,
	createFullEntry,
	addServicesToTicketFlow,
	getTicketInvoice,
	updateInvoiceDraft,
	confirmInvoice,
	confirmInvoicePayment,
	getGuestInvoiceByQrToken
} = require("../controller/ticketController");
const { authToken, authRole } = require("../middleware/authMiddleware");

const ticketRoute = express.Router();

// Public route for guest to view published invoice by QR
ticketRoute.get("/guest/:qrToken/invoice", getGuestInvoiceByQrToken);

// Authenticated routes for staff/admin
ticketRoute.use(authToken);

ticketRoute.get("/", authRole("ADMIN", "STAFF"), getTickets);
ticketRoute.post("/", authRole("ADMIN", "STAFF"), createTicket);
ticketRoute.post("/full-entry", authRole("ADMIN", "STAFF"), createFullEntry);
ticketRoute.post("/:id/services", authRole("ADMIN", "STAFF"), addServicesToTicketFlow);

ticketRoute.get("/:id/invoice", authRole("ADMIN", "STAFF"), getTicketInvoice);
ticketRoute.patch("/:id/invoice-draft", authRole("ADMIN"), updateInvoiceDraft);
ticketRoute.post("/:id/invoice-confirm", authRole("ADMIN", "STAFF"), confirmInvoice);
ticketRoute.post("/:id/payment-confirm", authRole("ADMIN", "STAFF"), confirmInvoicePayment);

ticketRoute.get("/:id", authRole("ADMIN", "STAFF"), getTicketById);

module.exports = ticketRoute;
