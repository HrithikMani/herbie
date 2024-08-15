import React from 'react';
import Section from './Section';
import sc1 from '../../assets/sc/sc1.png'; 
const Herbie = () => {
  return (
    <Section id="herbie" title="Herbie">
      <p>Herbie is a powerful Chrome extension designed to automate and test web interactions seamlessly. It leverages Behavior-Driven Development (BDD) principles, making it accessible for both developers and non-developers to write and understand test scripts.</p>

      <h3 id="ui-overview">User Interface Overview</h3>
<p>Below is an overview of the Herbie Chrome extension's user interface:</p>
<div className='imgText' style={{ display: 'flex', alignItems: 'flex-start' }}>
  <div style={{ flex: 1, paddingRight: '10px' }}>
    <ul>
      <li><strong>Run Script Button (Green):</strong> The green button is used to execute the automation script. When you click this button, the script that you have written or loaded will start running, performing the actions specified in the script.</li>
      <li><strong>Save Script Button (Yellow):</strong> The yellow button allows you to save the current script. Clicking this button will store the script, so you can easily access and reuse it later.</li>
      <li><strong>Script Editor:</strong> This is where you can type or load your test scripts. The scripts define the actions that Herbie will perform on the web pages you are testing.</li>
      <li><strong>Command Input:</strong> Here you can manually enter commands that will be added to the script. This allows for quick command entry without editing the script directly.</li>
      <li><strong>Action Buttons:</strong>
        <ul>
          <li><strong>Add:</strong> Add a new command to the script.</li>
          <li><strong>Parse:</strong> Parse the script to ensure there are no syntax errors.</li>
          <li><strong>Clear:</strong> Clear the script editor and command input fields.</li>
          <li><strong>Save:</strong> Save the script, similar to the yellow Save Script button.</li>
        </ul>
      </li>
      <li><strong>Logs :</strong>
        The logs will be displayed in the bottom section
      </li>
    </ul>
  </div>
  <img src={sc1} alt="Herbie Chrome Extension UI" style={{ maxWidth: '50%' }} />
</div>
      
      <h3 id="click">Click</h3>
      <p>The <code>click</code> command is used to simulate a mouse click on a specified element. Here’s how you can use the <code>click</code> command:</p>
      <ul>
        <li><strong>Click by ID:</strong>
          <pre><code>click on '#submit-button'</code></pre>
          This will click on the element with the ID 'submit-button'.
        </li>
        <li><strong>Click by Class:</strong>
          <pre><code>click on '.button-class'</code></pre>
          This will click on the first element with the class 'button-class'.
        </li>
        <li><strong>Click by XPath:</strong>
          <pre><code>click on "//button[text()='Submit']"</code></pre>
          This will click on the button that contains the text 'Submit'.
        </li>
      </ul>

      <h3 id="type">Type</h3>
      <p>The <code>type</code> command is used to simulate typing text into a specified input field. Here’s how you can use the <code>type</code> command:</p>
      <ul>
        <li><strong>Type by ID:</strong>
          <pre><code>type "Hello, World!" in '#text-input'</code></pre>
          This will type "Hello, World!" into the input field with the ID 'text-input'.
        </li>
        <li><strong>Type by Class:</strong>
          <pre><code>type "Hello, World!" in '.input-class'</code></pre>
          This will type "Hello, World!" into the first input field with the class 'input-class'.
        </li>
        <li><strong>Type by XPath:</strong>
          <pre><code>type "Hello, World!" in "//input[@name='username']"</code></pre>
          This will type "Hello, World!" into the input field identified by the XPath.
        </li>
      </ul>

      <h3 id="wait">Wait</h3>
      <p>The <code>wait</code> command pauses the execution of the script for a specified amount of time. Here’s how you can use the <code>wait</code> command:</p>
      <ul>
        <li><strong>Wait for 5 seconds:</strong>
          <pre><code>wait 5000</code></pre>
          This will pause the script for 5000 milliseconds (5 seconds).
        </li>
        <li><strong>Wait for 2 seconds:</strong>
          <pre><code>wait 2000</code></pre>
          This will pause the script for 2000 milliseconds (2 seconds).
        </li>
      </ul>

      <h3 id="verify">Verify</h3>
      <p>The <code>verify</code> command checks if a specific text is present within a specified element on the page. Here’s how you can use the <code>verify</code> command:</p>
      <ul>
        <li><strong>Verify by ID:</strong>
          <pre><code>verify "Success" in '#message'</code></pre>
          This will verify that the text "Success" is present in the element with the ID 'message'.
        </li>
        <li><strong>Verify by Class:</strong>
          <pre><code>verify "Success" in '.message-class'</code></pre>
          This will verify that the text "Success" is present in the first element with the class 'message-class'.
        </li>
        <li><strong>Verify by XPath:</strong>
          <pre><code>verify "Success" in "//div[@role='alert']"</code></pre>
          This will verify that the text "Success" is present in the element identified by the XPath.
        </li>
      </ul>

    </Section>
  );
};

export default Herbie;
