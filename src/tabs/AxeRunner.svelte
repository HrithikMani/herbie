<script>
  import { onMount } from 'svelte';

  export let activeTab;

  // State variables
  let isRunning = false;
  let currentUrl = '';

  // Get current tab URL on mount
  onMount(() => {
    getCurrentTabUrl();
  });

  // Get current tab URL
  async function getCurrentTabUrl() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        currentUrl = tab.url;
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }

  // Run Axe accessibility test
  function runAxeTest() {
    if (isRunning) return;
    
    isRunning = true;

    console.log('Starting Axe accessibility test...');

    // Send message to background script to run Axe test
    chrome.runtime.sendMessage({
      action: 'runAxeTest'
    }, (response) => {
      isRunning = false;

      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
        return;
      }

      if (response && response.status === 'success' && response.data) {
        console.log('Axe test completed successfully:', response.data);
        console.log('Check the browser console for detailed results.');
      } else {
        console.error('Axe test failed:', response);
      }
    });
  }
</script>

<div class="container">
  <div class="header">
    <h1>Axe Runner</h1>
    <p class="description">Run accessibility tests on any page</p>
  </div>

  <div class="test-section">
    <div class="current-page">
      <h3>Current Page</h3>
      <p class="url">{currentUrl || 'No active tab'}</p>
    </div>

    <div class="test-controls">
      <button 
        class="run-btn" 
        class:running={isRunning}
        on:click={runAxeTest}
        disabled={isRunning || !currentUrl}
      >
        {#if isRunning}
          <span class="spinner"></span>
          Running Test...
        {:else}
          Run Accessibility Test
        {/if}
      </button>
    </div>
  </div>

  {#if isRunning}
    <div class="status-message">
      <p>Running accessibility test... Check the browser console for detailed results.</p>
    </div>
  {:else}
    <div class="info-message">
      <p>Click "Run Accessibility Test" to analyze the current page. Results will be displayed in the browser console.</p>
    </div>
  {/if}
</div>

<style>
  .container {
    padding: 20px;
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 25px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 15px;
  }

  .header h1 {
    margin: 0 0 5px 0;
    color: #333;
    font-size: 28px;
  }

  .description {
    margin: 0;
    color: #666;
    font-size: 14px;
  }

  .test-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 25px;
  }

  .current-page h3 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 16px;
  }

  .url {
    margin: 0 0 15px 0;
    padding: 8px 12px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    word-break: break-all;
    color: #666;
  }

  .test-controls {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .run-btn {
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s;
  }

  .run-btn:hover:not(:disabled) {
    background: #0056b3;
  }

  .run-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .run-btn.running {
    background: #6c757d;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .status-message, .info-message {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
    text-align: center;
  }

  .status-message {
    background: #fff3cd;
    border-color: #ffeaa7;
    color: #856404;
  }

  .info-message {
    color: #666;
  }

  .status-message p, .info-message p {
    margin: 0;
    font-size: 14px;
  }
</style>