console.log("Tracking user interactions...");

// Initialize tracking settings
chrome.storage.local.get({ trackingEnabled: true, userActions: [] }, (result) => {
    chrome.storage.local.set({ trackingEnabled: result.trackingEnabled, userActions: result.userActions || [] });
});

// Function to start tracking
function startTracking() {
    chrome.storage.local.set({ trackingEnabled: true }, () => {
        console.log("User interaction tracking started.");
    });
}

// Track clicks on interactive elements
document.addEventListener("click", (event) => {
    chrome.storage.local.get("trackingEnabled", (result) => {
        if (!result.trackingEnabled) return;

        let target = event.target;
        let tagName = target.tagName.toLowerCase();
        let identifier = getElementIdentifier(target);

        if (["button", "a", "span", "div"].includes(tagName) || target.hasAttribute("onclick")) {
            storeUserAction({
                action: "click",
                element: tagName,
                text: target.innerText.trim() || target.value || target.getAttribute("href"),
                identifier: identifier,
                timestamp: Date.now(),
            });
        }
    });
});

// Track input focus
document.addEventListener("focus", (event) => {
    chrome.storage.local.get("trackingEnabled", (result) => {
        if (!result.trackingEnabled) return;

        let target = event.target;
        if (["input", "textarea"].includes(target.tagName.toLowerCase())) {
            storeUserAction({
                action: "focus",
                element: target.tagName.toLowerCase(),
                name: target.name || null,
                placeholder: target.placeholder || null,
                identifier: getElementIdentifier(target),
                timestamp: Date.now(),
            });
        }
    });
}, true);

// Track text input changes
document.addEventListener("input", (event) => {
    chrome.storage.local.get("trackingEnabled", (result) => {
        if (!result.trackingEnabled) return;

        let target = event.target;
        if (["input", "textarea"].includes(target.tagName.toLowerCase())) {
            let identifier = getElementIdentifier(target);

            storeUserAction({
                action: "input",
                element: target.tagName.toLowerCase(),
                value: target.value,
                identifier: identifier,
                timestamp: Date.now(),
            });
        }
    });
});

// Store user interactions in Chrome storage
function storeUserAction(action) {
    chrome.storage.local.get("userActions", (result) => {
        let userActions = result.userActions || [];
        userActions.push(action);

        chrome.storage.local.set({ userActions: userActions }, () => {
            console.log("Stored user action:", action);
        });
    });
}

// Get an identifier for elements
function getElementIdentifier(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    function getAbsoluteXPath(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return "";
        if (el.id) return `//*[@id="${el.id}"]`; // Keep direct ID XPath

        const parts = [];
        while (el && el.nodeType === Node.ELEMENT_NODE) {
            let index = 1;
            let sibling = el.previousSibling;

            while (sibling) {
                if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === el.nodeName) {
                    index++;
                }
                sibling = sibling.previousSibling;
            }

            const tagName = el.nodeName.toLowerCase();
            parts.unshift(`${tagName}[${index}]`);
            el = el.parentNode;
        }
        return "/" + parts.join("/");
    }

    return getAbsoluteXPath(element);
}
