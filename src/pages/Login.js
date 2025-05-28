import React, { useState } from 'react';
import styles from './Login.module.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Usuário deve ter no mínimo 3 caracteres.');
      return;
    }
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres.');
      return;
    }

    const success = onLogin(username, password);
    if (!success) {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <main className={styles.loginContainer} aria-label="Área de login">
      <h2>Entrar no Sistema</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="username">Usuário</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Digite seu usuário"
          autoComplete="username"
          required
          minLength={3}
          spellCheck={false}
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
          minLength={6}
        />

        {error && <p className={styles.errorMsg} role="alert">{error}</p>}

        <button type="submit" aria-label="Entrar no sistema">
          Entrar
        </button>
      </form>
    </main>
  );
}
