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
  
  // Inject CSS styles
  injectPodyStyles();
  
  // Create PODY editor modal
  const modal = createPodyEditorModal(data);
  
  // Add to page
  document.body.appendChild(modal);
  
  // Force the modal to be visible immediately, then add animation class
  const modalElement = modal.querySelector('.pody-editor-modal');
  modalElement.style.opacity = '1';
  modalElement.style.transform = 'translate(-50%, -50%) scale(1)';
  
  // Add animation class for future transitions
  setTimeout(() => {
    modal.classList.add('pody-show');
  }, 10);
}

function injectPodyStyles() {
  if (!document.getElementById('pody-enhanced-styles')) {
    const style = document.createElement('style');
    style.id = 'pody-enhanced-styles';
    style.textContent = `
      @keyframes podyFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes podyScaleIn {
        from { 
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.9);
        }
        to { 
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      
      @keyframes podySlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes podyPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .pody-modal-backdrop {
        animation: podyFadeIn 0.3s ease-out;
      }
      
      .pody-modal-backdrop.pody-show {
        opacity: 1;
      }
      
      .pody-modal-backdrop.pody-show .pody-editor-modal {
        opacity: 1 !important;
        transform: translate(-50%, -50%) scale(1) !important;
        animation: podyScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .pody-button-hover {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .pody-button-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .pody-editor-focus {
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
        border-color: #007bff !important;
      }
      
      .pody-save-success {
        animation: podyPulse 0.6s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }
}

function createPodyEditorModal(data) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'pody-modal-backdrop';
    backdrop.className = 'pody-modal-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'pody-editor-modal';
    modal.className = 'pody-editor-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      width: 85vw;
      max-width: 900px;
      height: 85vh;
      max-height: 700px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
      padding: 20px 24px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      border-radius: 16px 16px 0 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const headerTitle = document.createElement('div');
    headerTitle.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;
    headerTitle.innerHTML = `
      <span style="font-size: 20px; font-weight: 700;">
        PODY File Editor
      </span>
      <span style="font-size: 13px; opacity: 0.9; font-weight: 400; color: rgba(255, 255, 255, 0.8);">
        ${data.fileName} • Modified: ${new Date(data.timestamp).toLocaleString()}
      </span>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.id = 'pody-modal-close';
    closeBtn.className = 'pody-button-hover';
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 8px;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
    `;
    closeBtn.innerHTML = '×';
    closeBtn.onmouseover = () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.25)';
      closeBtn.style.transform = 'scale(1.1)';
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.15)';
      closeBtn.style.transform = 'scale(1)';
    };

    header.appendChild(headerTitle);
    header.appendChild(closeBtn);

    // Create content area
    const contentArea = document.createElement('div');
    contentArea.style.cssText = `
      flex: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
      box-sizing: border-box;
    `;

    // Create editor textarea
    const editorLabel = document.createElement('label');
    editorLabel.style.cssText = `
      font-weight: 600;
      margin-bottom: 12px;
      color: #374151;
      font-size: 15px;
      letter-spacing: -0.025em;
    `;
    editorLabel.innerHTML = `File Content:`;

    const editor = document.createElement('textarea');
    editor.id = 'pody-content-editor';
    editor.style.cssText = `
      flex: 1;
      width: 100%;
      min-width: 0;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      padding: 16px;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.4;
      resize: none;
      outline: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      background: #f9fafb;
      color: #374151;
      white-space: pre;
      overflow-wrap: normal;
      word-wrap: normal;
      overflow-x: auto;
      overflow-y: auto;
      tab-size: 2;
      box-sizing: border-box;
    `;
    editor.value = data.content;
    editor.onfocus = () => {
      editor.classList.add('pody-editor-focus');
      editor.style.background = '#ffffff';
      editor.style.borderColor = '#6b7280';
    };
    editor.onblur = () => {
      editor.classList.remove('pody-editor-focus');
      editor.style.background = '#f9fafb';
      editor.style.borderColor = '#d1d5db';
    };

    // Create footer with buttons
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 20px 24px;
      background: #f3f4f6;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      border-radius: 0 0 16px 16px;
    `;

    // File info
    const fileInfo = document.createElement('div');
    fileInfo.style.cssText = `
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
    `;
    fileInfo.innerHTML = `
      <span>Size: ${data.content.length} characters</span>
    `;

    // Buttons container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
    `;

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'pody-button-hover';
    cancelBtn.style.cssText = `
      padding: 12px 24px;
      border: 2px solid #d1d5db;
      background: #ffffff;
      color: #6b7280;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    cancelBtn.innerHTML = `Cancel`;
    cancelBtn.onmouseover = () => {
      cancelBtn.style.background = '#f9fafb';
      cancelBtn.style.borderColor = '#9ca3af';
      cancelBtn.style.color = '#374151';
    };
    cancelBtn.onmouseout = () => {
      cancelBtn.style.background = '#ffffff';
      cancelBtn.style.borderColor = '#d1d5db';
      cancelBtn.style.color = '#6b7280';
    };

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'pody-button-hover';
    saveBtn.style.cssText = `
      padding: 12px 28px;
      border: none;
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
    `;
    saveBtn.innerHTML = `Save Changes`;
    saveBtn.onmouseover = () => {
      saveBtn.style.background = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
      saveBtn.style.boxShadow = '0 6px 16px rgba(107, 114, 128, 0.4)';
    };
    saveBtn.onmouseout = () => {
      saveBtn.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
      saveBtn.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
    };

    // Add event listeners
    closeBtn.addEventListener('click', removePodyViewer);
    cancelBtn.addEventListener('click', removePodyViewer);
    
    saveBtn.addEventListener('click', () => {
      const newContent = editor.value;
      savePodyFile(data.fileName, newContent);
    });

    // Close modal when clicking backdrop
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        removePodyViewer();
      }
    });

    // Update character count in real time
    editor.addEventListener('input', () => {
      fileInfo.innerHTML = `
        <span>Size: ${editor.value.length} characters</span>
      `;
    });

    // Assemble modal
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(saveBtn);
    footer.appendChild(fileInfo);
    footer.appendChild(buttonContainer);

    contentArea.appendChild(editorLabel);
    contentArea.appendChild(editor);

    modal.appendChild(header);
    modal.appendChild(contentArea);
    modal.appendChild(footer);

    backdrop.appendChild(modal);

    return backdrop;
}

