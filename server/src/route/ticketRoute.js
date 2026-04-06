const express = require("express");
const { getTickets, getTicketById, createTicket, createFullEntry } = require("../controller/ticketController");
const { authToken } = require("../middleware/authMiddleware");

const ticketRoute = express.Router();

// ticketRoute.use(authToken); 

ticketRoute.get("/", getTickets);
ticketRoute.get("/:id", getTicketById);
ticketRoute.post("/", createTicket);
ticketRoute.post("/full-entry", createFullEntry);

module.exports = ticketRoute;
