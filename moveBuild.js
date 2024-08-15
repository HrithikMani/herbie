const fs = require('fs');
const path = require('path');

// Define the paths
const buildPath = path.join(__dirname, 'build');
const docsPath = path.join(__dirname, 'docs');

// Remove the existing docs directory if it exists
if (fs.existsSync(docsPath)) {
  fs.rmSync(docsPath, { recursive: true });
}

// Move the build folder to docs
fs.renameSync(buildPath, docsPath);
