const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Controllers and Middleware
const { registerAccount, loginAccount } = require("../controllers/auth.controllers");
const verifyUser = require("../middleware/verifyLogin");

// Models
const User = require("../models/User.models");
const Expense = require("../models/Expense.models");
const Group = require("../models/Group.models");
const Transaction = require("../models/Transaction.models");

// ===========================================
// AUTH ROUTES (No changes)
// ===========================================
router.post("/signup", registerAccount);
router.post("/login", loginAccount);

// ===========================================
// USER & FRIENDS ROUTES (No changes)
// ===========================================
router.get("/api/profile", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email profilePic _id").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/api/profile", verifyUser, async (req, res) => {
  try {
    const { name, profilePic } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.profilePic = profilePic || user.profilePic;
    await user.save();
    
    res.json({ name: user.name, profilePic: user.profilePic });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/friends", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("friends", "name email _id profilePic")
      .lean();
    res.json(user.friends);
  } catch (err) {
    console.error("Error fetching friends:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/api/friends", verifyUser, async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $addToSet: { friends: userId } });

    res.status(200).json({ message: "Friend added successfully" });
  } catch (err) {
    console.error("Error adding friend:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/api/friends/:friendId", verifyUser, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;
    
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    
    res.status(200).json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/users/search", verifyUser, async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    if (!searchQuery) return res.json([]);

    const user = await User.findById(userId).select('friends');
    const friendIds = user.friends;

    const users = await User.find({
      $and: [
        { _id: { $ne: userId, $nin: friendIds } },
        { $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } }
        ]}
      ]
    }).select("name email profilePic").limit(10);
    
    res.json(users);
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================
// GROUP ROUTES (No changes)
// ===========================================
router.get("/api/groups", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ members: userId })
      .populate("members", "name _id profilePic")
      .lean();
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/api/groups", verifyUser, async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const creatorId = req.user.id;
    if (!name || !memberIds || memberIds.length === 0) {
      return res.status(400).json({ message: "Group name and members are required." });
    }
    const allMemberIds = [...new Set([creatorId, ...memberIds])];
    const newGroup = await Group.create({ name, members: allMemberIds });
    await User.updateMany(
      { _id: { $in: allMemberIds } },
      { $push: { groups: newGroup._id } }
    );
    await newGroup.populate("members", "name _id profilePic");
    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/groups/:id", verifyUser, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    const group = await Group.findById(groupId).populate("members", "name profilePic email").lean();
    if (!group) return res.status(404).json({ message: "Group not found." });

    const isMember = group.members.some(member => member._id.toString() === userId);
    if (!isMember) return res.status(403).json({ message: "Forbidden." });

    const groupExpenses = await Expense.find({ group: groupId }).populate('paidBy', 'name').sort({ createdAt: -1 }).lean();
    const response = { ...group, expenses: groupExpenses };
    res.json(response);
  } catch (err) {
    console.error("Error fetching group details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================
// EXPENSE & TRANSACTION ROUTES (No changes)
// ===========================================
router.post("/api/expenses", verifyUser, async (req, res) => {
  try {
    const { description, amount, category, participants, group } = req.body;
    const paidBy = req.user.id;

    const newExpense = await Expense.create({
      description, amount, category, paidBy, participants, group: group || null
    });

    const transactions = [];
    participants.forEach(p => {
      if (p.user.toString() !== paidBy.toString()) {
        transactions.push({ user: paidBy, friend: p.user, amount: p.share, expense: newExpense._id, description });
        transactions.push({ user: p.user, friend: paidBy, amount: -p.share, expense: newExpense._id, description });
      }
    });

    if (transactions.length > 0) await Transaction.insertMany(transactions);

    participants.forEach(p => {
      if (p.user.toString() !== paidBy.toString()) {
        const { getIO } = require("../socket");
        const io = getIO();
        console.log("🔥 Emitting to:", p.user.toString());
        io.to(p.user.toString()).emit("expense_notification", {
          message: `New Expense: ${description}`,
          amount,
          category,
        });
      }
    });

    await newExpense.populate("paidBy participants.user", "name");
    res.status(201).json(newExpense);

  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/api/expenses", verifyUser, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const expenses = await Expense.find({ $or: [{ paidBy: userId }, { "participants.user": userId }]})
      .populate("paidBy", "name")
      .populate("participants.user", "name")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .lean();
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================
// CHART DATA ROUTES (No changes)
// ===========================================
router.get("/api/monthly-expenses", verifyUser, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const monthlyExpenses = await Expense.aggregate([
      { $match: { paidBy: userId } },
      { $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalSpent: { $sum: "$amount" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $project: {
          _id: 0,
          name: { $concat: [
              { $arrayElemAt: [ ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], "$_id.month" ] },
              " '",
              { $substr: [ { $toString: "$_id.year" }, 2, 2 ] }
          ]},
          spent: "$totalSpent"
      }}
    ]);
    res.json(monthlyExpenses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/category-expenses", verifyUser, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const categoryExpenses = await Expense.aggregate([
      { $match: { paidBy: userId } },
      { $group: { _id: "$category", value: { $sum: "$amount" } }},
      { $project: { _id: 0, name: "$_id", value: 1 }}
    ]);
    res.json(categoryExpenses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================
// BALANCE & SETTLEMENT ROUTES
// ===========================================
router.get("/api/balances", verifyUser, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const balancesData = await Transaction.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$friend", total: { $sum: "$amount" } } }
    ]);

    const friendIds = balancesData.map(item => item._id);
    if(friendIds.length === 0) return res.json([]);
    
    const friends = await User.find({ '_id': { $in: friendIds } }).select("name profilePic").lean();
    const friendMap = friends.reduce((map, f) => { map[f._id.toString()] = f; return map; }, {});

    const finalBalances = balancesData
        .filter(item => Math.abs(item.total) > 0.01)
        .map(item => ({ friend: friendMap[item._id.toString()], amount: item.total }))
        .filter(item => item.friend);

    res.json(finalBalances);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



// ===========================================
// DASHBOARD ROUTE (No changes)
// ===========================================
router.get("/dashboard", verifyUser, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        const profile = await User.findById(userId).select("name email profilePic _id").lean();
        if(!profile) return res.status(404).json({ message: "User not found." });

        const recentExpenses = await Expense.find({ $or: [{ paidBy: userId }, { "participants.user": userId }]})
            .populate("paidBy", "name")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const totalSpentResult = await Expense.aggregate([
            { $match: { paidBy: userId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const balancesData = await Transaction.aggregate([
          { $match: { user: userId }},
          { $group: {
              _id: "$friend",
              balance: { $sum: "$amount" }
          }},
        ]);
        
        let toPay = 0;
        let toReceive = 0;
        
        balancesData.forEach(item => {
          if (item.balance < 0) toPay += Math.abs(item.balance);
          else toReceive += item.balance;
        });

        const balances = {
          toPay,
          toReceive
        };
        

        res.json({
            profile: { ...profile, username: profile.name },
            recentExpenses,
            totalSpent: totalSpentResult[0]?.total || 0,
            pending: balances
        });
    } catch(err) {
        console.error("Error fetching dashboard data:", err);
        res.status(500).json({ message: "Server Error" });
    }
});



module.exports = router;