import React, { useState, useEffect } from 'react'; // 1. Adicionado useState e useEffect
import styles from './Home.module.css';

export default function Home() {
  // 2. Lógica para buscar e armazenar os dados da API
  const [stats, setStats] = useState({
    casosAtendidos: 0,
    casosPendentes: 0,
    usuariosAtivos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Garanta que você tem o arquivo .env com a URL da API
      const apiUrl = process.env.REACT_APP_API_URL; 
      try {
        const response = await fetch(`${apiUrl}/api/stats`);
        if (!response.ok) {
          throw new Error('Falha ao carregar estatísticas.');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // O array vazio faz com que a busca ocorra apenas uma vez

  // Seu layout original é mantido abaixo, apenas os números são trocados
  return (
    <section aria-label="Painel inicial" className={styles.container}>
      <h2 className={styles.title}>Bem-vindo ao Painel</h2>
      <p>Este é o sistema do Conselho Tutelar. Utilize o menu para navegar pelas funcionalidades.</p>
      
      {/* Exibe uma mensagem de erro se a busca na API falhar */}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <div className={styles.cardsGrid} role="region" aria-label="Resumo estatístico">
        <div tabIndex="0" className={styles.card} aria-label="Casos atendidos">
          Casos Atendidos
          {/* 3. Número agora é dinâmico */}
          <strong>{loading ? '...' : stats.casosAtendidos}</strong>
        </div>
        <div tabIndex="0" className={styles.card} aria-label="Casos pendentes">
          Casos Pendentes
          {/* 4. Número agora é dinâmico */}
          <strong>{loading ? '...' : stats.casosPendentes}</strong>
        </div>
        <div tabIndex="0" className={styles.card} aria-label="Usuários ativos">
          Usuários Ativos
          {/* 5. Número agora é dinâmico */}
          <strong>{loading ? '...' : stats.usuariosAtivos}</strong>
        </div>
      </div>
    </section>
  );
}