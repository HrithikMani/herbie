document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['walkthroughCompleted'], (result) => {
        if (!result.walkthroughCompleted) {
            startWalkthrough();
        }
    });
});

let currentStep = 0;

const steps = [
    { 
        element: '#herbie_script', 
        text: 'Type your script here', 
        arrowPosition: 'top', 
        top: 385, 
        left: 90,
        action: () => {
            const scriptContent = `type 'Herbie' in 'firstname'\ntype 'Robot' in 'lastname'\nclick on 'Submit'`;
            const herbieScriptElement = document.querySelector('#herbie_script');
            herbieScriptElement.value = scriptContent; // Add the script content
            herbieScriptElement.style.color = '#000'; // Ensure the text color is black
        }
    },
    { 
        element: '#herbie_run', 
        text: 'Click on Run ', 
        arrowPosition: 'top', 
        top: 120, 
        left: 205 
    },
    { 
        element: '#dropdown', 
        text: 'Click here for Menu', 
        arrowPosition: 'top', 
        top: 50, 
        left: 345 
    },
    { 
        element: '#herbie_documentation', 
        text: 'Click here for documentation', 
        arrowPosition: 'top', 
        top: 100, 
        left: -20,
    
    },
   
];

function startWalkthrough() {
    const overlay = document.getElementById('walkthrough-overlay');
    const arrow = document.getElementById('walkthrough-arrow');
    const text = document.getElementById('walkthrough-text');

    function showStep(stepIndex) {
        const step = steps[stepIndex];

        // Ensure the overlay is visible
        overlay.style.display = 'block';

        // Highlight the element and execute any custom actions
        if (step.element) {
            highlightElement(step.element);
            if (step.action) step.action(); // Execute step action if available
        } else {
            removeHighlight(); // Remove highlight if no element in this step
        }

        // Position the walkthrough step based on custom coordinates
        const walkthroughStep = document.getElementById('walkthrough-step');
        walkthroughStep.style.position = 'absolute';
        walkthroughStep.style.top = `${step.top}px`;
        walkthroughStep.style.left = `${step.left}px`;

        // Set the text for this step
        text.textContent = step.text;

        // Adjust the arrow direction based on `arrowPosition`
        if (step.arrowPosition === 'top') {
            arrow.style.borderBottom = '10px solid #fff';
            arrow.style.borderTop = 'none';
        } else {
            arrow.style.borderTop = '10px solid #fff';
            arrow.style.borderBottom = 'none';
        }
    }

    function highlightElement(selector) {
        const element = document.querySelector(selector);

        if (element) {
            element.style.position = 'relative'; // Ensure element can use z-index
            element.style.boxShadow = '0 0 10px 3px rgba(255, 255, 0, 0.8)'; // Yellow glow
            element.style.zIndex = '10000'; // Bring to front
            element.style.transition = 'box-shadow 0.3s ease-in-out'; // Smooth transition

            if (selector === '#herbie_script') {
                element.style.color = '#000'; // Set text color to black for this element
            } else {
                element.style.color = '#fff'; // Default highlight text color
                element.style.fontWeight = 'bold'; // Make text bold
            }
        } else {
            console.warn(`Element not found: ${selector}`);
        }
    }

    function removeHighlight() {
        const highlightedElements = document.querySelectorAll('[style*="box-shadow"]');
        highlightedElements.forEach(el => {
            el.style.boxShadow = ''; // Remove highlight
            el.style.zIndex = ''; // Reset z-index
            el.style.color = ''; // Reset text color
            el.style.fontWeight = ''; // Reset font weight
        });
    }

    // Show the first step
    showStep(currentStep);

    document.getElementById('next-step').addEventListener('click', () => {
        removeHighlight(); // Clear previous highlight
        currentStep++;
        if (currentStep < steps.length) {
            showStep(currentStep);
        } else {
            endWalkthrough();
        }
    });

    document.getElementById('skip-walkthrough').addEventListener('click', () => {
        removeHighlight(); // Clear all highlights
        endWalkthrough();
    });
}

function endWalkthrough() {
    document.getElementById('walkthrough-overlay').style.display = 'none';
   chrome.storage.local.set({ walkthroughCompleted: true });
}
