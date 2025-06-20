require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt'); // <-- IMPORTADO O BCRYPT

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
        console.log('Conectado ao banco de dados PostgreSQL com o Process ID:', client.processID);
        client.release();
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        process.exit(1);
    }
})();

// --- Rotas da API ---

// Rota de Teste Simples
app.get('/', (req, res) => {
    res.send('Backend do Conselho Tutelar funcionando! Acesse as rotas da API.');
});

// Rota para Lidar com Login (ATUALIZADA COM BCRYPT)
app.post('/api/login', async (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.status(400).json({ message: 'Login e senha são obrigatórios.' });
    }

    try {
        const { rows } = await pool.query('SELECT id_usuario, nome, perfil, senha FROM Usuario WHERE login = $1', [login]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = rows[0];

        // Compara a senha enviada com o hash salvo no banco
        const isMatch = await bcrypt.compare(senha, user.senha);

        if (isMatch) {
            res.status(200).json({
                message: 'Login bem-sucedido!',
                user: { id: user.id_usuario, nome: user.nome, perfil: user.perfil }
            });
        } else {
            res.status(401).json({ message: 'Credenciais inválidas.' });
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para Registrar Usuário (ADICIONADA E COM BCRYPT)
app.post('/api/register', async (req, res) => {
    const { nome, login, senha, perfil } = req.body;

    if (!nome || !login || !senha || !perfil) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

        const query = 'INSERT INTO Usuario (nome, login, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id_usuario';
        const { rows } = await pool.query(query, [nome, login, hashedPassword, perfil]);

        res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!', userId: rows[0].id_usuario });
    } catch (error) {
        if (error.code === '23505') { // Erro de login duplicado
            return res.status(409).json({ message: 'Este login (email) já está em uso.' });
        }
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário.' });
    }
});


// Rota para Registrar Atendimento (sem alterações)
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

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let idEndereco = null;
        if (enderecoRua && enderecoCidade && enderecoEstado) {
            const result = await client.query(
                'INSERT INTO Endereco (rua, numero, bairro, cidade, estado, cep) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_endereco',
                [enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoEstado, enderecoCep]
            );
            idEndereco = result.rows[0].id_endereco;
        }

        const resultCrianca = await client.query(
            'INSERT INTO Crianca (nome, data_nascimento, sexo, escolaridade) VALUES ($1, $2, $3, $4) RETURNING id_crianca',
            [nomeCrianca, dataNascimento, sexo, escolaridade]
        );
        const idCrianca = resultCrianca.rows[0].id_crianca;

        const dataAbertura = new Date().toISOString().slice(0, 10);
        const dataHoraRegistro = new Date();
        const statusCaso = 'Em andamento'; // Mantido o novo padrão "Em andamento"

        const resultCaso = await client.query(
            'INSERT INTO Caso (data_abertura, status, descricao_ocorrencia, medidas_adotadas, id_crianca, data_hora_registro, codigo_atendimento, id_conselheira_atendimento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_caso',
            [dataAbertura, statusCaso, descricaoOcorrencia, medidasAdotadas, idCrianca, dataHoraRegistro, codigoAtendimento, idConselheiraAtendimento]
        );
        const idCaso = resultCaso.rows[0].id_caso;

        const anoAtual = new Date().getFullYear().toString().slice(-2);
        const numeroProcedimentoFormatado = `${String(idCaso).padStart(4, '0')}/${anoAtual}`;

        await client.query(
            'UPDATE Caso SET numero_procedimento = $1 WHERE id_caso = $2',
            [numeroProcedimentoFormatado, idCaso]
        );

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

        await client.query('COMMIT');
        res.status(201).json({ message: 'Atendimento registrado com sucesso!', idCaso: idCaso, numeroProcedimento: numeroProcedimentoFormatado });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao registrar atendimento:', error);
        res.status(500).json({ message: 'Erro ao registrar atendimento: ' + error.message });
    } finally {
        client.release();
    }
});


