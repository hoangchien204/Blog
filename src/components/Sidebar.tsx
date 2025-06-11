import React from 'react';
import { FaCog } from 'react-icons/fa';

function Sidebar({ toggleDarkMode, darkMode }) {
  return (
    <nav>
      {/* Các menu khác */}
      <a
        href="#"
        onClick={e => {
          e.preventDefault();
          toggleDarkMode();
        }}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <FaCog />
        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
      </a>
    </nav>
  );
}

export default Sidebar;
