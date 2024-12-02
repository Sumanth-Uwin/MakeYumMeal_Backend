const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  recipeId: {
    type: String, // Or ObjectId if it refers to another collection
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Ensures ObjectId type for userId
    ref: "User", // Referring to User model
    required: true, // userId is required
  },
});

const Notes = mongoose.model("Note", noteSchema);

module.exports = Notes;