// ROTA: GET /api/atendimentos (MODIFICADA PARA ACEITAR FILTRO POR STATUS)
app.get('/api/atendimentos', async (req, res) => {
    const { status } = req.query; 

    try {
        // A 'query' SQL foi atualizada para incluir o campo que faltava
        let query = `
            SELECT
                ca.id_caso, 
                ca.data_abertura, 
                ca.status, 
                ca.numero_procedimento, 
                ca.descricao_ocorrencia, 
                ca.medidas_adotadas, -- <<< ESTE CAMPO FOI ADICIONADO AQUI
                ca.id_conselheira_atendimento,
                c.nome AS nomeCrianca,
                u.nome AS nomeConselheira
            FROM Caso ca
            JOIN Crianca c ON ca.id_crianca = c.id_crianca
            LEFT JOIN Usuario u ON ca.id_conselheira_atendimento = u.id_usuario
        `;
        const values = [];

        if (status) {
            query += ' WHERE LOWER(ca.status) = LOWER($1)';
            values.push(status);
        }

        query += ' ORDER BY ca.data_abertura DESC';

        const { rows } = await pool.query(query, values);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao listar atendimentos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar atendimentos.' });
    }
});

// >>> NOVA ROTA PARA FINALIZAR ATENDIMENTO <<<
app.put('/api/atendimentos/:id/finalizar', async (req, res) => {
    const { id } = req.params;
    const data_finalizacao = new Date();
    const status = 'Finalizado';

    try {
        const query = 'UPDATE Caso SET status = $1, data_finalizacao = $2 WHERE id_caso = $3 RETURNING *';
        const values = [status, data_finalizacao, id];

        const { rows } = await pool.query(query, values);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Atendimento não encontrado' });
        }
        
        // Retorna o atendimento atualizado
        res.status(200).json(rows[0]);

    } catch (error) {
        console.error(`Erro ao finalizar atendimento ${id}:`, error);
        res.status(500).json({ message: 'Erro interno do servidor ao finalizar atendimento.' });
    }
});


