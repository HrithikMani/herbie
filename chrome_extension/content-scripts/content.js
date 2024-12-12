
var cmdtree = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'RUN') {
        const scriptContent = message.data;
        cmdtree = scriptContent;

        var options = { line: message.line, delay: 100, cmdtree: cmdtree };

        // Ensure cmdtree is properly structured
        if (!Array.isArray(cmdtree) || cmdtree.length === 0) {
            sendResponse({ status: 'error', data: 'Invalid script content received' });
            console.error('Invalid script content received:', scriptContent);
            return;
        }
        stopScript = false;
        ExecuteScript(cmdtree, options, function (done, option, comment) {
            if (option) {
                var currentCmd = option.cmdtree[option.line];
                if (currentCmd && currentCmd.src) {
                    var txt = 'Line: ' + (option.line + 1) + ', Cmd:' + currentCmd.src + '\n';
                    log(txt);
                }
            }

            if (comment) {
                log(comment);
            }
        });

        sendResponse({ status: 'success', data: 'Script received' });
        console.log('Script content received from background:', scriptContent);
    }

    return true; // Keep the messaging channel open for asynchronous responses
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start_inspecting') {
        document.addEventListener('mouseover', highlightElement);
        document.addEventListener('mouseout', removeHighlight);
        document.addEventListener('click', captureXPath, true);
    }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'FIND_HINT_ELEMENT') {
        const parsedLines = message.data; // Assume data is an array of parsed lines
        console.log('Received FIND_HINT_ELEMENT:', parsedLines);

        // Ensure parsedLines is an array and has at least one object
        if (!Array.isArray(parsedLines) || parsedLines.length === 0 || !parsedLines[0].code) {
            console.error('Invalid parsedLine or code:', parsedLines);
            sendResponse({ status: 'error', message: 'Invalid parsedLine or code' });
            return;
        }

        const parsedLine = parsedLines[0]; // Use the first parsed object
        const inclause = parsedLine.code.indexOf('in'); // Find "in" keyword
        console.log('Index of "in":', inclause);

        if (inclause === -1 || inclause + 1 >= parsedLine.code.length) {
            console.error('"in" keyword not found or selector missing:', parsedLine.code);
            sendResponse({ status: 'error', message: '"in" keyword not found or selector missing' });
            return;
        }

        // Get the selector (id, class, or xpath)
        const selector = parsedLine.code[inclause + 1];
        console.log('Selector found:', selector);

        let element = null;

        // Check the type of selector and find the element
        if (selector.startsWith('//')) {
            // If the selector starts with "//", treat it as an XPath
            try {
                const xpathResult = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                element = xpathResult.singleNodeValue;
            } catch (error) {
                console.error('Error evaluating XPath:', error);
            }
        } else if (selector.startsWith('.')) {
            // If the selector starts with ".", treat it as a class
            element = document.querySelector(selector);
        } else if (selector.startsWith('#')) {
            // If the selector starts with "#", treat it as an ID
            element = document.getElementById(selector.slice(1)); // Remove the "#" from the selector
        } else {
            // Assume it's a tag name or other selector
            element = document.querySelector(selector);
        }

        // Highlight the element if found
        if (element) {
            console.log('Element found:', element);
            element.style.border = '2px solid red'; // Add red border to the element
            sendResponse({ status: 'success', message: 'Element highlighted', element });
        } else {
            console.error('No element found for selector:', selector);
            sendResponse({ status: 'error', message: 'Element not found for selector' });
        }
    }
});
