import React, { useState, useEffect } from 'react';
import styles from './Atendimento.module.css'; //

export default function Atendimento() {
  const [formData, setFormData] = useState({
    nomeCrianca: '',
    dataNascimento: '',
    sexo: '',
    escolaridade: '', // Pode ser o nome da escola ou o nível de escolaridade
    nomePai: '',
    nomeMae: '',
    enderecoRua: '',
    enderecoNumero: '',
    enderecoBairro: '',
    enderecoCidade: '',
    enderecoEstado: '',
    enderecoCep: '',
    telefoneResponsavel: '',
    responsavelAtendimento: '', // Nome do responsável que compareceu, pode ser Pai/Mãe ou outro
    conselheiraAtendimento: '', // Será o ID do conselheiro selecionado
    codigoAtendimento: '',
    descricaoOcorrencia: '',
    medidasAdotadas: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [conselheiros, setConselheiros] = useState([]); // Estado para armazenar a lista de conselheiros

  // Hook para buscar a lista de conselheiros ao carregar a página
  useEffect(() => {
    const fetchConselheiros = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/usuarios/conselheiros');
        if (!response.ok) {
          throw new Error('Erro ao carregar lista de conselheiros.');
        }
        const data = await response.json();
        setConselheiros(data);
      } catch (err) {
        console.error('Erro ao buscar conselheiros:', err);
        setError('Não foi possível carregar a lista de conselheiros. Tente novamente mais tarde.');
      }
    };
    fetchConselheiros();
  }, []); // O array vazio garante que o useEffect rode apenas uma vez (ao montar o componente)

  // Função para lidar com a mudança nos inputs do formulário
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setError('');
    setSuccess('');
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Validações (adicione mais validações de frontend conforme necessário) ---
    if (formData.nomeCrianca.trim().length < 3) {
      setError('Por favor, informe o nome completo da criança/adolescente (mínimo 3 caracteres).');
      return;
    }
    if (!formData.dataNascimento) {
      setError('Por favor, informe a data de nascimento.');
      return;
    }
    if (!formData.nomePai && !formData.nomeMae && !formData.responsavelAtendimento) {
        setError('Pelo menos um responsável (Pai, Mãe ou o nome do Responsável que compareceu) deve ser informado.');
        return;
    }
    if (!formData.conselheiraAtendimento) {
        setError('Por favor, selecione a conselheira que fará o atendimento.');
        return;
    }
    if (!formData.codigoAtendimento) {
        setError('Por favor, informe o código de atendimento.');
        return;
    }
    if (formData.descricaoOcorrencia.trim().length < 10) {
      setError('A descrição da ocorrência deve ter pelo menos 10 caracteres.');
      return;
    }
    // --- Fim das Validações ---

    try {
      // Faz a requisição POST para a API do backend
      const response = await fetch('${apiUrl}/api/atendimentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Se estiver usando JWT para autenticação, você precisaria adicionar:
          // 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
            // Mapeia os dados do formulário para os nomes de campos esperados no backend
            nomeCrianca: formData.nomeCrianca,
            dataNascimento: formData.dataNascimento,
            sexo: formData.sexo,
            escolaridade: formData.escolaridade,
            nomePai: formData.nomePai,
            nomeMae: formData.nomeMae,
            enderecoRua: formData.enderecoRua,
            enderecoNumero: formData.enderecoNumero,
            enderecoBairro: formData.enderecoBairro,
            enderecoCidade: formData.enderecoCidade,
            enderecoEstado: formData.enderecoEstado,
            enderecoCep: formData.enderecoCep,
            telefoneResponsavel: formData.telefoneResponsavel,
            responsavelAtendimento: formData.responsavelAtendimento,
            idConselheiraAtendimento: formData.conselheiraAtendimento,
            codigoAtendimento: formData.codigoAtendimento,
            descricaoOcorrencia: formData.descricaoOcorrencia,
            medidasAdotadas: formData.medidasAdotadas
        }),
      });

      // Verifica se a resposta da API foi bem-sucedida (status 2xx)
      if (!response.ok) {
        const errorData = await response.json(); // Tenta ler a mensagem de erro do backend
        throw new Error(errorData.message || 'Erro desconhecido ao salvar atendimento.');
      }

      const responseData = await response.json(); // Pega a resposta de sucesso do backend
      setSuccess(`Atendimento registrado com sucesso! Número de Procedimento: ${responseData.numeroProcedimento}`);
      
      // Limpa o formulário após o sucesso
      setFormData({
        nomeCrianca: '', dataNascimento: '', sexo: '', escolaridade: '',
        nomePai: '', nomeMae: '',
        enderecoRua: '', enderecoNumero: '', enderecoBairro: '',
        enderecoCidade: '', enderecoEstado: '', enderecoCep: '',
        telefoneResponsavel: '', responsavelAtendimento: '',
        conselheiraAtendimento: '', codigoAtendimento: '',
        descricaoOcorrencia: '', medidasAdotadas: ''
      });
    } catch (err) {
      setError(err.message); // Exibe o erro para o usuário
    }
  };

  return (
    <section aria-label="Registrar Atendimento" className={styles.container}>
      <h2 className={styles.title}>Registrar Atendimento</h2>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <h3>Dados da Criança/Adolescente</h3>
        <div className={styles.formGroup}>
          <label htmlFor="nomeCrianca" className={styles.label}>Nome Completo</label>
          <input
            id="nomeCrianca"
            name="nomeCrianca"
            type="text"
            value={formData.nomeCrianca}
            onChange={handleChange}
            required
            minLength={3}
            placeholder="Nome completo da criança/adolescente"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dataNascimento" className={styles.label}>Data de Nascimento</label>
          <input
            id="dataNascimento"
            name="dataNascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="sexo" className={styles.label}>Sexo</label>
          <select
            id="sexo"
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="">Selecione</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="escolaridade" className={styles.label}>Escola / Escolaridade</label>
          <input
            id="escolaridade"
            name="escolaridade"
            type="text"
            value={formData.escolaridade}
            onChange={handleChange}
            placeholder="Nome da escola ou nível de escolaridade"
            className={styles.input}
          />
        </div>

        <h3>Dados dos Responsáveis</h3>
        <div className={styles.formGroup}>
          <label htmlFor="nomePai" className={styles.label}>Nome do Pai</label>
          <input
            id="nomePai"
            name="nomePai"
            type="text"
            value={formData.nomePai}
            onChange={handleChange}
            placeholder="Nome completo do pai"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="nomeMae" className={styles.label}>Nome da Mãe</label>
          <input
            id="nomeMae"
            name="nomeMae"
            type="text"
            value={formData.nomeMae}
            onChange={handleChange}
            placeholder="Nome completo da mãe"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="responsavelAtendimento" className={styles.label}>Responsável que Compareceu ao Atendimento</label>
          <input
            id="responsavelAtendimento"
            name="responsavelAtendimento"
            type="text"
            value={formData.responsavelAtendimento}
            onChange={handleChange}
            placeholder="Nome do responsável que compareceu (se diferente dos pais)"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="telefoneResponsavel" className={styles.label}>Telefone do Responsável</label>
          <input
            id="telefoneResponsavel"
            name="telefoneResponsavel"
            type="text"
            value={formData.telefoneResponsavel}
            onChange={handleChange}
            placeholder="(XX) XXXXX-XXXX"
            className={styles.input}
          />
        </div>

        <h4>Endereço do Responsável</h4>
        <div className={styles.formGroup}>
          <label htmlFor="enderecoRua" className={styles.label}>Rua</label>
          <input
            id="enderecoRua"
            name="enderecoRua"
            type="text"
            value={formData.enderecoRua}
            onChange={handleChange}
            placeholder="Nome da Rua"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="enderecoNumero" className={styles.label}>Número</label>
          <input
            id="enderecoNumero"
            name="enderecoNumero"
            type="text"
            value={formData.enderecoNumero}
            onChange={handleChange}
            placeholder="Número"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="enderecoBairro" className={styles.label}>Bairro</label>
          <input
            id="enderecoBairro"
            name="enderecoBairro"
            type="text"
            value={formData.enderecoBairro}
            onChange={handleChange}
            placeholder="Nome do Bairro"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="enderecoCidade" className={styles.label}>Cidade</label>
          <input
            id="enderecoCidade"
            name="enderecoCidade"
            type="text"
            value={formData.enderecoCidade}
            onChange={handleChange}
            placeholder="Nome da Cidade"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="enderecoEstado" className={styles.label}>Estado (UF)</label>
          <input
            id="enderecoEstado"
            name="enderecoEstado"
            type="text"
            maxLength="2"
            value={formData.enderecoEstado}
            onChange={handleChange}
            placeholder="Ex: SP"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="enderecoCep" className={styles.label}>CEP</label>
          <input
            id="enderecoCep"
            name="enderecoCep"
            type="text"
            maxLength="9"
            value={formData.enderecoCep}
            onChange={handleChange}
            placeholder="XXXXX-XXX"
            className={styles.input}
          />
        </div>

        <h3>Detalhes do Atendimento</h3>
        <div className={styles.formGroup}>
          <label htmlFor="conselheiraAtendimento" className={styles.label}>Conselheira que Atendeu</label>
          <select
            id="conselheiraAtendimento"
            name="conselheiraAtendimento"
            value={formData.conselheiraAtendimento}
            onChange={handleChange}
            required
            className={styles.input}
          >
            <option value="">Selecione a Conselheira</option>
            {conselheiros.map(conselheiro => (
              <option key={conselheiro.id_usuario} value={conselheiro.id_usuario}>
                {conselheiro.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="codigoAtendimento" className={styles.label}>Código de Atendimento</label>
          <input
            id="codigoAtendimento"
            name="codigoAtendimento"
            type="text"
            value={formData.codigoAtendimento}
            onChange={handleChange}
            required
            placeholder="Código único do atendimento (ex: CT-001)"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="descricaoOcorrencia" className={styles.label}>Descrição da Ocorrência</label>
          <textarea
            id="descricaoOcorrencia"
            name="descricaoOcorrencia"
            value={formData.descricaoOcorrencia}
            onChange={handleChange}
            required
            minLength={10}
            placeholder="Descreva o atendimento, a situação relatada, etc."
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="medidasAdotadas" className={styles.label}>Medidas Adotadas</label>
          <textarea
            id="medidasAdotadas"
            name="medidasAdotadas"
            value={formData.medidasAdotadas}
            onChange={handleChange}
            placeholder="Informe as medidas protetivas ou ações tomadas"
            className={styles.textarea}
          />
        </div>

        {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        {success && <p className={styles.successMsg} role="alert">{success}</p>}

        <button type="submit" className={styles.submitBtn} aria-label="Salvar atendimento">
          Salvar Atendimento
        </button>
      </form>
    </section>
  );
}