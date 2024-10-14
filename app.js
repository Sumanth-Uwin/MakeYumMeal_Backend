const express = require('express');
require('dotenv').config();
const cors = require('cors')
const { PORT } = require('./config');
const app = express();
const connection = require("./node-mongoDB/db.cjs");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
connection();
// Add an API route that returns some data
app.get('/api/data', (req, res) => {
  res.json({ message: 'This is the data from the backend!' });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Root route (optional)
app.get('/', (req, res) => res.send('Hello World'));

// Start the server
const port=process.env.PORT;
app.listen(port, () => console.log('Server running on port 3100',{port}))
