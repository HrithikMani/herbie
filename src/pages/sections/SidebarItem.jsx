import React from 'react';

const SidebarItem = ({ href, children }) => {
  return (
    <li>
      <a href={href}>{children}</a>
    </li>
  );
};

export default SidebarItem;
