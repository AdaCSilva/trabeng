import React from 'react';
import styles from './Home.module.css';

export default function Home() {
  return (
    <section aria-label="Painel inicial" className={styles.container}>
      <h2 className={styles.title}>Bem-vindo ao Painel</h2>
      <p>Este é o sistema do Conselho Tutelar. Utilize o menu para navegar pelas funcionalidades.</p>

      <div className={styles.cardsGrid} role="region" aria-label="Resumo estatístico">
        <div tabIndex="0" className={styles.card} aria-label="Casos atendidos">
          Casos Atendidos
          <strong>124</strong>
        </div>
        <div tabIndex="0" className={styles.card} aria-label="Casos pendentes">
          Casos Pendentes
          <strong>15</strong>
        </div>
        <div tabIndex="0" className={styles.card} aria-label="Usuários ativos">
          Usuários Ativos
          <strong>7</strong>
        </div>
      </div>
    </section>
  );
}
