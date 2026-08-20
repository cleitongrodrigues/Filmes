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

exports.addComment = async (req, res) => {
  const { tmdb_movie_id, texto } = req.body;
  const usuario_id = req.user.id;

  if (!tmdb_movie_id || !texto || !texto.trim()) {
    return res.status(400).json({ error: 'Comentário inválido' });
  }

  const store = loadStore();
  const comment = {
    id: Date.now(),
    usuario_id,
    tmdb_movie_id: Number(tmdb_movie_id),
    texto: texto.trim(),
    criado_em: new Date().toISOString()
  };

  store.comments.push(comment);
  saveStore(store);
  return res.status(201).json(comment);
};

exports.listComments = async (req, res) => {
  const store = loadStore();
  const comments = store.comments.filter((comment) => comment.usuario_id === req.user.id);
  return res.json(comments);
};

exports.removeComment = async (req, res) => {
  const { id } = req.params;
  const store = loadStore();
  const initialLength = store.comments.length;

  store.comments = store.comments.filter(
    (comment) => !(comment.id === Number(id) && comment.usuario_id === req.user.id)
  );

  if (store.comments.length === initialLength) {
    return res.status(404).json({ error: 'Comentário não encontrado' });
  }

  saveStore(store);
  return res.json({ success: true });
};
