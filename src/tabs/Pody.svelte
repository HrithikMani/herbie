<script>
  import { onMount } from 'svelte';

  // List of previously uploaded .pody files
  let podyFiles = [];
  let isUploading = false;
  let uploadError = null;

  // Function to handle file upload
  function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    isUploading = true;
    uploadError = null;
    
    const file = files[0];
    if (!file.name.endsWith('.pody')) {
      uploadError = 'Only .pody files are supported';
      isUploading = false;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        // Add the new file to the list
        const newPodyFile = {
          name: file.name,
          content: fileContent,
          timestamp: Date.now()
        };
        
        podyFiles = [newPodyFile, ...podyFiles];
        
        // Save to storage
        saveToStorage();
        
        isUploading = false;
      } catch (error) {
        uploadError = 'Error processing file: ' + error.message;
        isUploading = false;
      }
    };
    
    reader.onerror = () => {
      uploadError = 'Error reading file';
      isUploading = false;
    };
    
    reader.readAsText(file);
  }

  // Delete a pody file
  function deleteFile(index) {
    podyFiles = podyFiles.filter((_, i) => i !== index);
    saveToStorage();
  }

  // Save pody files to storage
  function saveToStorage() {
    chrome.storage.local.set({ podyFiles });
  }

  // Load pody files from storage on mount
  onMount(() => {
    chrome.storage.local.get(["podyFiles"], (result) => {
      if (result.podyFiles) {
        podyFiles = result.podyFiles.sort((a, b) => {
          const tA = a.timestamp || 0;
          const tB = b.timestamp || 0;
          return tB - tA; // Sort by timestamp descending (newest first)
        });
      }
    });
  });
</script>

<div class="container">
  <div class="header">
    <h1>PODY</h1>
    <p class="description">Upload your .pody files</p>
  </div>

  <div class="upload-section">
    <div class="file-input-wrapper">
      <label for="pody-file-upload" class="upload-button">
        <span>Upload File</span>
        <input 
          type="file" 
          id="pody-file-upload" 
          accept=".pody" 
          on:change={handleFileUpload}
          disabled={isUploading}
        />
      </label>
      {#if isUploading}
        <div class="loading-spinner"></div>
      {/if}
    </div>
    
    {#if uploadError}
      <div class="error-message">{uploadError}</div>
    {/if}
  </div>

  <div class="files-list">
    <h2>Uploaded Files</h2>
    
    {#if podyFiles.length === 0}
      <div class="empty-state">
        <p>No files uploaded yet</p>
      </div>
    {:else}
      <ul>
        {#each podyFiles as file, index}
          <li>
            <div class="file-info">
              <span class="file-name">{file.name}</span>
              <span class="file-date">{new Date(file.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="file-actions">
              <button class="view-btn" on:click={() => alert('View functionality to be implemented')}>View</button>
              <button class="delete-btn" on:click={() => deleteFile(index)}>Delete</button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .container {
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .header {
    margin-bottom: 25px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 10px;
  }

  h1 {
    font-size: 28px;
    color: #333;
    margin: 0 0 5px 0;
    font-weight: bold;
  }

  .description {
    color: #666;
    margin: 0;
    font-size: 14px;
  }

  .upload-section {
    margin-bottom: 30px;
  }

  .file-input-wrapper {
    display: flex;
    align-items: center;
  }

  .upload-button {
    background-color: #4a90e2;
    color: white;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    display: inline-block;
    transition: background-color 0.3s;
  }

  .upload-button:hover {
    background-color: #357ab8;
  }

  input[type="file"] {
    display: none;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: #4a90e2;
    border-radius: 50%;
    margin-left: 10px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message {
    color: #e53935;
    margin-top: 10px;
    padding: 8px;
    background-color: #ffebee;
    border-radius: 4px;
  }

  .files-list {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 15px;
  }

  h2 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
  }

  .empty-state {
    text-align: center;
    color: #888;
    padding: 20px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    align-items: center;
  }

  li:last-child {
    border-bottom: none;
  }

  .file-info {
    flex: 1;
  }

  .file-name {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
  }

  .file-date {
    color: #888;
    font-size: 12px;
  }

  .file-actions {
    display: flex;
    gap: 8px;
  }

  button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .view-btn {
    background-color: #e0e0e0;
    color: #333;
  }

  .view-btn:hover {
    background-color: #d0d0d0;
  }

  .delete-btn {
    background-color: #f44336;
    color: white;
  }

  .delete-btn:hover {
    background-color: #d32f2f;
  }
</style>