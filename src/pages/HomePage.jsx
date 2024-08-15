
import React from 'react';
import { Link } from 'react-router-dom';
import Herbie3D from '../components/Herbie3D';

const HomePage = () => {
  return (
    <div className="wrapper">
      <div className="row intro">
        <div className="col-md-8 text-content">
          <h1>Herbie Test</h1>
          <p>Herbie is a Chrome extension designed to run automated tests without loading external software. It leverages a Behavior-Driven Development approach, allowing scripts to be written in a human-readable format.</p>
          <h2>Features</h2>
          <ul>
            <li><strong>Behavior-Driven Development:</strong> Scripts are easy to understand and author.</li>
            <li><strong>Interactive Inspector:</strong> Discover elements on a page effortlessly.</li>
            <li><strong>mie-simulijs:</strong> Instead of using the jQuery Simulate Extended plug-in for simulating complex user interactions, we've used mie-simulijs, developed in MIE. It’s a package that simulates events on the page. <a href="https://www.npmjs.com/package/mie-simulijs">mie-simulijs</a>.</li>
          </ul>
        </div>
        <div className="col-md-4">
        <Herbie3D />
        </div>
      </div>
  
      <h2>How to Install the Chrome Extension</h2>
      <ul>
        <li>Clone the project to your local machine or download the Chrome extension from the above link.</li>
        <li>Open Chrome and go to Preferences...  Extensions.</li>
        <li>Ensure "Developer mode" is checked (upper left).</li>
        <li>Click "Load unpacked extension...".</li>
        <li>Browse to the `chrome_extension` folder in the project.</li>
      </ul>
      <h2>Initial Demo</h2>
      <p>Feel free to check out Herbie, which was written in jQuery in 2015. This was one of the first versions.</p>
      <p>Demo: <a href="http://mieweb.github.io/herbie/demo/index.html#run_herbie">http://mieweb.github.io/herbie/demo/index.html#run_herbie</a></p>
      <footer>
        <p>This project is maintained by <a href="https://github.com/mieweb">mieweb</a></p>
        <p><small>Hosted on GitHub Pages — Theme by <a href="https://github.com/orderedlist">orderedlist</a></small></p>
      </footer>
    </div>
  );
};

export default HomePage;
