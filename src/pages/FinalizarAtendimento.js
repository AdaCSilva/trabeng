import React, { useState, useEffect } from 'react';
import styles from './FinalizarAtendimento.module.css';

// Definindo a URL da API. O ideal é que venha de uma variável de ambiente.
// Se você já tem isso definido em outro lugar, pode remover esta linha.
const apiUrl = process.env.REACT_APP_API_URL || '';

const FinalizarAtendimento = () => {
    const [casos, setCasos] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCasos = async () => {
        setLoading(true);
        try {
            // CORREÇÃO: Usando a variável apiUrl
            const response = await fetch(`${apiUrl}/api/atendimentos?status=Em andamento`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao buscar atendimentos.');
            }
            const data = await response.json();
            setCasos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCasos();
    }, []);

    const handleFinalizar = async (id) => {
        if (!window.confirm('Tem certeza que deseja finalizar este atendimento?')) {
            return;
        }

        try {
            // CORREÇÃO: Usando a variável apiUrl
            const response = await fetch(`${apiUrl}/api/atendimentos/${id}/finalizar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Não foi possível finalizar o atendimento.');
            }
            
            alert('Atendimento finalizado com sucesso!');
            setCasos(casosAtuais => casosAtuais.filter(caso => caso.id_caso !== id));

        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return <p>Carregando atendimentos...</p>;
    }

    if (error) {
        return <p className={styles.error}>{error}</p>;
    }

    return (
        <div className={styles.container}>
            <h1>Finalizar Atendimento</h1>
            <p>Aqui estão listados todos os atendimentos com status "Em andamento".</p>
            
            <div className={styles.listaAtendimentos}>
                {casos.length > 0 ? (
                    casos.map(caso => (
                        <div key={caso.id_caso} className={styles.cardAtendimento}>
                            <h3>Nº Procedimento: {caso.numero_procedimento || `Caso #${caso.id_caso}`}</h3>
                            <p><strong>Criança/Adolescente:</strong> {caso.nomecrianca}</p>
                            <p><strong>Descrição:</strong> {caso.descricao_ocorrencia}</p>
                            <p><strong>Data de Abertura:</strong> {new Date(caso.data_abertura).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Conselheiro(a) Responsável:</strong> {caso.nomeconselheira || 'Não atribuído'}</p>
                            <button onClick={() => handleFinalizar(caso.id_caso)} className={styles.finalizarButton}>
                                Finalizar Atendimento
                            </button>
                        </div>
                    ))
                ) : (
                    <p>Nenhum atendimento "Em andamento" encontrado.</p>
                )}
            </div>
        </div>
    );
};

export default FinalizarAtendimento;