// Rota para buscar um atendimento específico por ID
app.get('/api/atendimentos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT
                ca.id_caso, ca.data_abertura, ca.status, ca.descricao_ocorrencia, ca.medidas_adotadas,
                ca.codigo_atendimento, ca.numero_procedimento, ca.data_hora_registro,
                ca.id_conselheira_atendimento, -- <<< ESTE CAMPO FOI ADICIONADO AQUI
                c.nome AS nomeCrianca, c.data_nascimento, c.sexo, c.escolaridade,
                u.nome AS nomeConselheira,
                ARRAY_AGG(DISTINCT CONCAT(r.nome, ' (', r.grau_parentesco, ')')) AS nomesResponsaveis,
                ARRAY_AGG(DISTINCT r.telefone) AS telefonesResponsaveis,
                ARRAY_AGG(DISTINCT CONCAT(e.rua, ', ', e.numero, ', ', e.bairro, ', ', e.cidade, '-', e.estado, ' ', e.cep)) AS enderecosResponsaveis
            FROM Caso ca
            JOIN Crianca c ON ca.id_crianca = c.id_crianca
            LEFT JOIN Responsavel r ON ca.id_caso = r.id_caso
            LEFT JOIN Endereco e ON r.id_endereco = e.id_endereco
            LEFT JOIN Usuario u ON ca.id_conselheira_atendimento = u.id_usuario
            WHERE ca.id_caso = $1
            GROUP BY 
                ca.id_caso, 
                c.id_crianca, 
                u.id_usuario`,
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

// >>> ROTA PARA EDITAR UM ATENDIMENTO (PUT) <<<
app.put('/api/atendimentos/:id', async (req, res) => {
    const { id } = req.params;
    // Pegando os campos que podem ser editados do corpo da requisição
    const { descricao_ocorrencia, medidas_adotadas, status, id_conselheira_atendimento } = req.body;

    // Validação básica
    if (!descricao_ocorrencia || !medidas_adotadas || !status) {
        return res.status(400).json({ message: 'Descrição, medidas adotadas e status são campos obrigatórios.' });
    }

    try {
        const query = `
            UPDATE Caso 
            SET 
                descricao_ocorrencia = $1, 
                medidas_adotadas = $2, 
                status = $3, 
                id_conselheira_atendimento = $4
            WHERE id_caso = $5
            RETURNING *; 
        `;
        
        const values = [descricao_ocorrencia, medidas_adotadas, status, id_conselheira_atendimento, id];
        
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Atendimento não encontrado para edição.' });
        }

        console.log('Atendimento atualizado com sucesso:', rows[0]);
        res.status(200).json({ 
            message: 'Atendimento atualizado com sucesso!', 
            atendimento: rows[0] 
        });

    } catch (error) {
        console.error(`Erro CRÍTICO ao atualizar o atendimento ${id}:`, error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar o atendimento.' });
    }
});

// Rota para buscar todos os usuários com perfil de conselheiro
app.get('/api/usuarios/conselheiros', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT id_usuario, nome FROM Usuario WHERE perfil = 'Conselheiro'");
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar conselheiros:', error);
        res.status(500).json({ message: 'Erro ao buscar conselheiros.' });
    }
});

// Rota para buscar estatísticas do dashboard
app.get('/api/stats', async (req, res) => {
    try {
        const [casosPendentesResult, casosAtendidosResult, usuariosAtivosResult] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM Caso WHERE status = 'Em Andamento'"),
            pool.query("SELECT COUNT(*) FROM Caso WHERE status <> 'Em Andamento'"),
            pool.query('SELECT COUNT(*) FROM Usuario')
        ]);
        const stats = {
            casosPendentes: parseInt(casosPendentesResult.rows[0].count, 10),
            casosAtendidos: parseInt(casosAtendidosResult.rows[0].count, 10),
            usuariosAtivos: parseInt(usuariosAtivosResult.rows[0].count, 10)
        };
        res.status(200).json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar estatísticas.' });
    }
});

// Rota para buscar todos os usuários
app.get('/api/usuarios', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id_usuario, nome, login, perfil FROM Usuario ORDER BY nome ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar usuários.' });
    }
});

// ROTA DE EDIÇÃO (PUT) COM DIAGNÓSTICO
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, login, perfil } = req.body;

    console.log(`--- ROTA PUT /api/usuarios/${id} ACIONADA ---`);
    console.log('Dados recebidos no corpo (body):', req.body);

    if (!nome || !login || !perfil) {
        console.error('Erro de validação: Campos obrigatórios faltando.');
        return res.status(400).json({ message: 'Nome, login e perfil são obrigatórios.' });
    }

    try {
        const query = 'UPDATE Usuario SET nome = $1, login = $2, perfil = $3 WHERE id_usuario = $4 RETURNING id_usuario, nome, login, perfil';
        const { rows } = await pool.query(query, [nome, login, perfil, id]);

        if (rows.length === 0) {
            console.error(`Tentativa de editar usuário com ID ${id}, mas ele não foi encontrado.`);
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        console.log('Usuário atualizado com sucesso no banco:', rows[0]);
        res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            console.error('Erro de login duplicado ao editar:', error);
            return res.status(409).json({ message: 'Este login (email) já está em uso por outro usuário.' });
        }
        console.error('Erro CRÍTICO ao atualizar usuário no banco:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar usuário.' });
    }
});

// ROTA DE EXCLUSÃO (DELETE)
app.delete('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`--- ROTA DELETE /api/usuarios/${id} ACIONADA ---`);
    try {
        const { rowCount } = await pool.query('DELETE FROM Usuario WHERE id_usuario = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado para deletar.' });
        }
        res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
        console.error('Erro CRÍTICO ao deletar usuário:', error);
        if (error.code === '23503') {
            return res.status(409).json({ message: 'Não é possível excluir este usuário, pois ele está vinculado a um ou mais atendimentos.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao deletar usuário.' });
    }
});



// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});