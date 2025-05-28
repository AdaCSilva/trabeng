import React, { useState } from 'react';
import styles from './Upload.module.css';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Por favor, selecione um arquivo para enviar.');
      return;
    }

    // Simula upload
    setTimeout(() => {
      setSuccess('Arquivo enviado com sucesso!');
      setFile(null);
      e.target.reset();
    }, 1000);
  };

  return (
    <section aria-label="Upload de Arquivos" className={styles.container}>
      <h2 className={styles.title}>Upload de Arquivos</h2>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <label htmlFor="fileInput" className={styles.label}>
          Selecione um arquivo para enviar
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={handleChange}
          aria-describedby="fileHelp"
          className={styles.fileInput}
        />
        <small id="fileHelp" className={styles.fileHelp}>
          Tipos permitidos: PDF, DOC, DOCX, JPG, PNG
        </small>

        {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        {success && <p className={styles.successMsg} role="alert">{success}</p>}

        <button type="submit" className={styles.submitBtn} aria-label="Enviar arquivo">
          Enviar
        </button>
      </form>
    </section>
  );
}
