import React, { useState, useEffect } from 'react';
import styles from './GerenciarUsuarios.module.css';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';

function GerenciarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [editingUser, setEditingUser] = useState(null);

    const fetchUsuarios = async () => {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL;
        try {
            const response = await fetch(`${apiUrl}/api/usuarios`);
            if (!response.ok) {
                throw new Error('Não foi possível carregar a lista de usuários.');
            }
            const data = await response.json();
            setUsuarios(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleDataChanged = () => {
        fetchUsuarios();
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = async (userId) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            const apiUrl = process.env.REACT_APP_API_URL;
            try {
                const response = await fetch(`${apiUrl}/api/usuarios/${userId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Falha ao excluir o usuário.');
                }

                alert('Usuário excluído com sucesso!');
                fetchUsuarios();
            } catch (err) {
                alert(`Erro ao excluir usuário: ${err.message}`);
            }
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h2>Gerenciar Usuários</h2>
                    <button onClick={() => setIsAddModalOpen(true)} className={styles.addButton}>
                        Adicionar Novo Usuário
                    </button>
                </div>

                {loading && <p>Carregando...</p>}
                {error && <p className={styles.error}>Erro: {error}</p>}

                {!loading && !error && (
                    <div className={`${styles.tableContainer} content-card`}>
                        <table className={styles.usersTable}>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Login (Email)</th>
                                    <th>Perfil</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.length > 0 ? (
                                    usuarios.map((usuario) => (
                                        <tr key={usuario.id_usuario}>
                                            <td>{usuario.nome}</td>
                                            <td>{usuario.login}</td>
                                            <td>{usuario.perfil}</td>
                                            <td className={styles.actions}>
                                                <button onClick={() => handleEditClick(usuario)} className={styles.actionButton}>
                                                    Editar
                                                </button>
                                                <button onClick={() => handleDeleteClick(usuario.id_usuario)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">Nenhum usuário encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {isAddModalOpen && (
                <AddUserModal
                    onClose={() => setIsAddModalOpen(false)}
                    onUserAdded={handleDataChanged}
                />
            )}

            {isEditModalOpen && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setIsEditModalOpen(false)}
                    onUserUpdated={handleDataChanged}
                />
            )}
        </div>
    );
}

export default GerenciarUsuarios;