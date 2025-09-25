// PODY Content Script Handler
// Handles PODY file viewing and processing in content scripts

console.log('PODY content script handler loaded');

// PODY message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'viewPodyFile') {
    try {
      console.log('PODY Handler: Processing file view request', message.data.fileName);
      
      // Create and show PODY file viewer
      showPodyViewer(message.data);
      
      sendResponse({ 
        status: 'success', 
        message: 'PODY file displayed successfully' 
      });
      
      return true;
    } catch (error) {
      console.error('PODY Handler: Error processing file view', error);
      sendResponse({ 
        status: 'error', 
        message: error.message 
      });
      return true;
    }
  }
  return false;
});

function showPodyViewer(data) {
  // Remove any existing PODY viewer
  removePodyViewer();
  
  // Create PODY viewer UI
  const viewer = createPodyViewer(data);
  
  // Add to page
  document.body.appendChild(viewer);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    removePodyViewer();
  }, 5000);
}

function createPodyViewer(data) {
    const viewer = document.createElement('div');
    viewer.id = 'pody-viewer';
    viewer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      max-height: 400px;
      background: white;
      border: 2px solid #007bff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      overflow: hidden;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      background: #007bff;
      color: white;
      padding: 12px 16px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span>PODY File Viewer</span>
      <button id="pody-close" style="
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
      ">×</button>
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      padding: 16px;
      max-height: 320px;
      overflow-y: auto;
    `;

    const fileName = document.createElement('div');
    fileName.style.cssText = `
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    `;
    fileName.textContent = `File: ${data.fileName}`;

    const timestamp = document.createElement('div');
    timestamp.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-bottom: 12px;
    `;
    timestamp.textContent = `Loaded: ${new Date(data.timestamp).toLocaleString()}`;

    const contentPreview = document.createElement('div');
    contentPreview.style.cssText = `
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    contentPreview.textContent = data.content.substring(0, 500) + 
      (data.content.length > 500 ? '\n\n... (content truncated)' : '');

    const statusMessage = document.createElement('div');
    statusMessage.style.cssText = `
      margin-top: 12px;
      padding: 8px;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      color: #155724;
      font-size: 12px;
    `;
    statusMessage.textContent = 'PODY file content successfully received from extension';

    content.appendChild(fileName);
    content.appendChild(timestamp);
    content.appendChild(contentPreview);
    content.appendChild(statusMessage);

    viewer.appendChild(header);
    viewer.appendChild(content);

    // Add close button functionality
    const closeBtn = viewer.querySelector('#pody-close');
    closeBtn.addEventListener('click', () => {
      removePodyViewer();
    });

    return viewer;
}

function removePodyViewer() {
  const existing = document.getElementById('pody-viewer');
  if (existing) {
    existing.remove();
  }
}