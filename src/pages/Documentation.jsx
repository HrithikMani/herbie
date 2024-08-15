import React from 'react';
import GettingStarted from './sections/GettingStarted';
import Herbie from './sections/Herbie';
import Sidebar from './sections/SideBar';
import '../styles/Documentation.css';
import KeywordDoc from './sections/KeywordDoc';
const Documentation = () => {
  return (
    <>
      <div className="wrapper">
        <Sidebar />
        
        <div className="content">
          <h1 id="documentation">Documentation</h1>
          <p>This section provides detailed documentation on how to use Herbie.</p>

          <GettingStarted />
          <Herbie />
          <KeywordDoc />
        </div>
      </div>

      <footer>
        <p>This project is maintained by <a href="https://github.com/mieweb">mieweb</a></p>
        <p><small>Hosted on GitHub Pages — Theme by <a href="https://github.com/orderedlist">orderedlist</a></small></p>
      </footer>
    </>
  );
};

export default Documentation;
