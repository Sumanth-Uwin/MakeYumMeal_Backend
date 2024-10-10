const express = require('express');
require('dotenv').config();
const cors = require('cors')
const { PORT } = require('./config');
const app = express();
const {mongoose}=require('mongoose');

// Enable CORS for all routes
app.use(cors());
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('DB Connected'))
.catch(()=>console.log('Db not Connected.'));
// Add an API route that returns some data
app.get('/api/data', (req, res) => {
  res.json({ message: 'This is the data from the backend!' });
});

// Root route (optional)
app.get('/', (req, res) => res.send('Hello World'));

// Start the server
app.listen(PORT, () => console.log('Server running on port 3100'));
