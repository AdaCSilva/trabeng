require('dotenv').config();

const express = require('express');
const { Pool } = require('pg'); // Importa o Pool do pg
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cors());

// Conexão com o banco de dados PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Testa a conexão do pool
(async () => {
    try {
        const client = await pool.connect();
        console.log('Conectado ao banco de dados PostgreSQL com o ID:', client.threadId);
        client.release(); // Libera o cliente
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        process.exit(1); // Encerra o processo se não conseguir conectar ao BD
    }
})();

// --- Rotas da API ---

// Rota de Teste Simples
app.get('/', (req, res) => {
    res.send('Backend do Conselho Tutelar funcionando! Acesse as rotas da API.');
});

// Rota para Lidar com Login
app.post('/api/login', async (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.status(400).json({ message: 'Login e senha são obrigatórios.' });
    }

    try {
        // CUIDADO: Em uma aplicação real, você SEMPRE usaria hashing (ex: bcrypt) para senhas.
        // A senha no banco de dados deve ser o hash, e aqui você compararia o hash gerado da senha
        // fornecida pelo usuário com o hash armazenado no banco.
        const { rows } = await pool.query('SELECT id_usuario, nome, perfil, senha FROM Usuario WHERE login = $1', [login]); // $1 para placeholders no PostgreSQL

        if (rows.length > 0) {
            const user = rows[0];
            // Comparação de senha em texto simples (APENAS PARA EXEMPLO E TESTE INICIAL, NÃO USE EM PRODUÇÃO)
            if (user.senha === senha) { // *** MUDAR PARA COMPARAÇÃO DE HASH REAL (ex: bcrypt.compare(senha, user.senha)) ***
                res.status(200).json({
                    message: 'Login bem-sucedido!',
                    user: { id: user.id_usuario, nome: user.nome, perfil: user.perfil }
                });
            } else {
                res.status(401).json({ message: 'Credenciais inválidas.' });
            }
        } else {
            res.status(401).json({ message: 'Credenciais inválidas.' });
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para Registrar Atendimento (POST /api/atendimentos)
app.post('/api/atendimentos', async (req, res) => {
    const {
        nomeCrianca, dataNascimento, sexo, escolaridade,
        nomePai, nomeMae,
        enderecoRua, enderecoNumero, enderecoBairro,
        enderecoCidade, enderecoEstado, enderecoCep,
        telefoneResponsavel,
        descricaoOcorrencia, medidasAdotadas,
        idConselheiraAtendimento, codigoAtendimento,
        responsavelAtendimento
    } = req.body;

    const client = await pool.connect(); // Obtém um cliente do pool
    try {
        await client.query('BEGIN'); // Inicia uma transação

        // 1. Inserir Endereço (para o Responsável, ou a criança se aplicável)
        let idEndereco = null;
        if (enderecoRua && enderecoCidade && enderecoEstado) {
            const result = await client.query(
                'INSERT INTO Endereco (rua, numero, bairro, cidade, estado, cep) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_endereco', // RETURNING para PostgreSQL
                [enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoEstado, enderecoCep]
            );
            idEndereco = result.rows[0].id_endereco;
        }

        // 2. Inserir Criança
        const resultCrianca = await client.query(
            'INSERT INTO Crianca (nome, data_nascimento, sexo, escolaridade) VALUES ($1, $2, $3, $4) RETURNING id_crianca',
            [nomeCrianca, dataNascimento, sexo, escolaridade]
        );
        const idCrianca = resultCrianca.rows[0].id_crianca;

        // 3. Inserir Caso (Atendimento)
        const dataAbertura = new Date().toISOString().slice(0, 10);
        const dataHoraRegistro = new Date();
        const statusCaso = 'Em Andamento';

        const resultCaso = await client.query(
            'INSERT INTO Caso (data_abertura, status, descricao_ocorrencia, medidas_adotadas, id_crianca, data_hora_registro, codigo_atendimento, id_conselheira_atendimento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_caso',
            [dataAbertura, statusCaso, descricaoOcorrencia, medidasAdotadas, idCrianca, dataHoraRegistro, codigoAtendimento, idConselheiraAtendimento]
        );
        const idCaso = resultCaso.rows[0].id_caso;

        // Gerar numero_procedimento após obter o idCaso
        const anoAtual = new Date().getFullYear().toString().slice(-2);
        const numeroProcedimentoFormatado = `<span class="math-inline">\{String\(idCaso\)\.padStart\(4, '0'\)\}/</span>{anoAtual}`;

        // Atualizar o Caso com o numero_procedimento
        await client.query(
            'UPDATE Caso SET numero_procedimento = $1 WHERE id_caso = $2',
            [numeroProcedimentoFormatado, idCaso]
        );

        // 4. Inserir Responsáveis
        if (nomePai) {
            await client.query(
                'INSERT INTO Responsavel (nome, grau_parentesco, telefone, id_endereco, id_caso) VALUES ($1, $2, $3, $4, $5)',
                [nomePai, 'Pai', telefoneResponsavel, idEndereco, idCaso]
            );
        }
        if (nomeMae) {
            await client.query(
                'INSERT INTO Responsavel (nome, grau_parentesco, telefone, id_endereco, id_caso) VALUES ($1, $2, $3, $4, $5)',
                [nomeMae, 'Mãe', telefoneResponsavel, idEndereco, idCaso]
            );
        }

        await client.query('COMMIT'); // Confirma a transação
        res.status(201).json({ message: 'Atendimento registrado com sucesso!', idCaso: idCaso, numeroProcedimento: numeroProcedimentoFormatado });

    } catch (error) {
        await client.query('ROLLBACK'); // Reverte a transação em caso de erro
        console.error('Erro ao registrar atendimento:', error);
        res.status(500).json({ message: 'Erro ao registrar atendimento: ' + error.message });
    } finally {
        client.release(); // Libera o cliente de volta para o pool
    }
});

// --- ROTA: GET /api/atendimentos para listar todos os atendimentos ---
app.get('/api/atendimentos', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT
                ca.id_caso, ca.data_abertura, ca.status, ca.numero_procedimento,
                c.nome AS nomeCrianca,
                u.nome AS nomeConselheira
            FROM Caso ca
            JOIN Crianca c ON ca.id_crianca = c.id_crianca
            LEFT JOIN Usuario u ON ca.id_conselheira_atendimento = u.id_usuario
            ORDER BY ca.data_abertura DESC`
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao listar atendimentos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar atendimentos.' });
    }
});

app.get('/api/atendimentos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT
                ca.id_caso, ca.data_abertura, ca.status, ca.descricao_ocorrencia, ca.medidas_adotadas,
                ca.codigo_atendimento, ca.numero_procedimento, ca.data_hora_registro,
                c.nome AS nomeCrianca, c.data_nascimento, c.sexo, c.escolaridade,
                u.nome AS nomeConselheira,
                ARRAY_AGG(DISTINCT CONCAT(r.nome, ' (', r.grau_parentesco, ')')) AS nomesResponsaveis,
                ARRAY_AGG(DISTINCT CONCAT(r.telefone)) AS telefonesResponsaveis,
                ARRAY_AGG(DISTINCT CONCAT(e.rua, ', ', e.numero, ', ', e.bairro, ', ', e.cidade, '-', e.estado, ' ', e.cep)) AS enderecosResponsaveis
            FROM Caso ca
            JOIN Crianca c ON ca.id_crianca = c.id_crianca
            LEFT JOIN Responsavel r ON ca.id_caso = r.id_caso
            LEFT JOIN Endereco e ON r.id_endereco = e.id_endereco
            LEFT JOIN Usuario u ON ca.id_conselheira_atendimento = u.id_usuario
            WHERE ca.id_caso = $1
            GROUP BY ca.id_caso, c.nome, c.data_nascimento, c.sexo, c.escolaridade, u.nome`, // Adicionado todas as colunas não agregadas
            [id]
        );

        if (rows.length > 0) {
            const atendimento = rows[0];
            res.status(200).json(atendimento);
        } else {
            res.status(404).json({ message: 'Atendimento não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao consultar atendimento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.get('/api/usuarios/conselheiros', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT id_usuario, nome FROM Usuario WHERE perfil = 'Conselheiro'");
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar conselheiros:', error);
        res.status(500).json({ message: 'Erro ao buscar conselheiros.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});