function removePodyViewer() {
  const existing = document.getElementById('pody-modal-backdrop');
  if (existing) {
    // Add exit animation
    existing.style.animation = 'podyFadeIn 0.2s ease-in reverse';
    const modal = existing.querySelector('.pody-editor-modal');
    if (modal) {
      modal.style.animation = 'podyScaleIn 0.2s ease-in reverse';
    }
    
    setTimeout(() => {
      existing.remove();
    }, 200);
  }
}

function savePodyFile(fileName, content) {
  // Show saving indicator
  const saveBtn = document.querySelector('#pody-editor-modal .pody-button-hover:last-child');
  const originalHTML = saveBtn.innerHTML;
  saveBtn.innerHTML = 'Saving...';
  saveBtn.style.background = 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)';
  saveBtn.style.boxShadow = 'none';
  saveBtn.disabled = true;
  saveBtn.style.cursor = 'not-allowed';

  const timestamp = Date.now();

  // Get current file list and update the existing file
  chrome.storage.local.get('podyFiles', (result) => {
    let podyFiles = result.podyFiles || [];
    
    // Find and update the existing file
    const existingIndex = podyFiles.findIndex(file => file.name === fileName);
    if (existingIndex >= 0) {
      // Update the file content in the existing entry
      podyFiles[existingIndex].content = content;
      podyFiles[existingIndex].timestamp = timestamp;
      podyFiles[existingIndex].size = content.length;
      
      // Save back to storage
      chrome.storage.local.set({ podyFiles: podyFiles }, () => {
        console.log(`Successfully saved PODY file: ${fileName} (${content.length} characters)`);
        
        // Show success state
        saveBtn.innerHTML = 'Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        saveBtn.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
        saveBtn.classList.add('pody-save-success');
        
        // Show success notification
        showSaveNotification('File saved successfully!', 'success');
        
        // Close modal after short delay
        setTimeout(() => {
          removePodyViewer();
        }, 1000);
      });
    } else {
      console.warn(`File ${fileName} not found in file list`);
      
      // Show error state
      saveBtn.innerHTML = 'Save Failed';
      saveBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      saveBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
      saveBtn.disabled = false;
      saveBtn.style.cursor = 'pointer';
      
      // Show error notification
      showSaveNotification('File not found. Please try again.', 'error');
      
      // Reset button after delay
      setTimeout(() => {
        saveBtn.innerHTML = originalHTML;
        saveBtn.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        saveBtn.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
        saveBtn.classList.remove('pody-save-success');
      }, 2000);
    }
  });
}

function showSaveNotification(message, type) {
  // Remove any existing notification
  const existing = document.getElementById('pody-save-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'pody-save-notification';
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 10001;
    animation: podySlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 12px;
    ${type === 'success' ? 
      'background: linear-gradient(135deg, #10b981 0%, #059669 100%);' : 
      'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);'
    }
  `;
  
  const icon = type === 'success' ? '✓' : '✗';
  notification.innerHTML = `<span style="font-size: 16px; font-weight: bold;">${icon}</span><span>${message}</span>`;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'podySlideIn 0.3s ease-in reverse';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 3000);
}