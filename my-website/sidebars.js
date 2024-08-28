/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Documentation',
      items: [
        {
          type: 'doc',
          id: 'getting-started/Getting Started', // Path relative to the docs folder
          label: 'Getting Started Guide', // Custom label
        },
        {
          type: 'doc',
          id: 'getting-started/Basic Commands', // Migrated from 'Basic Commands'
          label: 'Basic Commands Overview', // Custom label
        },
        {
          type: 'doc',
          id: 'getting-started/Keywords', // Migrated from 'Keywords'
          label: 'Keywords', // Custom label
        },
      
        {
          type: 'doc',
          id: 'getting-started/Record', // Migrated from 'Record'
          label: 'Record', // Custom label
        },
        {
          type: 'doc',
          id: 'getting-started/Savedscripts', // Migrated from 'Saved Scripts'
          label: 'Saved Scripts', // Custom label
        },
        {
          type: 'doc',
          id: 'getting-started/Logs', // Migrated from 'Logs'
          label: 'Logs', // Custom label
        }
      ],
    },
  ]
  

};

export default sidebars;
