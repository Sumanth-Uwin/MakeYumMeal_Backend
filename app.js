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

// Enable CORS for all routes
app.use(cors());
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
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shoppingList", shoppingListRoutes);
// Root route (optional)
app.get("/", (req, res) => res.send("Hello World"));

// Start the server
const port = process.env.PORT || 3100;
app.listen(port, () => console.log(`Server running on port ${port}`));
