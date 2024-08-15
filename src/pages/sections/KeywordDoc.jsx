import React from 'react';
import Section from './Section';
import keywordImage from '../../assets/sc/sc2.png'; // Make sure to update the path as per your project structure

function KeywordDoc() {
    const xpathString = "//div[contains(@class, 'wc-enc-dynamic-section')]/*[contains(@class, 'exam_tab')][contains(., '{$}')]";
  return (
    <Section id="Keywords" title="Keywords">
      <p>
        The <strong>Keywords</strong> section allows you to map keywords to specific XPaths, making it easier to reference elements in your automation scripts. You can also pass variables to these XPaths, enhancing the flexibility of your scripts.
      </p>

      <h3 id="ui-overview">User Interface Overview</h3>
      <p>Below is an overview of the Keywords section:</p>
      <div className="imgText" style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, paddingRight: '10px' }}>
          <ul>
            <li>
              <strong>Inspect Button (Blue):</strong> This button helps you inspect elements on the web page. When clicked, it allows you to hover over elements and automatically captures their XPath, which can then be used in your scripts.
            </li>
            <li>
              <strong>Import Button (Blue):</strong> The Import button allows you to load previously saved keywords and their corresponding XPaths. This is useful for reusing common element identifiers across different scripts.
            </li>
            <li>
              <strong>Keyword Input:</strong> Here, you can enter the name of the keyword that you want to map to an XPath.
            </li>
            <li>
              <strong>XPath Input:</strong> This is where you can type or paste the XPath that corresponds to the keyword. This XPath will be used in your scripts to locate elements on the web page.
            </li>
            <li>
              <strong>Has Variable Checkbox:</strong> If the XPath includes a variable, check this box. Variables allow you to insert dynamic values into the XPath during script execution.
            </li>
            <li>
              <strong>Add Keyword Button (Blue):</strong> After entering the keyword and XPath, click this button to add the keyword to the list of Global Keywords.
            </li>
            <li>
              <strong>Global Keywords List:</strong>
              <ul>
                <li>
                  Each keyword in this list represents a mapped XPath that can be reused across multiple scripts. 
                </li>
                <li>
                  You can edit the keyword, change its XPath, or toggle the "Has Variable" option by clicking on the keyword.
                </li>
                <li>
                  To delete a keyword, click the trash icon next to it.
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <img src={keywordImage} alt="Keywords Section UI" style={{ maxWidth: '50%' }} />
      </div>

      <h3 id="add-variable-keyword">Steps to Add a Keyword with a Variable</h3>
      <p>Follow these steps to add a keyword that includes a variable:</p>
      <ol>
        <li>
          <strong>Open the Keywords Section:</strong> 
          Navigate to the <strong>Keywords</strong> section within your Herbie Chrome extension.
        </li>
        <li>
          <strong>Enter the Keyword Name:</strong> 
          In the <strong>Enter keyword</strong> input field, type the desired keyword name, such as <code>"exam_tab"</code>.
        </li>
        <li>
          <strong>Enter the XPath:</strong> 
          In the <strong>Enter XPath</strong> input field, type or paste the XPath that includes the variable placeholder. For example:
          <p>{xpathString}</p>
          This XPath will locate a div with a dynamic section class, within which it finds elements that have the class "exam_tab" and contain the variable placeholder <strong><code>{"{$}"}</code></strong>.
        </li>
        <li>
          <strong>Check the "Has Variable" Checkbox:</strong> 
          Since the XPath includes a variable placeholder, make sure the <strong>Has Variable</strong> checkbox is checked. This allows the script to dynamically replace <strong><code>{"{$}"}</code></strong> with the appropriate value during execution.
        </li>
        <li>
          <strong>Click on "Add Keyword":</strong> 
          Click the <strong>Add Keyword</strong> button to add the keyword with the variable to the Global Keywords list.
        </li>
        <li>
          <strong>Verify the Keyword:</strong> 
          After adding, check the <strong>Global Keywords</strong> list to ensure that the keyword has been successfully added with the correct XPath and that the "Has Variable" option is correctly set.
        </li>
      </ol>
    </Section>
  );
}

export default KeywordDoc;
