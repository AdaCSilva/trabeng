import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, NavLink, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Atendimento from './pages/Atendimento';
import Login from './pages/Login';
import ConsultarAtendimento from './pages/ConsultarAtendimento';
import DetalheAtendimento from './pages/DetalheAtendimento';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import FinalizarAtendimento from './pages/FinalizarAtendimento'; // <<< ALTERAÇÃO 1: Importar o novo componente

import { ThemeContext, themes } from './contexts/ThemeContext';
import Header from './components/Header';

import styles from './App.module.css'; 

function App() {
  const [theme, setTheme] = useState(themes.light);
  const [loggedIn, setLoggedIn] = useState(false); 
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === themes.dark || savedTheme === themes.light)) {
      setTheme(savedTheme);
    }
    // Tenta restaurar o estado de login e perfil se houver no localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(savedProfile);
      setLoggedIn(true);
    }
  }, []); 


  useEffect(() => {
    localStorage.setItem('theme', theme); 
    if (userProfile) {
      localStorage.setItem('userProfile', userProfile);
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [theme, userProfile]); 

  const toggleTheme = () => {
    setTheme(theme === themes.light ? themes.dark : themes.light); 
  };

  // Função para lidar com o login bem-sucedido, recebendo o perfil
  const handleLogin = (profile) => {
    setLoggedIn(true);
    setUserProfile(profile);
  };

  const handleLogout = () => {
    setLoggedIn(false); 
    setUserProfile(null);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`${styles.app} ${theme === themes.dark ? styles.dark : ''}`}>
        <Router>
          {!loggedIn ? (
            <Routes>
              {/* Passa a função handleLogin para o componente Login */}
              <Route path="/login" element={<Login onLogin={handleLogin} />} /> 
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <div className={styles.dashboard}> 
              <Header onLogout={handleLogout} isDarkMode={theme === themes.dark} /> 

              <nav className={styles.sidebar} aria-label="Menu principal">
                {/* Links que todos os usuários logados podem ver */}
                <NavLink to="/home" className={({ isActive }) => (isActive ? styles.active : '')}> 
                  <span className="material-icons">home</span> Início
                </NavLink>

                {/* Apenas Secretario pode Registrar Atendimento */}
                {(userProfile === 'Secretario' || userProfile === 'Administrador') && (
                    <NavLink to="/atendimento" className={({ isActive }) => (isActive ? styles.active : '')}> 
                      <span className="material-icons">support_agent</span> Registrar Atendimento
                    </NavLink>
                )}

                {/* Consultar Atendimento: Conselheiro, Assistente Social, Psicólogo, Administrador (Secretário também pode) */}
                {userProfile && ['Conselheiro', 'Assistente Social', 'Psicólogo', 'Administrador', 'Secretario'].includes(userProfile) && (
                    <NavLink to="/consultar-atendimento" className={({ isActive }) => (isActive ? styles.active : '')}>
                      <span className="material-icons">search</span> Consultar Atendimento
                    </NavLink>
                )}

                {/* Finalizar Atendimento: Apenas Conselheiro e Administrador podem Finalizar */}
                {(userProfile === 'Conselheiro' || userProfile === 'Administrador') && (
                    <NavLink to="/finalizar-atendimento" className={({ isActive }) => (isActive ? styles.active : '')}>
                      <span className="material-icons">check_circle</span> Finalizar Atendimento
                    </NavLink>
                )}

                {/* Gerenciar Usuários: Apenas Administrador */}
                {userProfile === 'Administrador' && (
                    <NavLink to="/gerenciar-usuarios" className={({ isActive }) => (isActive ? styles.active : '')}>
                      <span className="material-icons">group</span> Gerenciar Usuários
                    </NavLink>
                )}
              </nav>

              <main className={styles.main}> 
                <Routes>
                  <Route path="/home" element={<Home />} /> 
                  <Route path="/atendimento" element={<Atendimento userProfile={userProfile} />} />
                  <Route path="/consultar-atendimento" element={<ConsultarAtendimento />} />
                  <Route path="/atendimentos/:id" element={<DetalheAtendimento />} /> 
                  <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} /> 
                  
                  {/* <<< ALTERAÇÃO 2: Adicionar a rota para o novo componente */}
                  <Route path="/finalizar-atendimento" element={<FinalizarAtendimento />} />

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