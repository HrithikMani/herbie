// PODY Content Script Handler - Refactored
// Handles PODY file viewing and processing in content scripts

console.log('PODY content script handler loaded');

// Configuration and Constants
const PODY_CONFIG = {
  MODAL_ID: 'pody-modal-backdrop',
  EDITOR_ID: 'pody-content-editor',
  STYLES_ID: 'pody-enhanced-styles',
  NOTIFICATION_ID: 'pody-save-notification',
  Z_INDEX: {
    MODAL: 10000,
    NOTIFICATION: 10001
  },
  ANIMATIONS: {
    FADE_DURATION: 300,
    SCALE_DURATION: 400,
    EXIT_DURATION: 200,
    NOTIFICATION_DURATION: 3000,
    SUCCESS_DELAY: 1000
  }
};

// Styles Configuration
const PODY_STYLES = {
  keyframes: `
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
  `,
  
  classes: `
    .pody-modal-backdrop {
      animation: podyFadeIn ${PODY_CONFIG.ANIMATIONS.FADE_DURATION}ms ease-out;
    }
    
    .pody-modal-backdrop.pody-show {
      opacity: 1;
    }
    
    .pody-modal-backdrop.pody-show .pody-editor-modal {
      opacity: 1 !important;
      transform: translate(-50%, -50%) scale(1) !important;
      animation: podyScaleIn ${PODY_CONFIG.ANIMATIONS.SCALE_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .pody-button-hover {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer !important;
    }
    
    .pody-button-hover:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer !important;
    }
    
    .pody-editor-focus {
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      border-color: #007bff !important;
    }
    
    .pody-save-success {
      animation: podyPulse 0.6s ease-in-out;
    }
  `
};

