import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, NavLink, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Atendimento from './pages/Atendimento';
import Upload from './pages/Upload';
import Login from './pages/Login';

import { ThemeContext, themes } from './contexts/ThemeContext';

import Header from './components/Header';

import styles from './App.module.css';

function App() {
  const [theme, setTheme] = useState(themes.light);
  const [loggedIn, setLoggedIn] = useState(false); 


  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === themes.dark || savedTheme === themes.light)) {
      setTheme(savedTheme);
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === themes.light ? themes.dark : themes.light);
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`${styles.app} ${theme === themes.dark ? styles.dark : ''}`}>
        <Router>
          {!loggedIn ? (
            <Routes>
              <Route path="/login" element={<Login onLogin={() => setLoggedIn(true)} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <div className={styles.dashboard}>
              <Header onLogout={handleLogout} isDarkMode={theme === themes.dark} />

              <nav className={styles.sidebar} aria-label="Menu principal">
                <NavLink to="/home" className={({ isActive }) => (isActive ? styles.active : '')}>
                  <span className="material-icons">home</span> Início
                </NavLink>
                <NavLink to="/atendimento" className={({ isActive }) => (isActive ? styles.active : '')}>
                  <span className="material-icons">support_agent</span> Atendimento
                </NavLink>
                <NavLink to="/upload" className={({ isActive }) => (isActive ? styles.active : '')}>
                  <span className="material-icons">upload_file</span> Upload
                </NavLink>
              </nav>

              <main className={styles.main}>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/atendimento" element={<Atendimento />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </main>

              <footer className={styles.footer}>
                Conselho Tutelar - Mococa - SP © {new Date().getFullYear()}
              </footer>
            </div>
          )}
        </Router>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
