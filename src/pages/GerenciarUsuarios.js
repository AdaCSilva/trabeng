import React, { useState, useEffect } from 'react';
import styles from './GerenciarUsuarios.module.css';
import AddUserModal from '../components/AddUserModal'; // Importa o modal

function GerenciarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal

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

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h2>Gerenciar Usuários</h2>
                    <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
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
                                                <button className={`${styles.actionButton} ${styles.deleteButton}`}>Excluir</button>
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
            {isModalOpen && (
                <AddUserModal 
                    onClose={() => setIsModalOpen(false)} 
                    onUserAdded={handleUserAdded}
                />
            )}
        </div>
    );
}

export default GerenciarUsuarios;