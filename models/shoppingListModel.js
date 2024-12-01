const mongoose = require("mongoose");

const shoppingListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a "User" model
      required: true,
      index: true  // Add indexing for faster queries
    },
    items: [
      {
        name: {
          type: String,
          required: true,
          trim: true  // Remove whitespace from start and end
        },
        quantity: { 
          type: Number, 
          default: 1,
          min: 1  // Ensure quantity is always at least 1
        },
        ingredientId: { 
          type: Number, 
          required: true,
          unique: true  // Ensure unique ingredient IDs
        },
      },
    ],
  },
  { 
    timestamps: true,
    // Add validation to ensure unique ingredientIds within the items array
    validateBeforeSave: true 
  }
);

// Optional: Add a method to check if an ingredient already exists
shoppingListSchema.methods.hasIngredient = function(ingredientId) {
  return this.items.some(item => item.ingredientId === ingredientId);
};

// Optional: Pre-save hook to ensure data integrity
shoppingListSchema.pre('save', function(next) {
  // Ensure no duplicate ingredientIds within the same list
  const ingredientIds = this.items.map(item => item.ingredientId);
  const uniqueIds = new Set(ingredientIds);
  
  if (ingredientIds.length !== uniqueIds.size) {
    return next(new Error('Duplicate ingredient IDs are not allowed'));
  }
  
  next();
});

const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);

module.exports = ShoppingList;