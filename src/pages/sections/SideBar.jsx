import React from 'react';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>Quick Navigation</h3>
      <ul>
        <SidebarItem href="#documentation">Documentation</SidebarItem>
        <SidebarItem href="#getting-started">Getting Started</SidebarItem>
        <SidebarItem href="#herbie">Herbie</SidebarItem>
        <SidebarItem href="#keywords">Keywords</SidebarItem>
        <SidebarItem href="#saved-scripts">Saved Scripts</SidebarItem>
        <SidebarItem href="#logs">Logs</SidebarItem>
        <SidebarItem href="#record">Record</SidebarItem>
      </ul>
    </div>
  );
};

export default Sidebar;
