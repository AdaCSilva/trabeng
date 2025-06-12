import React, { useState } from 'react';
import styles from './AddUserModal.module.css';

function AddUserModal({ onClose, onUserAdded }) {
    const [nome, setNome] = useState('');
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [perfil, setPerfil] = useState('Conselheiro'); // Valor padrão
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const apiUrl = process.env.REACT_APP_API_URL;
        try {
            const response = await fetch(`${apiUrl}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, login, senha, perfil })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Falha ao criar usuário.');
            }

            onUserAdded(); // Avisa o componente pai que um usuário foi adicionado
            onClose(); // Fecha o modal

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Adicionar Novo Usuário</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="nome">Nome Completo</label>
                        <input id="nome" type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="login">Login (Email)</label>
                        <input id="login" type="email" value={login} onChange={e => setLogin(e.target.value)} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="senha">Senha</label>
                        <input id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="perfil">Perfil</label>
                        <select id="perfil" value={perfil} onChange={e => setPerfil(e.target.value)}>
                            <option value="Conselheiro">Conselheiro</option>
                            <option value="Administrador">Administrador</option>
                            <option value="Secretario">Secretário</option>
                            <option value="Assistente Social">Assistente Social</option>
                            <option value="Psicólogo">Psicólogo</option>
                        </select>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.modalFooter}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUserModal;