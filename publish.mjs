import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import archiver from 'archiver';
import dotenv from 'dotenv';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import { exec } from 'child_process'; // To run shell commands

// Load environment variables from .env file
dotenv.config();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const extensionFolder = join(__dirname, 'chrome_extension'); // Main extension folder
const distFolder = join(extensionFolder, 'dist'); // 'dist' folder inside chrome_extension
const zipPath = join(__dirname, 'build.zip'); // Save ZIP in the root folder

// Function to run shell commands (e.g., npm install)
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}\n`, stderr);
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

// Function to copy index.js from mie-simulijs to dist folder and rename to mie-simulijs.js
function updateMieSimulijs() {
  const srcPath = join(__dirname, 'node_modules', 'mie-simulijs', 'index.js'); // Correct file path
  const destPath = join(distFolder, 'mie-simulijs.js'); // Target path in dist

  if (!fs.existsSync(srcPath)) {
    throw new Error('mie-simulijs package not found or index.js missing. Ensure it is installed.');
  }

  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied index.js from mie-simulijs to ${distFolder} as mie-simulijs.js`);
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

// Function to zip the chrome_extension folder
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
    archive.directory(extensionFolder, false); // Zip the entire chrome_extension folder
    archive.finalize();
  });
}

// Main upload function
(async () => {
  const chromeWebstoreUpload = await import('chrome-webstore-upload');

  const { CHROME_APP_ID, CHROME_CLIENT_ID, CHROME_CLIENT_SECRET, CHROME_REFRESH_TOKEN } = process.env;

  const missingVars = ['CHROME_APP_ID', 'CHROME_CLIENT_ID', 'CHROME_CLIENT_SECRET', 'CHROME_REFRESH_TOKEN']
    .filter((key) => !process.env[key]);

  if (missingVars.length) {
    console.error(`Missing environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  const webStore = chromeWebstoreUpload.default({
    extensionId: CHROME_APP_ID,
    clientId: CHROME_CLIENT_ID,
    clientSecret: CHROME_CLIENT_SECRET,
    refreshToken: CHROME_REFRESH_TOKEN,
  });

  try {
    console.log('Installing the latest mie-simulijs package...');
    await runCommand('npm install mie-simulijs');

    console.log('Copying and renaming mie-simulijs index.js to mie-simulijs.js in the dist folder...');
    updateMieSimulijs();

    console.log('Zipping the extension...');
    await zipExtension();

    console.log('Inspecting the build.zip file before upload...');
    inspectZip(zipPath);

    console.log('Generating MD5 checksum for build.zip...');
    generateChecksum(zipPath);

    console.log('Uploading the extension...');
    const uploadResponse = await webStore.uploadExisting(fs.createReadStream(zipPath));
    console.log('Upload Response:', JSON.stringify(uploadResponse, null, 2)); // Pretty-print response

    if (uploadResponse.uploadState === 'FAILURE') {
      const errorDetails = uploadResponse.itemError[0];
      console.error(`Upload Failed: ${errorDetails.error_code} - ${errorDetails.error_detail}`);
      if (errorDetails.error_code === 'ITEM_NOT_UPDATABLE') {
        console.error('The extension cannot be updated now. It may be in review or marked for deletion.');
      }
      return;
    }

    console.log('Publishing the extension...');
    const publishResponse = await webStore.publish();
    console.log('Publish Response:', JSON.stringify(publishResponse, null, 2)); // Pretty-print response
  } catch (error) {
    console.error('Error during the process:', error);

    // Show full error object without filtering
    console.error('Full Error:', JSON.stringify(error, null, 2));

    // Show response details if available
    if (error.response) {
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error(`Status: ${error.response.status} - ${error.response.statusText}`);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    } else {
      console.error('Unknown Error:', error);
    }
  } finally {
    console.log(`The build.zip file is saved at ${zipPath} for verification.`);
    console.log('Skipping deletion of the ZIP file for manual inspection.');
  }
})();
