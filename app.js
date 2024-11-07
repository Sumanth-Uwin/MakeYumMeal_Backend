const express = require('express');
require('dotenv').config();
const cors = require('cors')
const { PORT } = require('./config');
const app = express();
const connection = require("./node-mongoDB/db.cjs");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const recipeApi=require("./recipeApi");

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
connection();
// Add an API route that returns some data
app.get('/api/data', (req, res) => {
  res.json({ message: 'This is the data from the backend!' });
});
app.get("/api/recipes/search", async (req, res) => {
  const searchTerm = req.query.searchTerm
  const page = parseInt(req.query.page);
  const results = await recipeApi.searchRecipes(searchTerm, page);

  return res.json(results);
});

app.get("/api/recipes/:recipeId/information", async (req, res) => {
  const recipeId = req.params.recipeId;
  const results = await recipeApi.getRecipeInstructions(recipeId);
  return res.json(results);
});


app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Root route (optional)
app.get('/', (req, res) => res.send('Hello World'));

// Start the server
const port=process.env.PORT;
app.listen(port, () => console.log('Server running on port 3100',{port}))
