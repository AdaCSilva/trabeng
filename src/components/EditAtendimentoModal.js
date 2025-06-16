import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css'; // Reutilizando o mesmo estilo do outro modal

function EditAtendimentoModal({ atendimento, onClose, onAtendimentoUpdated }) {
    // Estado para o formulário, inicializado com os dados do atendimento
    const [formData, setFormData] = useState({
        status: '',
        descricao_ocorrencia: '',
        medidas_adotadas: '',
        codigo_atendimento: '',
        numero_procedimento: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // useEffect para preencher o formulário quando o modal for aberto
    useEffect(() => {
        if (atendimento) {
            setFormData({
                status: atendimento.status || '',
                descricao_ocorrencia: atendimento.descricao_ocorrencia || '',
                medidas_adotadas: atendimento.medidas_adotadas || '',
                codigo_atendimento: atendimento.codigo_atendimento || '',
                numero_procedimento: atendimento.numero_procedimento || ''
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

        const apiUrl = process.env.REACT_APP_API_URL;
        const updateUrl = `${apiUrl}/api/atendimentos/${atendimento.id_caso}`;

        try {
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Erro ao atualizar atendimento.');
            }

            alert('Atendimento atualizado com sucesso!');
            onAtendimentoUpdated(); // Atualiza a lista na página principal
            onClose(); // Fecha o modal
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
                <h2>Editar Atendimento</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="numero_procedimento">Nº do Procedimento</label>
                        <input
                            type="text"
                            id="numero_procedimento"
                            name="numero_procedimento"
                            value={formData.numero_procedimento}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="codigo_atendimento">Código do Atendimento</label>
                        <input
                            type="text"
                            id="codigo_atendimento"
                            name="codigo_atendimento"
                            value={formData.codigo_atendimento}
                            onChange={handleChange}
                            disabled={loading}
                        />
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
                    <div className={styles.inputGroup}>
                        <label htmlFor="descricao_ocorrencia">Descrição da Ocorrência</label>
                        <textarea
                            id="descricao_ocorrencia"
                            name="descricao_ocorrencia"
                            rows="4"
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
                            rows="4"
                            value={formData.medidas_adotadas}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.saveButton} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditAtendimentoModal;