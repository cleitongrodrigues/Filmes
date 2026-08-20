const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

async function fetchTmdb(path) {
  const url = `${TMDB_BASE_URL}${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

exports.searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    const endpoint = q ? `/search/movie?query=${encodeURIComponent(q)}&include_adult=false&language=pt-BR&page=1` : '/movie/popular?language=pt-BR&page=1';
    const data = await fetchTmdb(endpoint);

    const movies = (data.results || []).map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids || []
    }));

    res.json(movies);
  } catch (error) {
    console.error('Erro ao consultar TMDB:', error.message);
    res.status(500).json({ error: 'Erro ao listar filmes' });
  }
};

exports.getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchTmdb(`/movie/${id}?language=pt-BR`);

    return res.json({
      id: data.id,
      title: data.title,
      overview: data.overview,
      poster_path: data.poster_path,
      release_date: data.release_date,
      vote_average: data.vote_average,
      genre_ids: data.genres ? data.genres.map((g) => g.id) : []
    });
  } catch (error) {
    console.error('Erro ao consultar detalhes do TMDB:', error.message);
    return res.status(404).json({ error: 'Filme não encontrado' });
  }
};
