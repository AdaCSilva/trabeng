import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './DetalheAtendimento.module.css';
import EditAtendimentoModal from '../components/EditAtendimentoModal'; // Importe o modal

function DetalheAtendimento() {
    const { id } = useParams(); // Pega o ID da URL
    const navigate = useNavigate();
    const [atendimento, setAtendimento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estado para controlar o modal de edição
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Usamos useCallback para evitar recriar a função em cada renderização
    const fetchAtendimento = useCallback(async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const response = await fetch(`${apiUrl}/api/atendimentos/${id}`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Atendimento não encontrado');
            }
            const data = await response.json();
            setAtendimento(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAtendimento();
    }, [fetchAtendimento]);

    // Função para ser chamada quando o atendimento for atualizado no modal
    const handleAtendimentoUpdated = (atendimentoAtualizado) => {
        setAtendimento(atendimentoAtualizado); // Atualiza os dados na tela instantaneamente
    };

    if (loading) return <p>Carregando detalhes do atendimento...</p>;
    if (error) return <p className={styles.error}>Erro: {error}</p>;
    if (!atendimento) return <p>Atendimento não encontrado.</p>;

    // Formata os endereços para exibição
    const enderecos = atendimento.enderecosresponsaveis?.filter(e => e).join(', ') || 'Não informado';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Detalhes do Atendimento</h1>
                <div className={styles.headerActions}>
                     <button onClick={() => setIsModalOpen(true)} className={styles.editButton}>Editar</button>
                     <button onClick={() => navigate(-1)} className={styles.backButton}>Voltar</button>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                {/* Card de Informações Principais */}
                <div className={`${styles.card} ${styles.fullWidth}`}>
                    <h3>Informações do Caso</h3>
                    <div className={styles.infoRow}>
                        <div><strong>Nº do Procedimento:</strong> {atendimento.numero_procedimento}</div>
                        <div><strong>Status:</strong> <span className={`${styles.status} ${styles[atendimento.status?.replace(/\s+/g, '')]}`}>{atendimento.status}</span></div>
                    </div>
                    <div className={styles.infoRow}>
                        <div><strong>Data de Abertura:</strong> {new Date(atendimento.data_abertura).toLocaleDateString('pt-BR')}</div>
                        <div><strong>Conselheiro(a) Responsável:</strong> {atendimento.nomeconselheira || 'Não atribuído'}</div>
                    </div>
                </div>

                {/* Card da Criança */}
                <div className={styles.card}>
                    <h3>Criança/Adolescente</h3>
                    <p><strong>Nome:</strong> {atendimento.nomecrianca}</p>
                    <p><strong>Data de Nascimento:</strong> {atendimento.data_nascimento ? new Date(atendimento.data_nascimento).toLocaleDateString('pt-BR') : 'Não informada'}</p>
                    <p><strong>Sexo:</strong> {atendimento.sexo || 'Não informado'}</p>
                    <p><strong>Escolaridade:</strong> {atendimento.escolaridade || 'Não informada'}</p>
                </div>

                {/* Card dos Responsáveis */}
                <div className={styles.card}>
                    <h3>Responsáveis</h3>
                    <p><strong>Nomes:</strong> {atendimento.nomesresponsaveis?.filter(r => r).join(', ') || 'Não informado'}</p>
                    <p><strong>Telefones:</strong> {atendimento.telefonesresponsaveis?.filter(t => t).join(', ') || 'Não informado'}</p>
                    <p><strong>Endereço:</strong> {enderecos}</p>
                </div>

                {/* Card da Ocorrência */}
                <div className={`${styles.card} ${styles.fullWidth}`}>
                    <h3>Descrição e Medidas</h3>
                    <h4>Descrição da Ocorrência:</h4>
                    <p className={styles.textAreaContent}>{atendimento.descricao_ocorrencia}</p>
                    <h4>Medidas Adotadas:</h4>
                    <p className={styles.textAreaContent}>{atendimento.medidas_adotadas}</p>
                </div>
            </div>

            {/* Renderiza o modal de edição se isModalOpen for true */}
            {isModalOpen && (
                <EditAtendimentoModal
                    atendimento={atendimento}
                    onClose={() => setIsModalOpen(false)}
                    onAtendimentoUpdated={handleAtendimentoUpdated}
                />
            )}
        </div>
    );
}

export default DetalheAtendimento;