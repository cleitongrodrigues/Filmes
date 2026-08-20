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

exports.addFavorite = async (req, res) => {
  const { tmdb_movie_id, titulo, poster_path } = req.body;
  const usuario_id = req.user.id;

  if (!tmdb_movie_id || !titulo) {
    return res.status(400).json({ error: 'Dados do filme inválidos' });
  }

  const store = loadStore();
  const exists = store.favorites.some(
    (favorite) => favorite.usuario_id === usuario_id && favorite.tmdb_movie_id === Number(tmdb_movie_id)
  );

  if (exists) {
    return res.status(400).json({ error: 'Filme já favoritado' });
  }

  const favorite = {
    id: Date.now(),
    usuario_id,
    tmdb_movie_id: Number(tmdb_movie_id),
    titulo,
    poster_path: poster_path || '',
    criado_em: new Date().toISOString()
  };

  store.favorites.push(favorite);
  saveStore(store);

  return res.status(201).json(favorite);
};

exports.listFavorites = async (req, res) => {
  const store = loadStore();
  const favorites = store.favorites.filter((favorite) => favorite.usuario_id === req.user.id);
  return res.json(favorites);
};

exports.removeFavorite = async (req, res) => {
  const { id } = req.params;
  const store = loadStore();
  const initialLength = store.favorites.length;

  store.favorites = store.favorites.filter(
    (favorite) => !(favorite.id === Number(id) && favorite.usuario_id === req.user.id)
  );

  if (store.favorites.length === initialLength) {
    return res.status(404).json({ error: 'Favorito não encontrado' });
  }

  saveStore(store);
  return res.json({ success: true });
};
