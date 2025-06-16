import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './ConsultarAtendimento.module.css';
import EditAtendimentoModal from '../components/EditAtendimentoModal';

function ConsultarAtendimento() {
    // --- Estados do Componente ---
    const [atendimentos, setAtendimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para controlar o modal de edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAtendimento, setSelectedAtendimento] = useState(null);

    // --- Busca de Dados ---
    // Usamos useCallback para que a função não seja recriada a cada renderização
    const fetchAtendimentos = useCallback(async () => {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || '';
        try {
            const response = await fetch(`${apiUrl}/api/atendimentos`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Falha ao buscar atendimentos.');
            }
            const data = await response.json();
            setAtendimentos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect para chamar a busca de dados quando o componente montar
    useEffect(() => {
        fetchAtendimentos();
    }, [fetchAtendimentos]);

    // --- Funções de Evento ---
    const handleEditClick = (atendimento) => {
        setSelectedAtendimento(atendimento);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedAtendimento(null);
    };

    // Função otimizada para atualizar a lista sem nova chamada à API
    const handleAtendimentoUpdated = (atendimentoAtualizado) => {
        setAtendimentos(prevAtendimentos =>
            prevAtendimentos.map(atendimento =>
                atendimento.id_caso === atendimentoAtualizado.id_caso
                    ? { ...atendimento, ...atendimentoAtualizado } // Garante que todos os campos sejam mesclados
                    : atendimento
            )
        );
        fetchAtendimentos(); // Re-busca para garantir consistência total com o DB
    };

    // --- Lógica de Filtragem ---
    const filteredAtendimentos = atendimentos.filter(atendimento => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        // Busca em vários campos do atendimento
        return (
            atendimento.numero_procedimento?.toLowerCase().includes(lowerCaseSearchTerm) ||
            atendimento.nomecrianca?.toLowerCase().includes(lowerCaseSearchTerm) ||
            atendimento.status?.toLowerCase().includes(lowerCaseSearchTerm)
        );
    });

    // --- Renderização do Componente ---
    return (
        <div className={styles.container}>
            <h1>Consultar Atendimentos</h1>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Buscar por nº do procedimento, nome da criança ou status..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && <p>Carregando atendimentos...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {!loading && !error && (
                <div className={styles.listaAtendimentos}>
                    {filteredAtendimentos.length > 0 ? (
                        filteredAtendimentos.map(atendimento => (
                            <Link
                                to={`/atendimentos/${atendimento.id_caso}`}
                                key={atendimento.id_caso}
                                className={styles.cardLink}
                            >
                                <div className={styles.cardAtendimento}>
                                    <div className={styles.cardHeader}>
                                        <h3>Nº Procedimento: {atendimento.numero_procedimento}</h3>
                                        <span className={`${styles.status} ${styles[atendimento.status?.replace(/\s+/g, '')]}`}>
                                            {atendimento.status}
                                        </span>
                                    </div>
                                    <p><strong>Criança/Adolescente:</strong> {atendimento.nomecrianca}</p>
                                    <p><strong>Data de Abertura:</strong> {new Date(atendimento.data_abertura).toLocaleDateString('pt-BR')}</p>
                                    <div className={styles.cardActions}>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault(); // Impede a navegação ao clicar no botão
                                                handleEditClick(atendimento);
                                            }}
                                            className={styles.actionButton}
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>Nenhum atendimento encontrado.</p>
                    )}
                </div>
            )}

            {isModalOpen && (
                <EditAtendimentoModal
                    atendimento={selectedAtendimento}
                    onClose={handleModalClose}
                    onAtendimentoUpdated={handleAtendimentoUpdated}
                />
            )}
        </div>
    );
}

export default ConsultarAtendimento;