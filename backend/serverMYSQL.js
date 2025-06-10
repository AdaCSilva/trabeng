require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado ao banco de dados MySQL com o ID:', connection.threadId);
        connection.release();
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        process.exit(1);
    }
})();

app.get('/', (req, res) => {
    res.send('Backend do Conselho Tutelar funcionando! Acesse as rotas da API.');
});

app.post('/api/login', async (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.status(400).json({ message: 'Login e senha são obrigatórios.' });
    }

    try {
        const [rows] = await pool.query('SELECT id_usuario, nome, perfil, senha FROM Usuario WHERE login = ?', [login]);

        if (rows.length > 0) {
            const user = rows[0];
            if (user.senha === senha) {
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

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let idEndereco = null;
        if (enderecoRua && enderecoCidade && enderecoEstado) {
            const [resultEndereco] = await connection.query(
                'INSERT INTO Endereco (rua, numero, bairro, cidade, estado, cep) VALUES (?, ?, ?, ?, ?, ?)',
                [enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoEstado, enderecoCep]
            );
            idEndereco = resultEndereco.insertId;
        }

        const [resultCrianca] = await connection.query(
            'INSERT INTO Crianca (nome, data_nascimento, sexo, escolaridade) VALUES (?, ?, ?, ?)',
            [nomeCrianca, dataNascimento, sexo, escolaridade]
        );
        const idCrianca = resultCrianca.insertId;

        const dataAbertura = new Date().toISOString().slice(0, 10);
        const dataHoraRegistro = new Date();
        const statusCaso = 'Em Andamento';

        const [resultCaso] = await connection.query(
            'INSERT INTO Caso (data_abertura, status, descricao_ocorrencia, medidas_adotadas, id_crianca, data_hora_registro, codigo_atendimento, id_conselheira_atendimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [dataAbertura, statusCaso, descricaoOcorrencia, medidasAdotadas, idCrianca, dataHoraRegistro, codigoAtendimento, idConselheiraAtendimento]
        );
        const idCaso = resultCaso.insertId;

        const anoAtual = new Date().getFullYear().toString().slice(-2);
        const numeroProcedimentoFormatado = `${String(idCaso).padStart(4, '0')}/${anoAtual}`;

        await connection.query(
            'UPDATE Caso SET numero_procedimento = ? WHERE id_caso = ?',
            [numeroProcedimentoFormatado, idCaso]
        );

        if (nomePai) {
            await connection.query(
                'INSERT INTO Responsavel (nome, grau_parentesco, telefone, id_endereco, id_caso) VALUES (?, ?, ?, ?, ?)',
                [nomePai, 'Pai', telefoneResponsavel, idEndereco, idCaso]
            );
        }
        if (nomeMae) {
            await connection.query(
                'INSERT INTO Responsavel (nome, grau_parentesco, telefone, id_endereco, id_caso) VALUES (?, ?, ?, ?, ?)',
                [nomeMae, 'Mãe', telefoneResponsavel, idEndereco, idCaso]
            );
        }

        await connection.commit();
        connection.release();

        res.status(201).json({ message: 'Atendimento registrado com sucesso!', idCaso: idCaso, numeroProcedimento: numeroProcedimentoFormatado });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Erro ao registrar atendimento:', error);
        res.status(500).json({ message: 'Erro ao registrar atendimento: ' + error.message });
    }
});

// --- NOVA ROTA: GET /api/atendimentos para listar todos os atendimentos ---
app.get('/api/atendimentos', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                ca.id_caso, ca.data_abertura, ca.status, ca.numero_procedimento,
                c.nome AS nomeCrianca,
                u.nome AS nomeConselheira
            FROM Caso ca
            JOIN Crianca c ON ca.id_crianca = c.id_crianca
            LEFT JOIN Usuario u ON ca.id_conselheira_atendimento = u.id_usuario
            ORDER BY ca.data_abertura DESC` // Ordena pelos mais recentes
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
        const [rows] = await pool.query(
            `SELECT
                ca.id_caso, ca.data_abertura, ca.status, ca.descricao_ocorrencia, ca.medidas_adotadas,
                ca.codigo_atendimento, ca.numero_procedimento, ca.data_hora_registro,
                c.nome AS nomeCrianca, c.data_nascimento, c.sexo, c.escolaridade,
                u.nome AS nomeConselheira,
                GROUP_CONCAT(DISTINCT CONCAT(r.nome, ' (', r.grau_parentesco, ')') SEPARATOR '; ') AS nomesResponsaveis,
                GROUP_CONCAT(DISTINCT CONCAT(r.telefone) SEPARATOR '; ') AS telefonesResponsaveis,
                GROUP_CONCAT(DISTINCT CONCAT(e.rua, ', ', e.numero, ', ', e.bairro, ', ', e.cidade, '-', e.estado, ' ', e.cep) SEPARATOR '; ') AS enderecosResponsaveis
            FROM Caso ca
            JOIN Crianca c ON ca.id_crianca = c.id_crianca
            LEFT JOIN Responsavel r ON ca.id_caso = r.id_caso
            LEFT JOIN Endereco e ON r.id_endereco = e.id_endereco
            LEFT JOIN Usuario u ON ca.id_conselheira_atendimento = u.id_usuario
            WHERE ca.id_caso = ?
            GROUP BY ca.id_caso`,
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
        const [rows] = await pool.query("SELECT id_usuario, nome FROM Usuario WHERE perfil = 'Conselheiro'");
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar conselheiros:', error);
        res.status(500).json({ message: 'Erro ao buscar conselheiros.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});