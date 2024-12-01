const express = require("express");
const mongoose = require('mongoose');
const ShoppingList = require("../models/shoppingListModel");
const router = express.Router();

// Add selected ingredients to the shopping list
router.post("/add", async (req, res) => {
  const { userId, selectedIngredients } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'UserId is required' });
  }

  try {
    let shoppingList = await ShoppingList.findOne({ userId });

    if (!shoppingList) {
      shoppingList = new ShoppingList({
        userId,
        items: selectedIngredients,
      });
    } else {
      shoppingList.items = [
        ...shoppingList.items,
        ...selectedIngredients.filter(
          (item) => !shoppingList.items.some((existingItem) => existingItem.ingredientId === item.ingredientId)
        ),
      ];
    }

    await shoppingList.save();
    res.status(201).json(shoppingList);
  } catch (error) {
    console.error("Error adding to shopping list:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user's shopping list
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const shoppingList = await ShoppingList.findOne({ userId });
    
    if (!shoppingList) {
      return res.status(404).json({ message: "Shopping list not found." });
    }
    
    res.json(shoppingList);
  } catch (error) {
    console.error("Error fetching shopping list:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Remove an ingredient from the shopping list
// Modify the router to accept the request body for DELETE requests
router.delete('/remove', async (req, res) => {
  const { userId, ingredientId } = req.body;
  console.log('Received DELETE request with data:', req.body);  // Log for debugging

  // Validate that both userId and ingredientId are provided
  if (!userId || !ingredientId) {
      return res.status(400).json({ error: 'userId and ingredientId are required' });
  }

  try {
      // Convert userId to ObjectId since it is an ObjectId in the DB
      //const objectIdUser = mongoose.Types.ObjectId(userId);

      // Perform the delete operation using userId and ingredientId (as a number, not ObjectId)
      const result = await ShoppingList.updateOne(
          { userId: userId },  // Match by userId
          { $pull: { items: { ingredientId: ingredientId } } }  // ingredientId is a number, not an ObjectId
      );

      if (result.nModified === 0) {
          return res.status(404).json({ error: 'Item not found' });
      }

      res.status(200).json({ message: 'Item removed successfully' });
  } catch (err) {
      console.error('Error removing item:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.put("/update", async (req, res) => {
  const { userId, ingredientId, quantity } = req.body;

  // Validate input
  if (!userId || !ingredientId || quantity === undefined) {
    return res.status(400).json({ error: 'UserId, ingredientId, and quantity are required' });
  }

  try {
    // Find the shopping list for the user
    const shoppingList = await ShoppingList.findOne({ userId });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    // Find the specific item and update its quantity
    const itemToUpdate = shoppingList.items.find(
      item => item.ingredientId === ingredientId
    );

    if (!itemToUpdate) {
      return res.status(404).json({ error: 'Item not found in shopping list' });
    }

    // Update the quantity
    itemToUpdate.quantity = quantity;

    // Save the updated shopping list
    await shoppingList.save();

    res.status(200).json({ 
      message: 'Item quantity updated successfully',
      updatedItem: itemToUpdate 
    });

  } catch (error) {
    console.error("Error updating item quantity:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;