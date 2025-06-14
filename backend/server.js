require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

(async () => {
    try {
        const client = await pool.connect();
        console.log('Backend conectado ao PostgreSQL com sucesso.');
        client.release();
    } catch (err) {
        console.error('ERRO FATAL AO CONECTAR NO BANCO DE DADOS:', err.stack);
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
        const { rows } = await pool.query('SELECT id_usuario, nome, perfil, senha FROM Usuario WHERE login = $1', [login]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        const user = rows[0];
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
        console.error('Erro no /api/login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

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
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Este login (email) já está em uso.' });
        }
        console.error('Erro no /api/register:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário.' });
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id_usuario, nome, login, perfil FROM Usuario ORDER BY nome ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro no /api/usuarios:', error);
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

// ... o restante das suas rotas de atendimento, etc ...
// (O restante do código que você já tinha permanece igual)

app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});