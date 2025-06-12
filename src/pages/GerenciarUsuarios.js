import React, { useState, useEffect } from 'react';
import styles from './GerenciarUsuarios.module.css';
import AddUserModal from '../components/AddUserModal'; // Importa o modal de adição
import ConfirmModal from '../components/ConfirmModal'; // Modal de confirmação de remoção

function GerenciarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false); // Estado para controlar o modal de adição
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

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

    const handleUserAdded = () => {
        // Atualiza a lista de usuários após adicionar um novo
        fetchUsuarios(); 
    };

    // Funções para auxiliar na remoção de usuários
    const openDeleteModal = (id_usuario) => {
        setSelectedUserId(id_usuario);
        setIsRemoveModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsRemoveModalOpen(false);
        setSelectedUserId(null);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/usuarios/${selectedUserId}`, {
                method: 'DELETE'
            });

            let data = {};
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text(); // <- captura texto simples se não for JSON
                throw new Error(text || 'Resposta inválida da API.');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao excluir o usuário.');
            }

            alert('Usuário excluído com sucesso!');
            fetchUsuarios(); // Atualiza lista
        } catch (err) {
            alert(`Erro: ${err.message}`);
        } finally {
            closeDeleteModal();
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h2>Gerenciar Usuários</h2>
                    <button onClick={() => setIsUserModalOpen(true)} className={styles.addButton}>
                        Adicionar Novo Usuário
                    </button>
                </div>

                {loading && <p>Carregando...</p>}
                {error && <p className={styles.error}>Erro: {error}</p>}
                {!loading && !error && (
                    <div className={styles.tableContainer}>
                        {/* A tabela continua a mesma */}
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
                                                <button className={styles.actionButton}>Editar</button>
                                                <button className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => openDeleteModal(usuario.id_usuario)}
                                                >
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

            {/* Renderiza o modal condicionalmente */}
            {isUserModalOpen && (
                <AddUserModal 
                    onClose={() => setIsUserModalOpen(false)} 
                    onUserAdded={handleUserAdded}
                />
            )}

            <ConfirmModal
                isOpen={isRemoveModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                message="Tem certeza que deseja excluir este usuário?"
            />
        </div>
    );
}

export default GerenciarUsuarios;