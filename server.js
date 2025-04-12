const express = require('express');
const mongoose = require('mongoose');

// Initialize app
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/basicdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.render('index.ejs');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
