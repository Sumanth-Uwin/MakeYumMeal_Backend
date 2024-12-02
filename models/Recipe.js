const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipeId: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  ingredients: [{ type: Object, required: true }], // Array of ingredient objects
  instructions: [{ type: Object, required: true }], // Array of instruction steps
}, { timestamps: true });

module.exports = mongoose.model("Recipe", RecipeSchema);
