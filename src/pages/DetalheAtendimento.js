import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './DetalheAtendimento.module.css';

function DetalheAtendimento() {
    const { id } = useParams(); // Pega o ID da URL
    const [atendimento, setAtendimento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetalhes = async () => {
            const apiUrl = process.env.REACT_APP_API_URL;
            try {
                setLoading(true);
                const response = await fetch(`${apiUrl}/api/atendimentos/${id}`);
                if (!response.ok) {
                    throw new Error('Não foi possível carregar os detalhes do atendimento.');
                }
                const data = await response.json();
                setAtendimento(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetalhes();
    }, [id]); // Roda o efeito sempre que o ID na URL mudar

    if (loading) {
        return <div className={styles.centered}>Carregando detalhes...</div>;
    }

    if (error) {
        return <div className={`${styles.centered} ${styles.error}`}>Erro: {error}</div>;
    }

    if (!atendimento) {
        return <div className={styles.centered}>Atendimento não encontrado.</div>;
    }

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h2>Detalhes do Atendimento</h2>
                    <Link to="/consulta-atendimento" className={styles.backButton}>Voltar para a Lista</Link>
                </div>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <strong>Nº do Procedimento:</strong>
                        <p>{atendimento.numero_procedimento || 'N/A'}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <strong>Código do Atendimento:</strong>
                        <p>{atendimento.codigo_atendimento || 'N/A'}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <strong>Data de Abertura:</strong>
                        <p>{new Date(atendimento.data_abertura).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <strong>Status:</strong>
                        <p>{atendimento.status}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <strong>Conselheiro(a) Responsável:</strong>
                        <p>{atendimento.nomeconselheira || 'Não atribuído'}</p>
                    </div>
                </div>

                <h3 className={styles.sectionTitle}>Informações da Criança/Adolescente</h3>
                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <strong>Nome:</strong>
                        <p>{atendimento.nomecrianca}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <strong>Data de Nascimento:</strong>
                        <p>{new Date(atendimento.data_nascimento).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <strong>Sexo:</strong>
                        <p>{atendimento.sexo}</p>
                    </div>
                     <div className={styles.detailItem}>
                        <strong>Escolaridade:</strong>
                        <p>{atendimento.escolaridade}</p>
                    </div>
                </div>

                <h3 className={styles.sectionTitle}>Informações dos Responsáveis</h3>
                <div className={styles.detailsGrid}>
                     <div className={styles.detailItem}>
                        <strong>Nome(s):</strong>
                        <p>{atendimento.nomesresponsaveis?.join(', ') || 'N/A'}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <strong>Telefone(s):</strong>
                        <p>{atendimento.telefonesresponsaveis?.join(', ') || 'N/A'}</p>
                    </div>
                    <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                        <strong>Endereço(s):</strong>
                        <p>{atendimento.enderecosresponsaveis?.join('; ') || 'N/A'}</p>
                    </div>
                </div>

                <h3 className={styles.sectionTitle}>Descrição do Caso</h3>
                <div className={styles.fullWidthBox}>
                    <strong>Descrição da Ocorrência:</strong>
                    <p>{atendimento.descricao_ocorrencia}</p>
                </div>
                <div className={styles.fullWidthBox}>
                    <strong>Medidas Adotadas:</strong>
                    <p>{atendimento.medidas_adotadas}</p>
                </div>
            </main>
        </div>
    );
}

export default DetalheAtendimento;