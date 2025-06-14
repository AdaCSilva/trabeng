require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/', (req, res) => {
    res.send('Backend do Conselho Tutelar funcionando! Acesse as rotas da API.');
});

// --- ROTAS DE USUÁRIO ---
app.post('/api/login', async (req, res) => {
    const { login, senha } = req.body;
    if (!login || !senha) return res.status(400).json({ message: 'Login e senha são obrigatórios.' });
    try {
        const [rows] = await pool.query('SELECT * FROM Usuario WHERE login = ?', [login]);
        if (rows.length === 0) return res.status(401).json({ message: 'Credenciais inválidas.' });
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(senha, user.senha);

        if (isMatch) {
            res.status(200).json({ message: 'Login bem-sucedido!', user: { id: user.id_usuario, nome: user.nome, perfil: user.perfil }});
        } else {
            res.status(401).json({ message: 'Credenciais inválidas.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.post('/api/usuarios', async (req, res) => {
    const { nome, login, senha, perfil } = req.body;
    if (!nome || !login || !senha || !perfil) return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const [result] = await pool.query('INSERT INTO Usuario (nome, login, senha, perfil) VALUES (?, ?, ?, ?)', [nome, login, hashedPassword, perfil]);
        res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Este login (email) já está em uso.' });
        res.status(500).json({ message: 'Erro ao registrar usuário.' });
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_usuario, nome, login, perfil FROM Usuario ORDER BY nome ASC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, login, perfil } = req.body;
    if (!nome || !login || !perfil) return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    try {
        const [result] = await pool.query('UPDATE Usuario SET nome = ?, login = ?, perfil = ? WHERE id_usuario = ?', [nome, login, perfil, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
        res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Este login (email) já está em uso.' });
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.delete('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Usuario WHERE id_usuario = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
        res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'Usuário não pode ser excluído pois está vinculado a atendimentos.' });
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// --- ROTAS DE ATENDIMENTO E OUTRAS ---
// (O restante das suas rotas de atendimento permanecem aqui)

app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});