const COMPONENT_STYLES = {
  backdrop: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: ${PODY_CONFIG.Z_INDEX.MODAL};
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  `,
  
  modal: `
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
  `,
  
  header: `
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
  `,
  
  closeButton: `
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer !important;
    padding: 8px;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
  `,
  
  contentArea: `
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #ffffff;
    box-sizing: border-box;
  `,
  
  editor: `
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
  `,
  
  footer: `
    padding: 20px 24px;
    background: #f3f4f6;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    border-radius: 0 0 16px 16px;
  `,
  
  primaryButton: `
    padding: 12px 28px;
    border: none;
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    color: white;
    border-radius: 8px;
    cursor: pointer !important;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
  `,
  
  secondaryButton: `
    padding: 12px 24px;
    border: 2px solid #d1d5db;
    background: #ffffff;
    color: #6b7280;
    border-radius: 8px;
    cursor: pointer !important;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `,
  
  notification: (type) => `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: ${PODY_CONFIG.Z_INDEX.NOTIFICATION};
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
  `
};

// Style Manager
class PodyStyleManager {
  static inject() {
    if (!document.getElementById(PODY_CONFIG.STYLES_ID)) {
      const style = document.createElement('style');
      style.id = PODY_CONFIG.STYLES_ID;
      style.textContent = PODY_STYLES.keyframes + PODY_STYLES.classes;
      document.head.appendChild(style);
    }
  }
  
  static cleanup() {
    const styleElement = document.getElementById(PODY_CONFIG.STYLES_ID);
    if (styleElement) {
      styleElement.remove();
    }
  }
}

// Component Factory
class PodyComponentFactory {
  static createElement(tag, attributes = {}) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'style') {
        element.style.cssText = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('on')) {
        element.addEventListener(key.slice(2), value);
      } else {
        element[key] = value;
      }
    });
    return element;
  }
  
  static createHeader(data, onClose) {
    const header = this.createElement('div', {
      style: COMPONENT_STYLES.header
    });
    
    const headerTitle = this.createElement('div', {
      style: `display: flex; flex-direction: column; gap: 4px;`,
      innerHTML: `
        <span style="font-size: 20px; font-weight: 700;">
          PODY File Editor
        </span>
        <span style="font-size: 13px; opacity: 0.9; font-weight: 400; color: rgba(255, 255, 255, 0.8);">
          ${data.fileName} • Modified: ${new Date(data.timestamp).toLocaleString()}
        </span>
      `
    });

    const closeBtn = this.createElement('button', {
      id: 'pody-modal-close',
      className: 'pody-button-hover',
      style: COMPONENT_STYLES.closeButton,
      innerHTML: '×',
      onclick: onClose,
      onmouseover: (e) => this.animateCloseButton(e.target, true),
      onmouseout: (e) => this.animateCloseButton(e.target, false)
    });

    header.appendChild(headerTitle);
    header.appendChild(closeBtn);
    
    return header;
  }
  
  static createEditor(content) {
    const contentArea = this.createElement('div', {
      style: COMPONENT_STYLES.contentArea
    });

    const editorLabel = this.createElement('label', {
      style: `
        font-weight: 600;
        margin-bottom: 12px;
        color: #374151;
        font-size: 15px;
        letter-spacing: -0.025em;
      `,
      innerHTML: 'File Content:'
    });

    const editor = this.createElement('textarea', {
      id: PODY_CONFIG.EDITOR_ID,
      style: COMPONENT_STYLES.editor,
      value: content,
      onfocus: (e) => this.animateEditorFocus(e.target, true),
      onblur: (e) => this.animateEditorFocus(e.target, false)
    });

    contentArea.appendChild(editorLabel);
    contentArea.appendChild(editor);
    
    return contentArea;
  }
  
  static createFooter(data, onCancel, onSave) {
    const footer = this.createElement('div', {
      style: COMPONENT_STYLES.footer
    });

    const fileInfo = this.createElement('div', {
      id: 'pody-file-info',
      style: `font-size: 13px; color: #6b7280; font-weight: 500;`,
      innerHTML: `<span>Size: ${data.content.length} characters</span>`
    });

    const buttonContainer = this.createElement('div', {
      style: `display: flex; gap: 12px;`
    });

    const cancelBtn = this.createElement('button', {
      className: 'pody-button-hover',
      style: COMPONENT_STYLES.secondaryButton,
      innerHTML: 'Cancel',
      onclick: onCancel,
      onmouseover: (e) => this.animateSecondaryButton(e.target, true),
      onmouseout: (e) => this.animateSecondaryButton(e.target, false)
    });

    const saveBtn = this.createElement('button', {
      id: 'pody-save-btn',
      className: 'pody-button-hover',
      style: COMPONENT_STYLES.primaryButton,
      innerHTML: 'Save Changes',
      onclick: onSave,
      onmouseover: (e) => this.animatePrimaryButton(e.target, true),
      onmouseout: (e) => this.animatePrimaryButton(e.target, false)
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(saveBtn);
    footer.appendChild(fileInfo);
    footer.appendChild(buttonContainer);
    
    return footer;
  }
  
  // Animation helpers
  static animateCloseButton(button, hover) {
    button.style.background = hover ? 
      'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)';
    button.style.transform = hover ? 'scale(1.1)' : 'scale(1)';
    button.style.cursor = 'pointer';
  }
  
  static animateEditorFocus(editor, focused) {
    if (focused) {
      editor.classList.add('pody-editor-focus');
      editor.style.background = '#ffffff';
      editor.style.borderColor = '#6b7280';
    } else {
      editor.classList.remove('pody-editor-focus');
      editor.style.background = '#f9fafb';
      editor.style.borderColor = '#d1d5db';
    }
  }
  
  static animatePrimaryButton(button, hover) {
    button.style.background = hover ?
      'linear-gradient(135deg, #4b5563 0%, #374151 100%)' :
      'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    button.style.boxShadow = hover ?
      '0 6px 16px rgba(107, 114, 128, 0.4)' :
      '0 4px 12px rgba(107, 114, 128, 0.3)';
    button.style.cursor = 'pointer';
  }
  
  static animateSecondaryButton(button, hover) {
    button.style.background = hover ? '#f9fafb' : '#ffffff';
    button.style.borderColor = hover ? '#9ca3af' : '#d1d5db';
    button.style.color = hover ? '#374151' : '#6b7280';
    button.style.cursor = 'pointer';
  }
}

