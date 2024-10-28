import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import archiver from 'archiver';
import dotenv from 'dotenv';
import crypto from 'crypto';
import AdmZip from 'adm-zip'; // Install using: npm install adm-zip

// Load environment variables from .env file
dotenv.config();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Asynchronous wrapper function to handle the whole process
(async () => {
  const chromeWebstoreUpload = await import('chrome-webstore-upload');

  // Read environment variables
  const extensionId = process.env.CHROME_APP_ID;
  const clientId = process.env.CHROME_CLIENT_ID;
  const clientSecret = process.env.CHROME_CLIENT_SECRET;
  const refreshToken = process.env.CHROME_REFRESH_TOKEN;

  // Validate environment variables
  if (!extensionId || !clientId || !clientSecret || !refreshToken) {
    console.error('Missing environment variables. Please check your .env file.');
    process.exit(1);
  }

  const extensionFolder = join(__dirname, 'chrome_extension');
  const zipPath = join(__dirname, 'build.zip'); // Save ZIP in the root

  // Ensure the extension folder exists
  if (!fs.existsSync(extensionFolder)) {
    console.error(`Extension folder not found: ${extensionFolder}`);
    process.exit(1);
  }

  // Function to zip the extension folder
  function zipExtension() {
    return new Promise((resolve, reject) => {
      console.log('Starting the zipping process...');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`Zipping complete. Total bytes: ${archive.pointer()}`);
        resolve();
      });

      archive.on('error', (err) => {
        console.error('Error during zipping:', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(extensionFolder, false);
      archive.finalize();
    });
  }

  // Function to inspect the ZIP file's contents
  function inspectZip(filePath) {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();
    console.log('Inspecting ZIP contents:');
    entries.forEach((entry) => {
      console.log(`- ${entry.entryName}`);
    });
  }

  // Function to generate MD5 checksum of a file
  function generateChecksum(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    console.log(`MD5 Checksum: ${hash}`);
    return hash;
  }

  const webStore = chromeWebstoreUpload.default({
    extensionId,
    clientId,
    clientSecret,
    refreshToken,
  });

  // Function to handle extension upload
  async function uploadExtension() {
    try {
      console.log('Zipping the extension...');
      await zipExtension();

      console.log('Inspecting the build.zip file before upload...');
      inspectZip(zipPath);

      console.log('Generating MD5 checksum for build.zip...');
      generateChecksum(zipPath);

      console.log('Uploading the extension...');
      const uploadResponse = await webStore.uploadExisting(fs.createReadStream(zipPath));
      console.log('Upload Response:', uploadResponse);

      if (uploadResponse.uploadState === 'FAILURE') {
        const errorDetails = uploadResponse.itemError[0];
        console.error(`Upload Failed: ${errorDetails.error_code} - ${errorDetails.error_detail}`);

        if (errorDetails.error_code === 'ITEM_NOT_UPDATABLE') {
          console.error(
            'The extension cannot be updated now. It is likely in pending review, ready to publish, or marked for deletion.'
          );
        }
        return; // Exit on upload failure
      }

      console.log('Publishing the extension...');
      const publishResponse = await webStore.publish();
      console.log('Publish Response:', publishResponse);

    } catch (error) {
      console.error('Error during upload or publish:', error.message);
      if (error.response?.error?.message) {
        console.error(`Additional Info: ${error.response.error.message}`);
      }
    } finally {
      console.log(`The build.zip file is saved at ${zipPath} for verification.`);
      console.log('Skipping deletion of the ZIP file for manual inspection.');
    }
  }

  // Execute the upload process
  uploadExtension();
})();
