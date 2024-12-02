const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { PORT } = require("./config");
const app = express();
const connection = require("./node-mongoDB/db.cjs");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const recipeApi = require("./recipeApi");
const shoppingListRoutes = require("./routes/shoppingList");
const Recipe = require("./models/Recipe");
const { UserModel: User } = require("./models/User");  // Import the User model
const mongoose = require('mongoose');

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
app.use(express.json());
connection();

// API route to fetch complete recipe details
app.get("/api/recipes/search", async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const page = parseInt(req.query.page) || 0;

  try {
    const results = await recipeApi.getCompleteRecipeDetails(searchTerm, page);
    return res.json(results);
  } catch (error) {
    console.error("Error in /api/recipes/search:", error.message);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
});

// Save Recipe route
app.post("/api/recipes/save", async (req, res) => {
  const { userId, recipeId, title, image, ingredients, instructions } = req.body;

  try {
    // Find the user (authentication should be done before this step)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the recipe already exists for the user
    const existingRecipe = await Recipe.findOne({ userId, recipeId });
    if (existingRecipe) {
      return res.status(400).json({ message: "Recipe already saved" });
    }

    // Create new recipe
    const newRecipe = new Recipe({
      userId,
      recipeId,
      title,
      image,
      ingredients,
      instructions,
    });

    // Save the recipe to the database
    await newRecipe.save();
    res.status(200).json({ message: "Recipe saved successfully", recipe: newRecipe });
  } catch (error) {
    console.error("Error saving recipe:", error);
    res.status(500).json({ message: "Error saving recipe", error: error.message });
  }
});

// Get saved recipes route
app.get("/api/recipes", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Ensure userId is a valid ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);  // Correct way to instantiate ObjectId

    const recipes = await Recipe.find({ userId: objectId });

    console.log("Recipes found:", recipes);

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error in /api/recipes route:", {
      errorName: error.name,
      errorMessage: error.message,
      userId: userId
    });

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Invalid User ID format",
        error: error.message
      });
    }

    res.status(500).json({
      message: "Error fetching recipes",
      error: error.toString()
    });
  }
});
app.delete("/api/recipes/:recipeId", async (req, res) => {
  const { userId } = req.query;
  const { recipeId } = req.params;

  try {
    const result = await Recipe.deleteOne({ userId, recipeId });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Recipe removed successfully" });
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    console.error("Error removing recipe:", error);
    res.status(500).json({ message: "Error removing recipe" });
  }
});
// Routes for user and authentication
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shoppingList", shoppingListRoutes);

// Root route (optional)
app.get("/", (req, res) => res.send("Hello World"));

// Start the server
const port = process.env.PORT || 3100;
app.listen(port, () => console.log(`Server running on port ${port}`));
