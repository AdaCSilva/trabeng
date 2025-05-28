import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';  // corrigido aqui
import styles from './Header.module.css';

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>CONSELHO TUTELAR</h1>

      <div className={styles.controls}>
        <button
          aria-label="Alternar tema claro e escuro"
          onClick={toggleTheme}
          className={styles.themeToggle}
          title="Alternar tema"
        >
          <span className="material-icons">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>
    </header>
  );
};

export default Header;
