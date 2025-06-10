import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import styles from './Header.module.css';

const Header = ({ onLogout }) => { // Recebe onLogout como prop
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>CONSELHO TUTELAR</h1>

      <div className={styles.controls}>
        {/* Botão de alternar tema */}
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

        {/* NOVO: Botão de Sair (Logout) */}
        <button
          aria-label="Sair do sistema"
          onClick={onLogout} // Chama a função onLogout passada pelo App.js
          className={styles.logoutBtn} // Usar um estilo específico para o botão de logout
          title="Sair"
        >
          <span className="material-icons">logout</span> Sair
        </button>
      </div>
    </header>
  );
};

export default Header;