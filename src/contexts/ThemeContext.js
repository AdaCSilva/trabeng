// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

export const themes = {
  light: 'light',
  dark: 'dark',
};

export const ThemeContext = createContext({
  theme: themes.light,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === themes.dark ? themes.dark : themes.light;
  });

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === themes.dark ? themes.light : themes.dark));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};
