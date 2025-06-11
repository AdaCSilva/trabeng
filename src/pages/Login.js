import React, { useState } from 'react';
import styles from './Login.module.css'; //

// O componente Login agora recebe `onLogin` para notificar App.js sobre o sucesso e o perfil
export default function Login({ onLogin }) {
  const [username, setUsername] = useState(''); //
  const [password, setPassword] = useState(''); //
  const [error, setError] = useState(''); //

  const handleSubmit = async (e) => { // Tornar a função assíncrona
    e.preventDefault();
    setError(''); //

    const apiUrl = process.env.REACT_APP_API_URL;

    if (username.trim().length < 3) { //
      setError('Usuário deve ter no mínimo 3 caracteres.'); //
      return;
    }
    if (password.length < 6) { //
      setError('Senha deve ter no mínimo 6 caracteres.'); //
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/login`, { // Chamada para o backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: username, senha: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no login. Tente novamente.');
      }

      const data = await response.json();
      // Chamar onLogin com o perfil do usuário retornado pelo backend
      onLogin(data.user.perfil); // O App.js agora sabe o perfil do usuário
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className={styles.loginContainer} aria-label="Área de login"> {/* */}
      <h2>Entrar no Sistema</h2> {/* */}
      <form onSubmit={handleSubmit} noValidate> {/* */}
        <label htmlFor="username">Usuário</label> {/* */}
        <input
          id="username"
          name="username" // Adicionado name para consistência
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Digite seu usuário"
          autoComplete="username"
          required
          minLength={3}
          spellCheck={false}
          className={styles.input} // Adicionado estilo
        />

        <label htmlFor="password">Senha</label> {/* */}
        <input
          id="password"
          name="password" // Adicionado name para consistência
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
          minLength={6}
          className={styles.input} // Adicionado estilo
        />

        {error && <p className={styles.errorMsg} role="alert">{error}</p>} {/* */}

        <button type="submit" aria-label="Entrar no sistema"> {/* */}
          Entrar
        </button>
      </form>
    </main>
  );
}
