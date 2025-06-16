import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';

function EditAtendimentoModal({ atendimento, onClose, onAtendimentoUpdated }) {
    const [formData, setFormData] = useState({
        status: '',
        descricao_ocorrencia: '',
        medidas_adotadas: '',
        id_conselheira_atendimento: ''
    });

    const [conselheiros, setConselheiros] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchConselheiros = async () => {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            try {
                const response = await fetch(`${apiUrl}/api/usuarios/conselheiros`);
                if (!response.ok) throw new Error('Falha ao buscar conselheiros.');
                const data = await response.json();
                setConselheiros(data);
            } catch (err) {
                console.error(err);
                setError('Não foi possível carregar a lista de conselheiros.');
            }
        };
        fetchConselheiros();
    }, []);

    useEffect(() => {
        if (atendimento) {
            setFormData({
                status: atendimento.status || '',
                descricao_ocorrencia: atendimento.descricao_ocorrencia || '',
                medidas_adotadas: atendimento.medidas_adotadas || '',
                id_conselheira_atendimento: atendimento.id_conselheira_atendimento || ''
            });
        }
    }, [atendimento]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const apiUrl = process.env.REACT_APP_API_URL || '';
        const updateUrl = `${apiUrl}/api/atendimentos/${atendimento.id_caso}`;

        try {
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao atualizar atendimento.');
            }
            
            alert('Atendimento atualizado com sucesso!');
            // Otimização: Passa o dado atualizado de volta para o pai
            onAtendimentoUpdated(result.atendimento); 
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!atendimento) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Editar Atendimento (Nº {atendimento.numero_procedimento})</h2>
                <form onSubmit={handleSubmit}>

                    {/* <<< MELHORIA: Agrupando campos relacionados >>> */}
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Status e Responsável</legend>
                        <div className={styles.inputGroup}>
                            <label htmlFor="id_conselheira_atendimento">Conselheiro(a) Responsável</label>
                            <select
                                id="id_conselheira_atendimento"
                                name="id_conselheira_atendimento"
                                value={formData.id_conselheira_atendimento}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">-- Não atribuído --</option>
                                {conselheiros.map(c => (
                                    <option key={c.id_usuario} value={c.id_usuario}>
                                        {c.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="Em Andamento">Em Andamento</option>
                                <option value="Finalizado">Finalizado</option>
                                <option value="Arquivado">Arquivado</option>
                            </select>
                        </div>
                    </fieldset>
                    
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Detalhes do Caso</legend>
                        <div className={styles.inputGroup}>
                            <label htmlFor="descricao_ocorrencia">Descrição da Ocorrência</label>
                            <textarea
                                id="descricao_ocorrencia"
                                name="descricao_ocorrencia"
                                rows="5"
                                value={formData.descricao_ocorrencia}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="medidas_adotadas">Medidas Adotadas</label>
                            <textarea
                                id="medidas_adotadas"
                                name="medidas_adotadas"
                                rows="5"
                                value={formData.medidas_adotadas}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </fieldset>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.saveButton} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditAtendimentoModal;