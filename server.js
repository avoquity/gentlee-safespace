
// Simple Express server for handling client-side routing in production
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 8080;

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
