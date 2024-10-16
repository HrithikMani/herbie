document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['walkthroughCompleted'], (result) => {
        if (!result.walkthroughCompleted) {
            startWalkthrough();
        }
    });
});

let currentStep = 0;

const steps = [
    { element: '#herbie_documentation', text: 'Click here for documentation', arrowPosition: 'top', top: 100, left: -20 },
    { element: '#dropdown', text: 'Click here for Menu', arrowPosition: 'top', top: 50, left: 345 },
    { element: '#herbie_run', text: 'Run Herbie Scripts here', arrowPosition: 'top', top: 120, left: 205 },
    { element: '#herbie_save', text: 'Save your scripts here', arrowPosition: 'top', top: 120, left: 305 },
   
];

function startWalkthrough() {
    const overlay = document.getElementById('walkthrough-overlay');
    const arrow = document.getElementById('walkthrough-arrow');
    const text = document.getElementById('walkthrough-text');

    function showStep(stepIndex) {
        const step = steps[stepIndex];
        
        // Highlight the element if one is provided
        if (step.element) {
            highlightElement(step.element);
        } else {
            removeHighlight(); // Ensure to remove highlight if there's no element in this step
        }

        // Ensure the overlay is visible
        overlay.style.display = 'block';

        // Position the walkthrough step based on the custom top and left values
        const walkthroughStep = document.getElementById('walkthrough-step');
        walkthroughStep.style.position = 'absolute';

        // Apply the custom top and left positions
        walkthroughStep.style.top = `${step.top}px`;
        walkthroughStep.style.left = `${step.left}px`;

        // Set the text for this step
        text.textContent = step.text;

        // Adjust the arrow direction based on the `arrowPosition`
        if (step.arrowPosition === 'top') {
            arrow.style.borderBottom = '10px solid #fff';
            arrow.style.borderTop = 'none';
        } else {
            arrow.style.borderTop = '10px solid #fff';
            arrow.style.borderBottom = 'none';
        }
    }

    // Highlight element function
    function highlightElement(elementSelector) {
        const element = document.querySelector(elementSelector);
        if (element) {
            // Add the highlight (box-shadow) to the element
            element.style.boxShadow = '0 0 10px 3px rgba(255, 255, 0, 0.8)'; // Yellow glow
            element.style.zIndex = '10000'; // Bring to the front

            // Highlight the text or links inside the element
            element.style.color = '#fff'; // Change text color to white for better visibility
            element.style.fontWeight = 'bold'; // Make text bold

            // If the element contains a link, adjust the link's color and underline
            const link = element.querySelector('a');
            if (link) {
                link.style.color = '#fff'; // Make the link color white
                link.style.textDecoration = 'none'; // Remove underline from the link
            }
        }
    }

    // Remove highlight function
    function removeHighlight() {
        // Remove any previous highlights
        const highlightedElements = document.querySelectorAll('[style*="box-shadow"]');
        highlightedElements.forEach(el => {
            el.style.boxShadow = ''; // Remove the highlight
            el.style.zIndex = ''; // Reset z-index
            el.style.color = ''; // Reset text color
            el.style.fontWeight = ''; // Reset text weight

            // Reset link styling if present
            const link = el.querySelector('a');
            if (link) {
                link.style.color = ''; // Reset link color
                link.style.textDecoration = ''; // Reset link decoration (underline)
            }
        });
    }

    // Show the first step
    showStep(currentStep);

    document.getElementById('next-step').addEventListener('click', () => {
        removeHighlight(); // Remove the highlight from the previous step
        currentStep++;
        if (currentStep < steps.length) {
            showStep(currentStep);
        } else {
            endWalkthrough();
        }
    });

    document.getElementById('skip-walkthrough').addEventListener('click', () => {
        removeHighlight(); // Remove any highlights
        endWalkthrough();
    });
}

function endWalkthrough() {
    document.getElementById('walkthrough-overlay').style.display = 'none';
    chrome.storage.local.set({ walkthroughCompleted: true });
}