// Main Modal Manager
class PodyModalManager {
  constructor() {
    this.currentModal = null;
    this.currentData = null;
    this.isAnimating = false;
  }
  
  show(data) {
    // If already animating, wait for it to complete
    if (this.isAnimating) {
      setTimeout(() => this.show(data), 50);
      return;
    }
    
    // If modal exists, hide it first and then show new one
    if (this.currentModal) {
      this.hide(() => {
        this._showModal(data);
      });
      return;
    }
    
    // Show modal immediately if none exists
    this._showModal(data);
  }
  
  _showModal(data) {
    PodyStyleManager.inject();
    
    this.currentData = data;
    this.currentModal = this.createModal(data);
    
    document.body.appendChild(this.currentModal);
    this.animateShow();
    this.setupEventListeners();
  }
  
  hide(callback) {
    if (this.currentModal && !this.isAnimating) {
      this.animateHide(() => {
        this.currentModal.remove();
        this.currentModal = null;
        this.currentData = null;
        PodyStyleManager.cleanup();
        
        // Execute callback if provided
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
    } else if (callback && typeof callback === 'function') {
      // If no modal or already animating, just execute callback
      callback();
    }
  }
  
  createModal(data) {
    const backdrop = PodyComponentFactory.createElement('div', {
      id: PODY_CONFIG.MODAL_ID,
      className: 'pody-modal-backdrop',
      style: COMPONENT_STYLES.backdrop
    });

    const modal = PodyComponentFactory.createElement('div', {
      id: 'pody-editor-modal',
      className: 'pody-editor-modal',
      style: COMPONENT_STYLES.modal
    });

    const header = PodyComponentFactory.createHeader(data, () => this.hide());
    const contentArea = PodyComponentFactory.createEditor(data.content);
    const footer = PodyComponentFactory.createFooter(
      data,
      () => this.hide(),
      () => this.saveFile()
    );

    modal.appendChild(header);
    modal.appendChild(contentArea);
    modal.appendChild(footer);
    backdrop.appendChild(modal);

    return backdrop;
  }
  
  animateShow() {
    this.isAnimating = true;
    
    const modalElement = this.currentModal.querySelector('.pody-editor-modal');
    modalElement.style.opacity = '1';
    modalElement.style.transform = 'translate(-50%, -50%) scale(1)';
    
    setTimeout(() => {
      if (this.currentModal) {
        this.currentModal.classList.add('pody-show');
      }
      this.isAnimating = false;
    }, PODY_CONFIG.ANIMATIONS.SCALE_DURATION);
  }
  
  animateHide(callback) {
    if (!this.currentModal) {
      this.isAnimating = false;
      return callback();
    }
    
    this.isAnimating = true;
    
    this.currentModal.style.animation = `podyFadeIn ${PODY_CONFIG.ANIMATIONS.EXIT_DURATION}ms ease-in reverse`;
    const modal = this.currentModal.querySelector('.pody-editor-modal');
    if (modal) {
      modal.style.animation = `podyScaleIn ${PODY_CONFIG.ANIMATIONS.EXIT_DURATION}ms ease-in reverse`;
    }
    
    setTimeout(() => {
      this.isAnimating = false;
      callback();
    }, PODY_CONFIG.ANIMATIONS.EXIT_DURATION);
  }
  
  setupEventListeners() {
    // Close on backdrop click
    this.currentModal.addEventListener('click', (e) => {
      if (e.target === this.currentModal) {
        this.hide();
      }
    });
    
    // Update character count
    const editor = document.getElementById(PODY_CONFIG.EDITOR_ID);
    const fileInfo = document.getElementById('pody-file-info');
    
    if (editor && fileInfo) {
      editor.addEventListener('input', () => {
        fileInfo.innerHTML = `<span>Size: ${editor.value.length} characters</span>`;
      });
    }
  }
  
  saveFile() {
    const editor = document.getElementById(PODY_CONFIG.EDITOR_ID);
    if (!editor || !this.currentData) return;
    
    const saveBtn = document.getElementById('pody-save-btn');
    const originalHTML = saveBtn.innerHTML;
    
    // Show saving state
    this.updateSaveButton(saveBtn, 'Saving...', 'loading');
    
    const newContent = editor.value;
    const timestamp = Date.now();

    chrome.storage.local.get('podyFiles', (result) => {
      let podyFiles = result.podyFiles || [];
      const existingIndex = podyFiles.findIndex(file => file.name === this.currentData.fileName);
      
      if (existingIndex >= 0) {
        podyFiles[existingIndex] = {
          ...podyFiles[existingIndex],
          content: newContent,
          timestamp: timestamp,
          size: newContent.length
        };
        
        chrome.storage.local.set({ podyFiles: podyFiles }, () => {
          console.log(`Successfully saved PODY file: ${this.currentData.fileName} (${newContent.length} characters)`);
          
          this.updateSaveButton(saveBtn, 'Saved!', 'success');
          PodyNotificationManager.show('File saved successfully!', 'success');
          
          setTimeout(() => {
            this.hide();
          }, PODY_CONFIG.ANIMATIONS.SUCCESS_DELAY);
        });
      } else {
        console.warn(`File ${this.currentData.fileName} not found in file list`);
        
        this.updateSaveButton(saveBtn, 'Save Failed', 'error');
        PodyNotificationManager.show('File not found. Please try again.', 'error');
        
        setTimeout(() => {
          this.updateSaveButton(saveBtn, originalHTML, 'default');
        }, 2000);
      }
    });
  }
  
  updateSaveButton(button, text, state) {
    button.innerHTML = text;
    
    switch (state) {
      case 'loading':
        button.style.background = 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)';
        button.style.boxShadow = 'none';
        button.disabled = true;
        button.style.cursor = 'not-allowed';
        break;
      case 'success':
        button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        button.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
        button.classList.add('pody-save-success');
        break;
      case 'error':
        button.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        button.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
        button.disabled = false;
        button.style.cursor = 'pointer';
        break;
      case 'default':
        button.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        button.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
        button.disabled = false;
        button.style.cursor = 'pointer';
        button.classList.remove('pody-save-success');
        break;
    }
  }
}

// Notification Manager
class PodyNotificationManager {
  static show(message, type = 'success') {
    // Remove existing notification
    const existing = document.getElementById(PODY_CONFIG.NOTIFICATION_ID);
    if (existing) {
      existing.remove();
    }

    const notification = PodyComponentFactory.createElement('div', {
      id: PODY_CONFIG.NOTIFICATION_ID,
      style: COMPONENT_STYLES.notification(type),
      innerHTML: `
        <span style="font-size: 16px; font-weight: bold;">
          ${type === 'success' ? '✓' : '✗'}
        </span>
        <span>${message}</span>
      `
    });

    document.body.appendChild(notification);

    // Auto-remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = `podySlideIn ${PODY_CONFIG.ANIMATIONS.FADE_DURATION}ms ease-in reverse`;
        setTimeout(() => {
          notification.remove();
        }, PODY_CONFIG.ANIMATIONS.FADE_DURATION);
      }
    }, PODY_CONFIG.ANIMATIONS.NOTIFICATION_DURATION);
  }
}

// Global instances
const podyModalManager = new PodyModalManager();

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'viewPodyFile') {
    try {
      console.log('PODY Handler: Processing file view request', message.data.fileName);
      
      podyModalManager.show(message.data);
      
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

// Legacy function exports for backward compatibility
function showPodyViewer(data) {
  podyModalManager.show(data);
}

function removePodyViewer() {
  podyModalManager.hide();
}

function showSaveNotification(message, type) {
  PodyNotificationManager.show(message, type);
}

// Cleanup function for page unload
window.addEventListener('beforeunload', () => {
  if (podyModalManager.currentModal) {
    podyModalManager.currentModal.remove();
    podyModalManager.currentModal = null;
    podyModalManager.currentData = null;
  }
  PodyStyleManager.cleanup();
});