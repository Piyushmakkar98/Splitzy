const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePic: {
    type: String,
    default: '', // Default to an empty string
  },
  password: {
    type: String,
    required: true,
    select: false, 
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
    },
  ],
}, { timestamps: true });

userSchema.pre('save', function(next) {
  // Check if this is a new user and if they haven't set a profile picture
  if (this.isNew && !this.profilePic) {
    // 'this' refers to the user document being saved
    this.profilePic = `https://i.pravatar.cc/150?u=${this._id}`;
  }
  next(); // Continue with the save operation
});

module.exports = mongoose.model("User", userSchema);
