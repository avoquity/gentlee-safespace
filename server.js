
// Express server with improved SSR support for Vercel
const express = require('express');
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT || 8080;

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  immutable: true
}));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Only start the server if not in Vercel environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app; // Export for Vercel serverless
