const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  friend: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true }, // Can be positive or negative
  expense: { type: mongoose.Schema.Types.ObjectId, ref: "Expense" }, // Link to the original expense
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);