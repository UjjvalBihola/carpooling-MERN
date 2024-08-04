const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tripSchema = new Schema(
  {
    driver: {
      type: mongoose.ObjectId,
      require: true,
    },
    source: {
      type: Object,
      required: true,
    },
    destination: {
      type: Object,
      required: true,
    },
    route: {
      type: Array,
    },
    waypoints: {
      type: Array,
      default: [],
    },
    dateTime: {
      type: Date,
      required: true,
    },
    max_riders: {
      type: Number,
      required: true,
    },
    available_riders: {
      type: Boolean,
      default: true,
    },
    riders: {
      type: Array,
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
    },
    driverRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    rideRequests: [
      {
        riderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          default: "pending",
        },
      },
    ],
    feedbacks: [
      {
        riderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: Number,
        comment: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("trip", tripSchema);
