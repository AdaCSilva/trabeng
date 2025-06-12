import React, { useState } from 'react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p>{message || 'Tem certeza que deseja continuar?'}</p>
        <div className={styles.buttons}>
          <button onClick={onConfirm} className={styles.confirmButton}>Confirmar</button>
          <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;