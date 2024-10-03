const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Add an API route that returns some data
app.get('/api/data', (req, res) => {
  res.json({ message: 'This is the data from the backend!' });
});

// Root route (optional)
app.get('/', (req, res) => res.send('Hello World'));

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
