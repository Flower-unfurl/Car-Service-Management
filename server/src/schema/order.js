const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		ticketId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "tickets",
			required: true
		},
		customerPhone: {
			type: String,
			required: true,
			trim: true
		},
		// Services ordered by customer
		services: [{
			serviceId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "services",
				required: true
			},
			serviceNameSnapshot: {
				type: String,
				required: true,
				trim: true
			},
			durationMinutesSnapshot: {
				type: Number,
				required: true,
				min: 0
			},
			quantity: {
				type: Number,
				default: 1,
				min: 1
			},
			price: {
				type: Number,
				required: true,
				min: 0
			}
		}],
		parkingFee: {
			type: Number,
			required: true,
			min: 0,
			default: 0
		},
		totalServiceFee: {
			type: Number,
			required: true,
			min: 0,
			default: 0
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
			default: 0
		},
		includeParkingFee: {
			type: Boolean,
			default: false
		},
		invoiceStatus: {
			type: String,
			enum: ["DRAFT", "CONFIRMED"],
			default: "DRAFT"
		},
		isPublicForGuest: {
			type: Boolean,
			default: false
		},
		invoiceConfirmedAt: {
			type: Date,
			default: null
		},
		invoiceConfirmedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			default: null
		},
		paymentStatus: {
			type: String,
			enum: ["UNPAID", "PAID"],
			default: "UNPAID"
		}
	},
	{
		timestamps: true,
		collection: "orders"
	}
);

module.exports = mongoose.model("orders", orderSchema);
