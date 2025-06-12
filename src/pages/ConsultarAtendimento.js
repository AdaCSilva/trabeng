import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConsultarAtendimento.module.css';

function ConsultarAtendimento() {
    const [atendimentos, setAtendimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAtendimentos = async () => {
            const apiUrl = process.env.REACT_APP_API_URL;
            try {
                const response = await fetch(`${apiUrl}/api/atendimentos`);
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

        fetchAtendimentos();
    }, []); // O array vazio garante que o useEffect rode apenas uma vez

    const handleRowClick = (id) => {
        // Futuramente, isso levará para a página de detalhes
        console.log(`Clicou no atendimento com ID: ${id}`);
        navigate(`/atendimentos/${id}`); 
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <main className={styles.mainContent}>
                    <h2>Consultar Atendimentos</h2>
                    <p>Carregando...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.mainContent}>
                    <h2>Consultar Atendimentos</h2>
                    <p className={styles.error}>Erro: {error}</p>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            
            <main className={styles.mainContent}>
                <h2>Consultar Atendimentos</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.atendimentosTable}>
                        <thead>
                            <tr>
                                <th>Nº Procedimento</th>
                                <th>Nome da Criança/Adolescente</th>
                                <th>Data de Abertura</th>
                                <th>Conselheiro(a) Responsável</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {atendimentos.length > 0 ? (
                                atendimentos.map((atendimento) => (
                                    <tr key={atendimento.id_caso} onClick={() => handleRowClick(atendimento.id_caso)}>
                                        <td>{atendimento.numero_procedimento || 'N/A'}</td>
                                        <td>{atendimento.nomecrianca}</td>
                                        <td>{new Date(atendimento.data_abertura).toLocaleDateString()}</td>
                                        <td>{atendimento.nomeconselheira || 'Não atribuído'}</td>
                                        <td>{atendimento.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">Nenhum atendimento encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default ConsultarAtendimento;