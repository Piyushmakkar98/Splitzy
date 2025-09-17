const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Settlement", settlementSchema);
