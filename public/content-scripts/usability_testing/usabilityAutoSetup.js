/**
 * Usability Testing Auto-Setup Module
 * Handles automatic observer setup for usability testing without affecting other functionality
 */

(function() {
    'use strict';
    
    let usabilityTestActive = false;
    let setupAttempted = false;
    
    // Only initialize if we're in a usability testing context
    function initializeUsabilityAutoSetup() {
        // Check for active usability test
        chrome.storage.local.get(['usabilityTest'], (result) => {
            if (result.usabilityTest && result.usabilityTest.herbieScript && !setupAttempted) {
                console.log("Active usability test detected, auto-setting up observers");
                usabilityTestActive = true;
                setupAttempted = true;
                requestObserverSetup(result.usabilityTest);
            }
        });
    }
    
    function requestObserverSetup(testData) {
        // Send a specific message for usability testing observer setup
        chrome.runtime.sendMessage({
            action: "setupUsabilityObservers",
            testData: testData,
            herbieScript: testData.herbieScript,
            url: window.location.href
        }, (response) => {
            if (response && response.status === 'success') {
                console.log("Usability observers setup completed");
            } else {
                console.warn("Failed to setup usability observers:", response);
            }
        });
    }
    
    // Listen for storage changes to detect when usability test starts
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.usabilityTest) {
            const newValue = changes.usabilityTest.newValue;
            const oldValue = changes.usabilityTest.oldValue;
            
            // Test started
            if (newValue && newValue.herbieScript && !oldValue) {
                console.log("Usability test started, setting up observers");
                usabilityTestActive = true;
                setupAttempted = false; // Reset for new test
                setTimeout(() => requestObserverSetup(newValue), 1000);
            }
            
            // Test ended
            if (!newValue && oldValue) {
                console.log("Usability test ended, cleaning up");
                usabilityTestActive = false;
                setupAttempted = false;
            }
        }
    });
    
    // Handle page navigation for active usability tests
    function handlePageLoad() {
        if (usabilityTestActive && !setupAttempted) {
            chrome.storage.local.get(['usabilityTest'], (result) => {
                if (result.usabilityTest && result.usabilityTest.herbieScript) {
                    console.log("Re-establishing usability observers after navigation");
                    setTimeout(() => requestObserverSetup(result.usabilityTest), 1500);
                }
            });
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeUsabilityAutoSetup, 500);
        });
    } else {
        setTimeout(initializeUsabilityAutoSetup, 500);
    }
    
    // Handle navigation
    window.addEventListener('load', handlePageLoad);
    
})();