import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import Header from '../components/Header';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // AQUI declaramos a variável antes de usar
        const apiUrl = process.env.REACT_APP_API_URL;

        try {
            // Aqui usamos a variável com a URL correta do backend
            const response = await fetch(`${apiUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: email, senha: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Se a resposta não for OK (ex: 401, 500), joga um erro com a mensagem do backend
                throw new Error(data.message || 'Erro ao fazer login');
            }

            // Se o login for bem-sucedido
            console.log('Login bem-sucedido:', data);
            // Aqui você pode salvar o token/usuário no localStorage e redirecionar
            // localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/home'); // Redireciona para a página Home

        } catch (err) {
            setError(err.message);
            console.error('Falha no login:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.loginBox}>
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Usuário</label>
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.loginButton} disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;