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
        setLoading(true);
        setError('');

        const apiUrl = process.env.REACT_APP_API_URL;
        const updateUrl = `${apiUrl}/api/usuarios/${user.id_usuario}`;

        // LINHA DE DIAGNÓSTICO: Vamos ver a URL no console
        console.log("URL de atualização sendo chamada:", updateUrl);

        try {
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                 // Se a resposta não for OK, vamos tentar ler como texto para ver o HTML
                const errorText = await response.text();
                console.error("Resposta não-OK do servidor:", errorText);
                throw new Error('O servidor respondeu com um erro.');
            }
            
            // Tenta converter para JSON somente se a resposta for OK
            const result = await response.json();
            
            alert('Usuário atualizado com sucesso!');
            onUserUpdated();
            onClose();
        } catch (err) {
            // Esse erro agora vai pegar tanto falhas de rede quanto o JSON inválido
            console.error("Erro completo:", err);
            setError("Falha ao salvar. Verifique o console para mais detalhes.");
        } finally {
            setLoading(false);
        }
    };

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