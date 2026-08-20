const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: 86400 });
}

exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  try {
    const [rows] = await db.query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?)', [email]);
    if (rows && rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    const token = generateToken(result.insertId);
    return res.status(201).json({
      user: { id: result.insertId, nome, email },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER(?)', [email]);
    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    const token = generateToken(user.id);
    return res.json({
      user: { id: user.id, nome: user.nome, email: user.email },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro no login' });
  }
};
