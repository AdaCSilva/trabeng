import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';

function EditUserModal({ user, onClose, onUserUpdated }) {
    const [formData, setFormData] = useState({
        nome: '',
        login: '',
        perfil: 'Conselheiro',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                nome: user.nome,
                login: user.login,
                perfil: user.perfil,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const apiUrl = process.env.REACT_APP_API_URL;

        try {
            const response = await fetch(`${apiUrl}/api/usuarios/${user.id_usuario}`, {
                method: 'PUT', // Usamos PUT para atualizar o recurso
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Enviamos todos os dados do formulário
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Erro ao atualizar o usuário.');
            }

            alert('Usuário atualizado com sucesso!');
            onUserUpdated(); // Avisa o componente pai para atualizar a lista
            onClose();       // Fecha o modal
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Não renderiza nada se não houver um usuário para editar
    if (!user) {
        return null;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Editar Usuário</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="nome">Nome</label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="login">Login (Email)</label>
                        <input
                            type="email"
                            id="login"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="perfil">Perfil</label>
                        <select
                            id="perfil"
                            name="perfil"
                            value={formData.perfil}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="Administrador">Administrador</option>
                            <option value="Conselheiro">Conselheiro</option>
                            <option value="Assistente Social">Assistente Social</option>
                            <option value="Psicólogo">Psicólogo</option>
                            <option value="Secretario">Secretário</option>
                        </select>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.saveButton} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUserModal;