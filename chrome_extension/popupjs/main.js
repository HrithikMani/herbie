document.addEventListener('DOMContentLoaded', () => {
    // Load saved script content
    chrome.storage.local.get(['herbieScriptContent', 'activeTab'], (result) => {
        if (result.herbieScriptContent) {
            document.getElementById('herbie_script').value = result.herbieScriptContent;
        }
        if (result.activeTab) {
            const activeTab = result.activeTab;
            document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tabContent => tabContent.classList.remove('active'));
            document.querySelector(`[data-tab="${activeTab}"]`).classList.add('active');
            document.getElementById(activeTab).classList.add('active');
        }
    });
 
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        const dropdownMenu = document.querySelector('.dropdown-menu');

        // Toggle the display of the dropdown menu on click
        dropdownToggle.addEventListener('click', () => {
        dropdownMenu.parentElement.classList.toggle('show');
        });

    // Event listeners for command buttons
    document.getElementById('herbie_parse').addEventListener('click', parseCommand);
    document.getElementById('herbie_add').addEventListener('click', addCommand);
    document.getElementById('herbie_run').addEventListener('click', runCommand);
    document.getElementById('herbie_clear').addEventListener('click', clearCommand);
    document.getElementById('herbie_save_logs').addEventListener('click', saveCommand);
    document.getElementById('herbie_save').addEventListener('click', saveScript);
    document.getElementById('export-logs').addEventListener('click', exportLogs);
    document.getElementById('import-button').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importScripts);
    document.getElementById('add-keyword').addEventListener('click', addKeyword);

    // Save script content on change
    document.getElementById('herbie_script').addEventListener('input', function() {
        const scriptContent = document.getElementById('herbie_script').value;
        chrome.storage.local.set({ herbieScriptContent: scriptContent }, () => {
            console.log('Script content saved.');
        });
    });

    // Chrome runtime message listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'log_msg') {
            appendLogMessage(message.message);
        }
        if (message.action === 'progress') {
            updateProgressBar(message.current, message.total);
            if (message.current == message.total) {
                document.getElementById("herbie_progress").style.width = "0px";
            }
        }
    });

    // Tab navigation
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tabContent => tabContent.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Save the active tab to chrome.storage.local
            chrome.storage.local.set({ activeTab: tabId });

            if (tabId === 'tab2') {
                loadLogs();
            }
            if (tabId === 'tab3') {
                loadSavedScripts();
            }
            if (tabId === 'tab5') {
                fetchAndDisplayActions();
            }
        });
    });

    const textarea =  document.getElementById('herbie_script');

    textarea.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;

            // Insert 4 spaces (or '\t' for a tab character)
            const tabCharacter = '    '; // Or use '\t' for a tab character
            this.value = this.value.substring(0, start) + tabCharacter + this.value.substring(end);

            // Move the cursor after the inserted tab
            this.selectionStart = this.selectionEnd = start + tabCharacter.length;
        }
    });
    
   // Select all dropdown items and add click event listeners
document.querySelectorAll('.dropdown-item').forEach((item) => {
    item.addEventListener('click', function () {
      // Hide the dropdown after selecting an option
      dropdownMenu.parentElement.classList.remove('show');
  
      // Remove 'active' class from all tab contents
      document.querySelectorAll('.tab-content').forEach((content) => {
        content.classList.remove('active');
      });
  
      // Add 'active' class to the selected tab content
      const selectedTab = this.getAttribute('data-tab');
      document.querySelector(`#${selectedTab}`).classList.add('active');
  
      // Execute functions based on the selected tab
      if (selectedTab === 'tab2') {
        loadLogs();
      } else if (selectedTab === 'tab3') {
        loadSavedScripts();
      } else if (selectedTab === 'tab5') {
        fetchAndDisplayActions();
      }
    });
  });
  

    loadKeywords();
    loadLogs();
    loadSavedScripts();
    fetchAndDisplayActions();
});


