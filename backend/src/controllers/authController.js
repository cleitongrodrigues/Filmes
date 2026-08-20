const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../../data/store.json');

function loadStore() {
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ users: [], favorites: [], comments: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

function saveStore(data) {
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: 86400 });
}

exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  const store = loadStore();
  const alreadyExists = store.users.some((user) => user.email.toLowerCase() === email.toLowerCase());

  if (alreadyExists) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const newUser = { id: Date.now(), nome, email, senha_hash: senhaHash };
  store.users.push(newUser);
  saveStore(store);

  const token = generateToken(newUser.id);
  return res.status(201).json({ user: { id: newUser.id, nome, email }, token });
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const store = loadStore();
  const user = store.users.find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(400).json({ error: 'Usuário não encontrado' });
  }

  const validPassword = await bcrypt.compare(senha, user.senha_hash);
  if (!validPassword) {
    return res.status(400).json({ error: 'Senha inválida' });
  }

  const { senha_hash, ...safeUser } = user;
  const token = generateToken(user.id);
  return res.json({ user: safeUser, token });
};
