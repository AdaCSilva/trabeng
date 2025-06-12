import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, NavLink, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Atendimento from './pages/Atendimento';
import Upload from './pages/Upload';
import Login from './pages/Login';
import ConsultarAtendimento from './pages/ConsultarAtendimento';
import DetalheAtendimento from './pages/DetalheAtendimento';
// Importe novos componentes para Consultar e Finalizar Atendimento, se já os tiver
// import FinalizarAtendimento from './pages/FinalizarAtendimento';
// import GerenciarUsuarios from './pages/GerenciarUsuarios';

import { ThemeContext, themes } from './contexts/ThemeContext';
import Header from './components/Header';

import styles from './App.module.css'; //

function App() {
  const [theme, setTheme] = useState(themes.light); //
  const [loggedIn, setLoggedIn] = useState(false); //
  const [userProfile, setUserProfile] = useState(null); // Novo estado para o perfil do usuário

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === themes.dark || savedTheme === themes.light)) {
      setTheme(savedTheme);
    }
    // Tentar restaurar o estado de login e perfil se houver no localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(savedProfile);
      setLoggedIn(true);
    }
  }, []); //


  useEffect(() => {
    localStorage.setItem('theme', theme); //
    if (userProfile) {
      localStorage.setItem('userProfile', userProfile);
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [theme, userProfile]); //

  const toggleTheme = () => {
    setTheme(theme === themes.light ? themes.dark : themes.light); //
  };

  // Função para lidar com o login bem-sucedido, recebendo o perfil
  const handleLogin = (profile) => {
    setLoggedIn(true);
    setUserProfile(profile);
  };

  const handleLogout = () => {
    setLoggedIn(false); //
    setUserProfile(null);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`${styles.app} ${theme === themes.dark ? styles.dark : ''}`}> {/* */}
        <Router>
          {!loggedIn ? (
            <Routes>
              {/* Passa a função handleLogin para o componente Login */}
              <Route path="/login" element={<Login onLogin={handleLogin} />} /> {/* */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <div className={styles.dashboard}> {/* */}
              <Header onLogout={handleLogout} isDarkMode={theme === themes.dark} /> {/* */}

              <nav className={styles.sidebar} aria-label="Menu principal">
                {/* Links que todos os usuários logados podem ver */}
                <NavLink to="/home" className={({ isActive }) => (isActive ? styles.active : '')}> {/* */}
                  <span className="material-icons">home</span> Início
                </NavLink>

                {/* Apenas Secretário pode Registrar Atendimento */}
                {userProfile === 'Secretario' && (
                    <NavLink to="/atendimento" className={({ isActive }) => (isActive ? styles.active : '')}> {/* */}
                      <span className="material-icons">support_agent</span> Registrar Atendimento
                    </NavLink>
                )}

                {/* Consultar Atendimento: Conselheiro, Assistente Social, Psicólogo, Administrador (Secretário também pode) */}
                {userProfile && ['Conselheiro', 'Assistente Social', 'Psicólogo', 'Administrador', 'Secretario'].includes(userProfile) && (
                    <NavLink to="/consultar-atendimento" className={({ isActive }) => (isActive ? styles.active : '')}>
                      <span className="material-icons">search</span> Consultar Atendimento
                    </NavLink>
                )}

                {/* Finalizar Atendimento: Apenas Conselheiro pode Finalizar */}
                {userProfile === 'Conselheiro' && (
                    <NavLink to="/finalizar-atendimento" className={({ isActive }) => (isActive ? styles.active : '')}>
                      <span className="material-icons">check_circle</span> Finalizar Atendimento
                    </NavLink>
                )}

                {/* Upload de Documentos: Conselheiro, Assistente Social, Psicólogo (gerenciamento) */}
                {userProfile && ['Conselheiro', 'Assistente Social', 'Psicólogo', 'Administrador'].includes(userProfile) && (
                    <NavLink to="/upload" className={({ isActive }) => (isActive ? styles.active : '')}> {/* */}
                      <span className="material-icons">upload_file</span> Upload de Documentos
                    </NavLink>
                )}

                {/* Gerenciar Usuários: Apenas Administrador */}
                {userProfile === 'Administrador' && (
                    <NavLink to="/gerenciar-usuarios" className={({ isActive }) => (isActive ? styles.active : '')}>
                      <span className="material-icons">group</span> Gerenciar Usuários
                    </NavLink>
                )}

                {/* Compartilhar Informações: Conselheiro */}
                {userProfile === 'Conselheiro' && (
                    <NavLink to="/compartilhar-informacoes" className={({ isActive }) => (isActive ? styles.active : '')}>
                      <span className="material-icons">share</span> Compartilhar Informações
                    </NavLink>
                )}
              </nav>

              <main className={styles.main}> {/* */}
                <Routes>
                  <Route path="/home" element={<Home />} /> 
                  <Route path="/atendimento" element={<Atendimento userProfile={userProfile} />} />
                  <Route path="/upload" element={<Upload />} /> {/* */}
                  <Route path="/consultar-atendimento" element={<ConsultarAtendimento />} />
                  <Route path="/atendimentos/:id" element={<DetalheAtendimento />} /> 

                  {/* Rotas para os novos componentes (você precisará criá-los) */}
                  {/* <Route path="/finalizar-atendimento" element={<FinalizarAtendimento />} /> */}
                  {/* <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} /> */}
                  {/* <Route path="/compartilhar-informacoes" element={<CompartilharInformacoes />} /> */}

                  <Route path="*" element={<Navigate to="/home" replace />} /> {/* */}
                </Routes>
              </main>

              <footer className={styles.footer}> {/* */}
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