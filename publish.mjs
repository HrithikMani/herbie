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
  const chromeWebstoreUpload = await import('chrome-webstore-upload');

  const extensionId = process.env.CHROME_APP_ID;
  const clientId = process.env.CHROME_CLIENT_ID;
  const clientSecret = process.env.CHROME_CLIENT_SECRET;
  const refreshToken = process.env.CHROME_REFRESH_TOKEN;

  const extensionFolder = join(__dirname, 'chrome_extension');
  const zipPath = join(__dirname, 'extension.zip');

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
      archive.directory(extensionFolder, false);
      archive.finalize();
    });
  }

  const webStore = chromeWebstoreUpload.default({
    extensionId,
    clientId,
    clientSecret,
    refreshToken,
  });

  async function uploadExtension() {
    try {
      console.log('Zipping the extension...');
      await zipExtension();

      console.log('Uploading the extension...');
      const uploadResponse = await webStore.uploadExisting(zipPath);
      console.log('Upload Response:', uploadResponse);

      if (uploadResponse.uploadState === 'FAILURE') {
        const errorDetails = uploadResponse.itemError[0];
        console.error(`Upload Failed: ${errorDetails.error_code} - ${errorDetails.error_detail}`);

        if (errorDetails.error_code === 'ITEM_NOT_UPDATABLE') {
          console.error(
            'The extension cannot be updated now. It is likely in pending review, ready to publish, or marked for deletion.'
          );
        }
        return; // Exit the function if the upload fails
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
      fs.unlink(zipPath, (err) => {
        if (err) {
          console.error(`Failed to delete ${zipPath}:`, err);
        } else {
          console.log(`${zipPath} was deleted.`);
        }
      });
    }
  }

  uploadExtension();
})();
