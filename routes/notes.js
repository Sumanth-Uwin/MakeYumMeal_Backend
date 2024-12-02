const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');

// Create a new note
router.post('/create', async (req, res) => {
  const { title, content } = req.body;

  try {
    const newNote = new Notes({
      title,
      content
    });

    await newNote.save();
    res.status(201).json({ message: 'Note created successfully', note: newNote });
  } catch (err) {
    res.status(500).json({ message: 'Error creating note', error: err });
  }
});

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json({ notes });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes', error: err });
  }
});

module.exports = router;
