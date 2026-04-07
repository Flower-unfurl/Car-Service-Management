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
