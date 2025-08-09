import React, { useState } from 'react';
import MouseActivityDashboard from './MouseActivityDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className={`dashboard ${darkMode ? 'dark' : 'light'}`}>
      <aside className="sidebar">
        <h2>Dashboard</h2>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </header>

        <div className="content">
          <MouseActivityDashboard isDark={darkMode} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;






