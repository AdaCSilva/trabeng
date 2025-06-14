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

        const statusCaso = 'Em Andamento';



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





// ROTA: GET /api/atendimentos para listar todos os atendimentos

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



// Rota para buscar um atendimento específico por ID

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


app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, login, perfil } = req.body;
    if (!nome || !login || !perfil) {
        return res.status(400).json({ message: 'Nome, login e perfil são obrigatórios.' });
    }
    try {
        const query = 'UPDATE Usuario SET nome = $1, login = $2, perfil = $3 WHERE id_usuario = $4 RETURNING *';
        const { rows } = await pool.query(query, [nome, login, perfil, id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Este login (email) já está em uso por outro usuário.' });
        }
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// Inicia o servidor

app.listen(PORT, () => {

    console.log(`Servidor backend rodando na porta ${PORT}`);

});