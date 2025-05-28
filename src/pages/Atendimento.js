import React, { useState } from 'react';
import styles from './Atendimento.module.css';

export default function Atendimento() {
  const [formData, setFormData] = useState({ nome: '', data: '', descricao: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.nome.trim().length < 3) {
      setError('Por favor, informe um nome válido (mínimo 3 caracteres).');
      return;
    }
    if (!formData.data) {
      setError('Por favor, selecione uma data válida.');
      return;
    }
    if (formData.descricao.trim().length < 10) {
      setError('A descrição deve ter pelo menos 10 caracteres.');
      return;
    }

    // Simula envio / salvar atendimento
    setTimeout(() => {
      setSuccess('Atendimento salvo com sucesso!');
      setFormData({ nome: '', data: '', descricao: '' });
    }, 500);
  };

  return (
    <section aria-label="Registrar Atendimento" className={styles.container}>
      <h2 className={styles.title}>Registrar Atendimento</h2>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="nome" className={styles.label}>Nome da Criança/Adolescente</label>
          <input
            id="nome"
            name="nome"
            type="text"
            value={formData.nome}
            onChange={handleChange}
            required
            minLength={3}
            placeholder="Nome completo"
            className={styles.input}
            aria-describedby="nomeHelp"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="data" className={styles.label}>Data do Atendimento</label>
          <input
            id="data"
            name="data"
            type="date"
            value={formData.data}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="descricao" className={styles.label}>Descrição do Atendimento</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            required
            minLength={10}
            placeholder="Descreva o atendimento"
            className={styles.textarea}
            aria-describedby="descricaoHelp"
          />
        </div>

        {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        {success && <p className={styles.successMsg} role="alert">{success}</p>}

        <button type="submit" className={styles.submitBtn} aria-label="Salvar atendimento">
          Salvar
        </button>
      </form>
    </section>
  );
}
