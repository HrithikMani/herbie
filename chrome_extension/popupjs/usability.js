document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('tab6-start-button');
    const nextButton = document.getElementById('tab6-next-button');
    const hintButton = document.getElementById('tab6-hint-button');
    const outputContainer = document.getElementById('tab6-output');
    const testCaseTextarea = document.getElementById('tab6-test-case');

    let lines = [];
    let currentLineIndex = 0;

    // Retrieve and populate saved test case on page load
    chrome.storage.local.get(['savedTestCase'], (result) => {
        if (result.savedTestCase) {
            testCaseTextarea.value = result.savedTestCase;
        }
    });

    // Save test case to Chrome storage when the textarea content changes
    testCaseTextarea.addEventListener('input', () => {
        const testCase = testCaseTextarea.value.trim();
        chrome.storage.local.set({ savedTestCase: testCase }, () => {
            console.log('Test case saved.');
        });
    });

    // Start Usability Test
    startButton.addEventListener('click', () => {
        const testCase = testCaseTextarea.value.trim();

        if (!testCase) {
            appendOutput("Please enter a test case.");
            return;
        }

        // Split the test case into lines
        lines = testCase.split('\n').map(line => line.trim()).filter(line => line); // Remove empty lines
        currentLineIndex = 0;

        if (lines.length === 0) {
            appendOutput("Test case is empty after processing.");
            return;
        }

        // Render all lines in the output container
        renderTestCaseOutput(lines);

        // Disable start button and enable next button
        startButton.disabled = true;
        nextButton.disabled = false;

        // Start execution of the first line
        executeLine(currentLineIndex);
    });

    // Execute Next Line
    nextButton.addEventListener('click', () => {
        if (currentLineIndex < lines.length) {
            executeLine(currentLineIndex);
        }
    });

    // Get Hint for the Current Line
    hintButton.addEventListener('click', () => {
        if (currentLineIndex >= lines.length) {
            appendOutput("No more lines to provide hints for.");
            return;
        }

        const line = lines[currentLineIndex];
        sendHintRequest(line, (hintMessage) => {
            console.log('Hint Response:', hintMessage); // Log the hint response
            if (hintMessage) {
                appendOutput(`Hint for Line ${currentLineIndex + 1}: ${hintMessage}`);
            } else {
                appendOutput(`No hint available for Line ${currentLineIndex + 1}`);
            }
        });
    });

    // Function to render the test case lines in the output container
    function renderTestCaseOutput(lines) {
        outputContainer.innerHTML = ""; // Clear existing content
        lines.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'test-case-line';
            lineElement.id = `line-${index}`;
            lineElement.innerHTML = `
                <i class="fas fa-times-circle" style="color: red; margin-right: 8px;"></i>
                <span>${line}</span>
            `;
            outputContainer.appendChild(lineElement);
        });
    }

    // Function to execute a line
    function executeLine(index) {
        const line = lines[index];

        // Highlight the current line as active (spinning)
        markLineAsActive(index);

        // Send the current line to the background for execution
        sendLineToBackground(line, (success, response) => {
            console.log('Execution Response:', response); // Log the execution response
            if (success) {
                // Mark the current line as completed
                markLineAsCompleted(index);

                // Move to the next line
                currentLineIndex++;

                if (currentLineIndex >= lines.length) {
                    appendOutput("No more lines to execute.");
                    nextButton.disabled = true;
                    startButton.disabled = false; // Re-enable the start button
                } else {
                    // Highlight the next line as active
                    markLineAsActive(currentLineIndex);
                }
            } else {
                console.error(`Execution failed for line: ${line}`);
                appendOutput(`Failed to execute line: ${line}`);
            }
        });
    }

    // Function to send a hint request to the background
    function sendHintRequest(line, callback) {
        chrome.runtime.sendMessage({ action: 'PARSE_HINT', data: line }, (response) => {
            console.log('Hint Request Response:', response); // Log the full response
            if (response?.status === 'success') {
                console.log(`Hint received for line: ${line}`);
                callback(response.hint);
            } else {
                console.error(`Failed to retrieve hint for line: ${line}`);
                callback(null);
            }
        });
    }

    // Function to send a line to the background
    function sendLineToBackground(line, callback) {
        chrome.runtime.sendMessage({ action: 'RUN', data: line }, (response) => {
            console.log('Line Execution Request Response:', response); // Log the full response
            if (response?.status === 'success') {
                console.log(`Line executed successfully: ${line}`);
                callback(true, response);
            } else {
                console.error(`Failed to execute line: ${line}`);
                callback(false, response);
            }
        });
    }

    // Function to mark a line as active
    function markLineAsActive(index) {
        const lineElement = document.getElementById(`line-${index}`);
        if (lineElement) {
            const icon = lineElement.querySelector('i');
            icon.className = 'fas fa-spinner fa-spin';
            icon.style.color = 'blue';
        }
    }

    // Function to mark a line as completed
    function markLineAsCompleted(index) {
        const lineElement = document.getElementById(`line-${index}`);
        if (lineElement) {
            const icon = lineElement.querySelector('i');
            icon.className = 'fas fa-check-circle';
            icon.style.color = 'green';
        }
    }

    // Function to append output for final status messages
    function appendOutput(text) {
        const lineElement = document.createElement('div');
        lineElement.textContent = text;
        outputContainer.appendChild(lineElement);
    }
});
