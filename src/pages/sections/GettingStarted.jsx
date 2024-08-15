import React from 'react';
import Section from './Section';


const GettingStarted = () => {
  return (
    <Section id="getting-started" title="Getting Started">
      <p>To get started with Herbie, follow these steps:</p>
      <ol>
        <li>Clone the project to your local machine or download the Chrome extension from the above link.</li>
        <li>Open Chrome and go to Preferences...  Extensions.</li>
        <li>Ensure "Developer mode" is checked (upper left).</li>
        <li>Click "Load unpacked extension...".</li>
        <li>Browse to the <code>chrome_extension</code> folder in the project.</li>
      </ol>
    </Section>
  );
};

export default GettingStarted;
