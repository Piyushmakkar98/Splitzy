const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense.models"); // example

router.post("/create", async (req, res) => {
  try {
    const { title, amount, participants } = req.body;
    const creatorId = req.user._id; // from JWT

    const expense = await Expense.create({
      title,
      amount,
      participants,
      createdBy: creatorId,
    });

    // Send notifications to all except creator
    participants.forEach((uid) => {
      if (uid.toString() !== creatorId.toString()) {
        const { getIO } = require("../socket");
const io = getIO();
        io.to(uid.toString()).emit("expense_notification", {
          message: `New Expense: ${title}`,
          amount,
          creator: creatorId,
        });
      }
    });

    return res.status(201).json({ status: "ok", expense });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
