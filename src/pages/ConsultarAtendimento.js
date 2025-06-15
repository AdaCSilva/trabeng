import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConsultarAtendimento.module.css';
import EditAtendimentoModal from '../components/EditAtendimentoModal';

function ConsultarAtendimento() {
    const [atendimentos, setAtendimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAtendimento, setEditingAtendimento] = useState(null);

    const fetchAtendimentos = async () => {
        setLoading(true);
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/atendimentos`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Não foi possível carregar os atendimentos.');
            }
            const data = await response.json();
            setAtendimentos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAtendimentos();
    }, []);

    const handleViewDetails = (id) => {
        navigate(`/atendimentos/${id}`);
    };

    const handleEditClick = (atendimento) => {
        setEditingAtendimento(atendimento);
        setIsEditModalOpen(true);
    };

    const handleAtendimentoUpdated = () => {
        fetchAtendimentos();
    };

    if (loading) return <div className={styles.container}><main className={styles.mainContent}><h2>Consultar Atendimentos</h2><p>Carregando...</p></main></div>;
    if (error) return <div className={styles.container}><main className={styles.mainContent}><h2>Consultar Atendimentos</h2><p className={styles.error}>Erro: {error}</p></main></div>;

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <h2>Consultar Atendimentos</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.atendimentosTable}>
                        <thead>
                            <tr>
                                <th>Nº Procedimento</th>
                                <th>Criança/Adolescente</th>
                                <th>Data de Abertura</th>
                                <th>Conselheiro(a)</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {atendimentos.length > 0 ? (
                                atendimentos.map((atendimento) => (
                                    <tr key={atendimento.id_caso}>
                                        <td>{atendimento.numero_procedimento || 'N/A'}</td>
                                        <td>{atendimento.nomecrianca}</td>
                                        <td>{new Date(atendimento.data_abertura).toLocaleDateString()}</td>
                                        <td>{atendimento.nomeconselheira || 'Não atribuído'}</td>
                                        <td>{atendimento.status}</td>
                                        <td className={styles.actions}>
                                            <button onClick={() => handleViewDetails(atendimento.id_caso)} className={styles.actionButton}>
                                                Detalhes
                                            </button>
                                            <button onClick={() => handleEditClick(atendimento)} className={`${styles.actionButton} ${styles.editButton}`}>
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">Nenhum atendimento encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {isEditModalOpen && (
                <EditAtendimentoModal
                    atendimento={editingAtendimento}
                    onClose={() => setIsEditModalOpen(false)}
                    onAtendimentoUpdated={handleAtendimentoUpdated}
                />
            )}
        </div>
    );
}

export default ConsultarAtendimento;