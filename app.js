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
const noteRoutes = require('./routes/notes');
const Note = require('./models/Notes');
const config =require('./config')
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
// Example Express route handler for fetching all notes for a user
// Example Express route handler for fetching all notes for a user
app.get('/api/notes/:userId', async (req, res) => {
  const { userId } = req.params;  // Extract userId from route parameters

  // Validate that the userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid User ID.' });
  }

  try {
    // Fetch notes for the specific userId
    const notes = await Note.find({ userId: new mongoose.Types.ObjectId(userId) });  // Correct model name 'Note'

    if (!notes || notes.length === 0) {
      return res.status(404).json({ message: 'No notes found for this user.' });
    }

    res.status(200).json(notes);  // Return the notes
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Internal server error while fetching notes.', error: error.message });
  }
});



// Route to create a new note
// Route to create a new note for a recipe
app.post('/api/notes/create', async (req, res) => {
  const { title, content, recipeId, userId } = req.body;  // Extract userId, recipeId, title, and content from the request body

  if (!userId || !recipeId) {
    return res.status(400).json({ message: "User ID and Recipe ID are required" });
  }

  try {
    // Ensure userId is a valid ObjectId
    const validUserId = new mongoose.Types.ObjectId(userId);  // Correct way to instantiate ObjectId

    // Create a new note
    const newNote = new Note({
      userId: validUserId,  // Store the userId
      recipeId: recipeId,   // Store the recipeId (could be a string or ObjectId)
      title: title,
      content: content,
    });

    // Save the note to the database
    await newNote.save();
    res.status(201).json(newNote);  // Respond with the created note
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Error creating note.', error: error.message });
  }
});




// Example Express route handler for deleting a note
app.delete('/api/notes/:noteId', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
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
app.use('/api/notes', noteRoutes);

// Root route (optional)
app.get("/", (req, res) => res.send("Hello World"));

// Start the server
const port = config.PORT
app.listen(port, () => console.log(`Server running on port ${port}`));
