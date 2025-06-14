require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// CONEXÃO VOLTOU AO MÉTODO ORIGINAL QUE FUNCIONAVA
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Adicione a configuração SSL se o seu amigo estiver usando na Render
    ssl: {
        rejectUnauthorized: false
    }
});

app.get('/', (req, res) => {
    res.send('Backend do Conselho Tutelar funcionando! Acesse as rotas da API.');
});

// --- ROTAS DE USUÁRIO ---
app.post('/api/login', async (req, res) => {
    const { login, senha } = req.body;
    if (!login || !senha) return res.status(400).json({ message: 'Login e senha são obrigatórios.' });
    try {
        const { rows } = await pool.query('SELECT * FROM Usuario WHERE login = $1', [login]);
        if (rows.length === 0) return res.status(401).json({ message: 'Credenciais inválidas.' });
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(senha, user.senha);

        if (isMatch) {
            res.status(200).json({ message: 'Login bem-sucedido!', user: { id: user.id_usuario, nome: user.nome, perfil: user.perfil }});
        } else {
            res.status(401).json({ message: 'Credenciais inválidas.' });
        }
    } catch (error) {
        console.error('Erro em /api/login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.post('/api/usuarios', async (req, res) => {
    const { nome, login, senha, perfil } = req.body;
    if (!nome || !login || !senha || !perfil) return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const query = 'INSERT INTO Usuario (nome, login, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING *';
        const { rows } = await pool.query(query, [nome, login, hashedPassword, perfil]);
        res.status(201).json({ message: 'Usuário registrado com sucesso!', user: rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ message: 'Este login (email) já está em uso.' });
        console.error('Erro em /api/usuarios (POST):', error);
        res.status(500).json({ message: 'Erro ao registrar usuário.' });
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id_usuario, nome, login, perfil FROM Usuario ORDER BY nome ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro em /api/usuarios (GET):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar usuários.' });
    }
});

app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, login, perfil } = req.body;
    if (!nome || !login || !perfil) return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    try {
        const query = 'UPDATE Usuario SET nome = $1, login = $2, perfil = $3 WHERE id_usuario = $4 RETURNING *';
        const { rows } = await pool.query(query, [nome, login, perfil, id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
        res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ message: 'Este login (email) já está em uso.' });
        console.error('Erro em /api/usuarios/:id (PUT):', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.delete('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query('DELETE FROM Usuario WHERE id_usuario = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
        res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
        if (error.code === '23503') return res.status(409).json({ message: 'Usuário não pode ser excluído pois está vinculado a atendimentos.' });
        console.error('Erro em /api/usuarios/:id (DELETE):', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.get('/api/atendimentos', async (req, res) => {
    try {
        const query = `
            SELECT
                ca.id_caso,
                ca.numero_procedimento,
                c.nome AS nomeCrianca,
                ca.data_abertura,
                u.nome AS nomeConselheira,
                ca.status
            FROM Caso ca
            INNER JOIN Crianca c ON ca.id_crianca = c.id_crianca
            LEFT JOIN Usuario u ON ca.id_conselheira_atendimento = u.id_usuario
            ORDER BY ca.id_caso DESC`;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro em /api/atendimentos (GET):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar atendimentos.' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});