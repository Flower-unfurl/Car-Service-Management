const mongoose = require("mongoose");

const serviceTaskSchema = new mongoose.Schema(
	{
		ticketId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "tickets",
			required: true
		},
		serviceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "services",
			required: true
		},
		stepOrder: {
			type: Number,
			required: true,
			min: 1
		},
		status: {
			type: String,
			enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
			default: "PENDING"
		},
		assignedStaffId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			default: null
		},
		supportStaffIds: {
			type: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: "users"
			}],
			default: []
		},
		startTime: {
			type: Date,
			default: null
		},
		endTime: {
			type: Date,
			default: null
		}
	},
	{
		timestamps: true,
		collection: "serviceTasks"
	}
);

module.exports = mongoose.model("serviceTasks", serviceTaskSchema);
