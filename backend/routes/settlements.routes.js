const express = require("express");
const router = express.Router();
const verifyUser = require("../middleware/verifyLogin");
const Transaction = require("../models/Transaction.models");
const User = require("../models/User.models");
const mongoose = require("mongoose");

// GET settlements
router.get("/", verifyUser, async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
  
      const balances = await Transaction.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: "$friend",
            balance: { $sum: "$amount" }
          }
        },
        { $match: { balance: { $ne: 0 } } }
      ]);
  
      const results = await Promise.all(
        balances.map(async (b) => {
          const friendUser = await User.findById(b._id).select("name profilePic");
          console.log(friendUser);
          return {
            _id: b._id,
            friendName: friendUser?.name || "Friend",
            profilePic: friendUser?.profilePic || null,
            balance: b.balance
          };
        })
      );
  
      res.json(results);
  
    } catch (err) {
      console.error("SETTLEMENTS ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  });
// POST pay
router.post("/pay", verifyUser, async (req, res) => {
    try {
      const { friend, amount } = req.body;
  
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const friendId = new mongoose.Types.ObjectId(friend);
      const amt = Math.abs(amount);
  
      const txns = await Transaction.insertMany([
        {
          user: userId,
          friend: friendId,
          amount: amt,
          type: "settlement"
        },
        {
          user: friendId,
          friend: userId,
          amount: -amt,
          type: "settlement"
        }
      ]);
  
      res.json({ message: "Settlement completed", txns });
  
    } catch (err) {
      console.error("PAY ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  });
  
module.exports = router;
