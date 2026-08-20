import React, { useState, useEffect } from 'react';

const Catalog = ({ user, onLogout, token }) => {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [commentInputs, setCommentInputs] = useState({});
  const [search, setSearch] = useState('');

  const API_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchMovies();
    fetchFavorites();
    fetchComments();
  }, []);

  const fetchMovies = async (query = '') => {
    try {
      const res = await fetch(`${API_URL}/movies${query ? `?q=${encodeURIComponent(query)}` : ''}`, { headers });
      const data = await res.json();
      setMovies(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_URL}/favorites`, { headers });
      const data = await res.json();
      setFavorites(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/comments`, { headers });
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = async (movie) => {
    const isFav = favorites.find((favorite) => favorite.tmdb_movie_id === movie.id);

    try {
      if (isFav) {
        await fetch(`${API_URL}/favorites/${isFav.id}`, { method: 'DELETE', headers });
      } else {
        await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tmdb_movie_id: movie.id,
            titulo: movie.title,
            poster_path: movie.poster_path
          })
        });
      }
      fetchFavorites();
    } catch (error) {
      console.error(error);
    }
  };

  const addComment = async (movieId) => {
    const text = commentInputs[movieId]?.trim();
    if (!text) return;

    try {
      await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tmdb_movie_id: movieId, texto: text })
      });
      setCommentInputs((current) => ({ ...current, [movieId]: '' }));
      fetchComments();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteComment = async (id) => {
    try {
      await fetch(`${API_URL}/comments/${id}`, { method: 'DELETE', headers });
      fetchComments();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  const displayMovies = activeTab === 'all'
    ? filteredMovies
    : filteredMovies.filter((movie) => favorites.some((favorite) => favorite.tmdb_movie_id === movie.id));

  return (
    <div className="catalog-page">
      <nav className="navbar">
        <div>
          <span className="brand-kicker">Coleção mística</span>
          <h1>Cine Mágico</h1>
        </div>

        <div className="user-panel">
          <span>Olá, {user?.nome}</span>
          <button className="btn btn-ghost" onClick={onLogout}>Sair</button>
        </div>
      </nav>

      <div className="catalog-container">
        <header className="hero-banner">
          <div>
            <p className="eyebrow">Descubra histórias encantadas</p>
            <h2>Filmes que parecem saídos de um conto de fadas.</h2>
          </div>
          <div className="search-box">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar filme..."
            />
          </div>
        </header>

        <div className="tabs">
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            Todos
          </button>
          <button className={`tab ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
            Favoritos
          </button>
        </div>

        <div className="movies-grid">
          {displayMovies.map((movie) => {
            const isFav = favorites.some((favorite) => favorite.tmdb_movie_id === movie.id);
            const movieComments = comments.filter((comment) => comment.tmdb_movie_id === movie.id);

            return (
              <article key={movie.id} className="movie-card">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-poster"
                  />
                ) : (
                  <div className="movie-poster empty-poster">Sem imagem</div>
                )}

                <div className="movie-info">
                  <div className="movie-header">
                    <h3>{movie.title}</h3>
                    <button className={`btn-icon ${isFav ? 'active' : ''}`} onClick={() => toggleFavorite(movie)} title="Favoritar">
                      {isFav ? '♥' : '♡'}
                    </button>
                  </div>

                  <p className="movie-overview">{movie.overview}</p>

                  <div className="movie-meta">
                    <span>{movie.release_date?.slice(0, 4) || '—'}</span>
                    <span>⭐ {movie.vote_average?.toFixed(1) || '0.0'}</span>
                  </div>

                  <div className="comment-section">
                    <input
                      type="text"
                      className="comment-input"
                      placeholder="Escreva sua opinião..."
                      value={commentInputs[movie.id] || ''}
                      onChange={(event) =>
                        setCommentInputs((current) => ({ ...current, [movie.id]: event.target.value }))
                      }
                      onKeyDown={(event) => event.key === 'Enter' && addComment(movie.id)}
                    />

                    <div className="comment-list">
                      {movieComments.length === 0 && <span className="empty-comments">Seja o primeiro a comentar.</span>}
                      {movieComments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <span>{comment.texto}</span>
                          <button onClick={() => deleteComment(comment.id)} aria-label="Excluir comentário">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
