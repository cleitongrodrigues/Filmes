const db = require('../config/database');

exports.addComment = async (req, res) => {
  const { tmdb_movie_id, texto } = req.body;
  const usuario_id = req.user.id;

  if (!tmdb_movie_id || !texto || !texto.trim()) {
    return res.status(400).json({ error: 'Comentário inválido' });
  }

  try {
    const result = await db.query(
      'INSERT INTO comentarios (usuario_id, tmdb_movie_id, texto) VALUES (?, ?, ?)',
      [usuario_id, Number(tmdb_movie_id), texto.trim()]
    );

    return res.status(201).json({
      id: result.insertId,
      usuario_id,
      tmdb_movie_id: Number(tmdb_movie_id),
      texto: texto.trim()
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
};

exports.listComments = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM comentarios WHERE usuario_id = ? ORDER BY criado_em DESC',
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar comentários' });
  }
};

exports.removeComment = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM comentarios WHERE id = ? AND usuario_id = ?',
      [Number(id), req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao remover comentário' });
  }
};
