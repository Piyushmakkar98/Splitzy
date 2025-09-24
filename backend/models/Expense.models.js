const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Other'], // Example categories
    default: 'Other'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      share: {
        type: Number, // how much this user owes
        required: true,
      },
      isSettled: {
        type: Boolean,
        default: false,
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
