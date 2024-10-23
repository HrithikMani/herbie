import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import archiver from 'archiver';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  // Dynamically import the ES module
  const chromeWebstoreUpload = await import('chrome-webstore-upload');

  // Use environment variables
  const extensionId = process.env.EXTENSION_ID;  
  const clientId = process.env.CLIENT_ID; 
  const clientSecret = process.env.CLIENT_SECRET; 
  const refreshToken = process.env.REFRESH_TOKEN; 

  const extensionFolder = join(__dirname, 'chrome_extension'); // Path to the folder to zip
  const zipPath = join(__dirname, 'extension.zip'); // Output zip file path

  // Function to zip the extension folder
  function zipExtension() {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`Zipped ${archive.pointer()} total bytes.`);
        resolve();
      });

      archive.on('error', (err) => reject(err));
      archive.pipe(output);

      // Add all files and subdirectories in the extension folder to the zip
      archive.directory(extensionFolder, false); // The second argument set to false ensures the folder structure is maintained at root level
      archive.finalize();
    });
  }

  // Initialize the web store instance
  const webStore = chromeWebstoreUpload.default({
    extensionId,
    clientId,
    clientSecret,
    refreshToken,
  });

  // Function to upload and publish the extension
  async function uploadExtension() {
    try {
      console.log('Zipping the extension...');
      await zipExtension(); // Step 1: Zip the extension

      console.log('Uploading the extension...');
      const uploadResponse = await webStore.uploadExisting(zipPath); // Step 2: Upload the extension
      console.log('Upload Response:', uploadResponse);

      console.log('Publishing the extension...');
      const publishResponse = await webStore.publish(); // Step 3: Publish the extension
      console.log('Publish Response:', publishResponse);
    } catch (error) {
      console.error('Error during upload or publish:', error);
    } finally {
      // Delete the zip file after processing
      fs.unlink(zipPath, (err) => {
        if (err) {
          console.error(`Failed to delete ${zipPath}:`, err);
        } else {
          console.log(`${zipPath} was deleted.`);
        }
      });
    }
  }

  // Run the upload and publish process
  uploadExtension();
})();
